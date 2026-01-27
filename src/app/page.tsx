"use client";

import { ConnectButton } from "@/components/connect-button";
import { DisconnectButton } from "@/components/disconnect-button";
import { PaymentForm } from "@/components/payment-form";
import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { Bridge } from "thirdweb";
import { client } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Plus, Check, Clock, Settings } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { InvoicePDFGenerator } from "@/components/invoice-pdf-generator";
import { AdvancedFilter, FilterState } from "@/components/ui/advanced-filter";
import { ExportInvoices } from "@/components/export-invoices";
import { filterInvoices, sortInvoices, Invoice } from "@/lib/invoice-filtering";
import { useBrand } from "@/contexts/brand-context";
import { useTheme } from "@/contexts/theme-context";
import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TrendingUp } from "lucide-react";
import { ScrollAnimate } from "@/components/scroll-animate";

interface PaymentLink {
  id: string;
  title: string;
  description?: string;
  link: string;
  receiver: string;
  amount: string;
  destinationToken: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  createdAt: string;
  priceUsd?: number;
}

interface Payment {
  id: string;
  paymentLinkId: string;
  status: string;
  amount: string;
  createdAt: string;
}

interface MobileMoneyInvoice {
  id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: 'mobile_money';
  reference: string;
  customer: {
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    customer_code?: string;
    metadata?: Record<string, unknown>;
    risk_action?: string;
    international_format_phone?: string;
  };
  paid_at: string;
  createdAt: string;
  metadata: {
    paystack_reference: string;
    paystack_transaction_id: string;
    customer_name?: string;
    phone_number?: string;
    original_amount: number;
    original_currency: string;
  };
}

export default function Home() {
  const account = useActiveAccount();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [mobileMoneyInvoices, setMobileMoneyInvoices] = useState<MobileMoneyInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    paymentMethod: [],
    dateRange: { from: undefined, to: undefined },
    amountRange: { min: "", max: "" },
    customer: "",
  });
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { brand, slug } = useBrand();
  const { theme } = useTheme();

  useEffect(() => {
    if (account?.address) {
      fetchData();
    }
  }, [account?.address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch mobile money invoices independently of wallet connection
  useEffect(() => {
    const fetchMobileMoneyInvoices = async () => {
      try {
        // Always use company-specific endpoint when slug is available for proper isolation
        const url = slug
          ? `/api/companies/${slug}/mobile-money-invoices`
          : '/api/mobile-money-invoices?companySlug=';
        const mobileMoneyResponse = await fetch(url);
        const mobileMoneyData = await mobileMoneyResponse.json();
        setMobileMoneyInvoices(mobileMoneyData.invoices || []);
      } catch (error) {
        console.error('Error fetching mobile money invoices:', error);
      }
    };

    fetchMobileMoneyInvoices();
  }, [brand?.id, slug]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch payment links for this address
      const linksResponse = await fetch(`/api/payment-links?receiver=${account!.address}`);
      const linksData = await linksResponse.json();

      // Fetch all payments
      const paymentsResponse = await fetch('/api/payments');
      const paymentsData = await paymentsResponse.json();


      // Get unique tokens to fetch prices for
      const links = linksData.data || [];
      const uniqueTokens = links.reduce((acc: Array<{chainId: number, address: string}>, link: PaymentLink) => {
        const token = link.destinationToken;
        const exists = acc.find(t => t.chainId === token.chainId && t.address === token.address);
        if (!exists) {
          acc.push({ chainId: token.chainId, address: token.address });
        }
        return acc;
      }, []);

      // Fetch token prices
      const tokenPrices: { [key: string]: number } = {};
      for (const token of uniqueTokens) {
        try {
          const tokens = await Bridge.tokens({
            client,
            chainId: token.chainId,
            tokenAddress: token.address,
            limit: 1,
          });
          if (tokens.length > 0 && tokens[0].prices.USD) {
            const key = `${token.chainId}-${token.address}`;
            tokenPrices[key] = tokens[0].prices.USD;
          }
        } catch (error) {
          console.warn(`Failed to fetch price for token ${token.address} on chain ${token.chainId}:`, error);
        }
      }

      // Merge price data into payment links
      const linksWithPrices = links.map((link: PaymentLink) => ({
        ...link,
        priceUsd: tokenPrices[`${link.destinationToken.chainId}-${link.destinationToken.address}`] || undefined,
      }));

      setPaymentLinks(linksWithPrices);
      setPayments(paymentsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (linkId: string) => {
    const payment = payments.find(p => p.paymentLinkId === linkId);
    return payment ? 'Paid' : 'Unpaid';
  };

  const formatAmount = (amount: string, decimals: number = 18) => {
    const num = Number(amount) / Math.pow(10, decimals);
    return parseFloat(num.toFixed(6)).toString();
  };

  const formatUsdAmount = (amount: string, decimals: number = 18, priceUsd?: number) => {
    if (!priceUsd) return null;
    const tokenAmount = Number(amount) / Math.pow(10, decimals);
    const usdAmount = tokenAmount * priceUsd;
    return usdAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  const handleInvoiceCreated = () => {
    setIsModalOpen(false);
    fetchData(); // Refresh the data
  };

  // Combine all invoices for filtering
  const getAllInvoices = (): Invoice[] => {
    const cryptoInvoices: Invoice[] = paymentLinks.map(link => ({
      id: link.id,
      title: link.title,
      description: link.description,
      amount: link.amount,
      paymentMethod: "crypto",
      status: getPaymentStatus(link.id),
      createdAt: link.createdAt,
      destinationToken: link.destinationToken,
      priceUsd: link.priceUsd,
    }));

    const mobileInvoices: Invoice[] = mobileMoneyInvoices.map(invoice => ({
      id: invoice.id,
      title: invoice.title,
      description: invoice.description,
      amount: invoice.amount,
      paymentMethod: "mobile_money",
      status: "paid",
      createdAt: invoice.createdAt,
      paidAt: invoice.paid_at,
      reference: invoice.reference,
      metadata: invoice.metadata,
    }));

    return [...cryptoInvoices, ...mobileInvoices];
  };

  // Apply filters and sorting
  const filteredAndSortedInvoices = sortInvoices(
    filterInvoices(getAllInvoices(), filters),
    sortBy,
    sortOrder
  );

  const clearFilters = () => {
    setFilters({
      search: "",
      status: [],
      paymentMethod: [],
      dateRange: { from: undefined, to: undefined },
      amountRange: { min: "", max: "" },
      customer: "",
    });
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {brand?.assets?.logo?.[theme] ? (
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">Zyra for</span>
                  <Image
                    src={brand.assets.logo[theme]!}
                    alt={brand.name || "Company"}
                    width={120}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="size-6" />
                  <h1 className="text-xl font-bold">Zyra</h1>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <ScrollAnimate delay={0}>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight pb-2">
                  Do you guys take momo?
                </h1>
              </ScrollAnimate>
              <ScrollAnimate delay={200}>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
                  Says every Ghanaian when they want to pay for something
                </p>
              </ScrollAnimate>
              <ScrollAnimate delay={400}>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6 leading-tight pb-2">
                  Yes, We even take Crypto!
                </h2>
              </ScrollAnimate>
              <ScrollAnimate delay={600}>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Says every Zyra user
                </p>
              </ScrollAnimate>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
              {/* Left: Features */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Mobile Money & Crypto</h3>
                    <p className="text-muted-foreground">Accept payments through MTN MoMo, Vodafone Cash, and crypto wallets.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Ghana Cedi Support</h3>
                    <p className="text-muted-foreground">Price everything in Ghana Cedi with real-time conversion rates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Instant Payments</h3>
                    <p className="text-muted-foreground">Get paid instantly through mobile money or crypto with real-time tracking.</p>
                  </div>
                </div>
              </div>

              {/* Right: Connection */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-3">Try it out</h2>
                  <p className="text-muted-foreground">Connect your wallet to start creating invoices</p>
                </div>

                <div className="space-y-4">
                  <ConnectButton id="email" isEmailSignIn variant="outline" className="flex items-center justify-center gap-2 h-10 px-3 w-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Sign in with Email
                  </ConnectButton>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <ConnectButton id="io.metamask" variant="outline" className="flex items-center justify-center gap-2 h-10 px-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
                      MetaMask
                    </ConnectButton>
                    <ConnectButton id="com.coinbase.wallet" variant="outline" className="flex items-center justify-center gap-2 h-10 px-3">
                      <img src="https://avatars.githubusercontent.com/u/18060234?s=280&v=4" alt="Coinbase" className="w-5 h-5 rounded" />
                      Coinbase
                    </ConnectButton>
                    <ConnectButton id="io.rabby" variant="outline" className="flex items-center justify-center gap-2 h-10 px-3">
                      <img src="https://rabby.io/assets/images/logo-128.png" alt="Rabby" className="w-5 h-5 rounded" />
                      Rabby
                    </ConnectButton>
                    <ConnectButton id="me.rainbow" variant="outline" className="flex items-center justify-center gap-2 h-10 px-3">
                      <img src="https://rainbow.me/favicon.ico" alt="Rainbow" className="w-5 h-5 rounded" />
                      Rainbow
                    </ConnectButton>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Secure connection through your wallet
                  </p>
                </div>
              </div>
            </div>

            {/* Supported Currencies Marquee */}
            <ScrollAnimate>
              <div className="mb-20">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-3">Supported Currencies</h2>
                </div>
                <div className="relative overflow-hidden">
                <Marquee pauseOnHover className="[--duration:80s] [--gap:3rem]">
                  {[
                    { 
                      symbol: "MTN", 
                      name: "MTN MoMo", 
                      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/MTN_Logo.svg/512px-MTN_Logo.svg.png" 
                    },
                    { 
                      symbol: "VOD", 
                      name: "Vodafone Cash", 
                      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Vodafone_logo_red.svg/512px-Vodafone_logo_red.svg.png" 
                    },
                    { 
                      symbol: "AT", 
                      name: "AirtelTigo", 
                      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Airtel_logo.svg/512px-Airtel_logo.svg.png" 
                    },
                    { 
                      symbol: "GHS", 
                      name: "Ghana Cedi", 
                      logo: "https://flagcdn.com/w40/gh.png" 
                    },
                    { 
                      symbol: "USD", 
                      name: "US Dollar", 
                      logo: "https://flagcdn.com/w40/us.png" 
                    },
                    { 
                      symbol: "ETH", 
                      name: "Ethereum", 
                      logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" 
                    },
                    { 
                      symbol: "BTC", 
                      name: "Bitcoin", 
                      logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" 
                    },
                    { 
                      symbol: "USDC", 
                      name: "USD Coin", 
                      logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" 
                    },
                    { 
                      symbol: "USDT", 
                      name: "Tether", 
                      logo: "https://assets.coingecko.com/coins/images/325/small/Tether.png" 
                    },
                    { 
                      symbol: "MATIC", 
                      name: "Polygon", 
                      logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" 
                    },
                    { 
                      symbol: "BNB", 
                      name: "BNB", 
                      logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" 
                    },
                    { 
                      symbol: "SOL", 
                      name: "Solana", 
                      logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" 
                    },
                    { 
                      symbol: "AVAX", 
                      name: "Avalanche", 
                      logo: "https://assets.coingecko.com/coins/images/12559/small/avalanche-avax-logo.png" 
                    },
                  ].map((currency, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 px-2"
                    >
                      <img 
                        src={currency.logo} 
                        alt={currency.name}
                        className="w-12 h-12 rounded-full object-cover opacity-60"
                        onError={(e) => {
                          // Fallback to a simple circle if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="font-bold text-primary">{currency.symbol}</div>
                        <div className="text-xs text-muted-foreground">{currency.name}</div>
                      </div>
                    </div>
                  ))}
                </Marquee>
                </div>
              </div>
            </ScrollAnimate>

            {/* Features Grid */}
            <ScrollAnimate delay={100}>
              <div className="mb-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">Why Choose Zyra?</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      Real-time Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Track all your invoices and payments in real-time. Know exactly when payments are received.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      Mobile Money Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Accept payments through MTN MoMo, Vodafone Cash, and other mobile money services.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      Easy Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Simple dashboard to create, manage, and export invoices. Filter and search with ease.
                    </p>
                  </CardContent>
                </Card>
                </div>
              </div>
            </ScrollAnimate>

            {/* FAQs Section */}
            <div className="mb-20">
              <ScrollAnimate delay={0}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground text-lg">
                    Everything you need to know about Zyra
                  </p>
                </div>
              </ScrollAnimate>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full space-y-3">
                  <ScrollAnimate delay={100}>
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger className="text-left bg-muted/50 hover:bg-muted rounded-lg px-6 py-4 [&[data-state=open]]:bg-muted [&[data-state=open]]:rounded-b-none">
                        <span className="font-medium">How do I create an invoice?</span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/50 rounded-b-lg px-6 py-4 text-muted-foreground">
                        Simply connect your wallet and click &quot;Create Invoice&quot;. Fill in the customer details, amount, and payment method. You can choose between mobile money or crypto payments. Once created, you&apos;ll get a shareable link and QR code.
                      </AccordionContent>
                    </AccordionItem>
                  </ScrollAnimate>
                  <ScrollAnimate delay={200}>
                    <AccordionItem value="item-2" className="border-none">
                      <AccordionTrigger className="text-left bg-muted/50 hover:bg-muted rounded-lg px-6 py-4 [&[data-state=open]]:bg-muted [&[data-state=open]]:rounded-b-none">
                        <span className="font-medium">What payment methods are supported?</span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/50 rounded-b-lg px-6 py-4 text-muted-foreground">
                        We support mobile money (MTN MoMo, Vodafone Cash) and cryptocurrency payments. For crypto, you can accept payments in various tokens including ETH, BTC, USDC, USDT, and many more across multiple blockchains.
                      </AccordionContent>
                    </AccordionItem>
                  </ScrollAnimate>
                  <ScrollAnimate delay={300}>
                    <AccordionItem value="item-3" className="border-none">
                      <AccordionTrigger className="text-left bg-muted/50 hover:bg-muted rounded-lg px-6 py-4 [&[data-state=open]]:bg-muted [&[data-state=open]]:rounded-b-none">
                        <span className="font-medium">How do I receive payments?</span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/50 rounded-b-lg px-6 py-4 text-muted-foreground">
                        For mobile money payments, funds are sent directly to your configured mobile money account. For crypto payments, funds are sent to your connected wallet address. You&apos;ll receive instant notifications when payments are completed.
                      </AccordionContent>
                    </AccordionItem>
                  </ScrollAnimate>
                  <ScrollAnimate delay={400}>
                    <AccordionItem value="item-4" className="border-none">
                      <AccordionTrigger className="text-left bg-muted/50 hover:bg-muted rounded-lg px-6 py-4 [&[data-state=open]]:bg-muted [&[data-state=open]]:rounded-b-none">
                        <span className="font-medium">Is Zyra secure?</span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/50 rounded-b-lg px-6 py-4 text-muted-foreground">
                        Yes, Zyra uses bank-level encryption and security measures. We never store your payment credentials or private keys. All crypto transactions are handled through secure wallet connections, and mobile money payments are processed through trusted payment providers.
                      </AccordionContent>
                    </AccordionItem>
                  </ScrollAnimate>
                  <ScrollAnimate delay={500}>
                    <AccordionItem value="item-5" className="border-none">
                      <AccordionTrigger className="text-left bg-muted/50 hover:bg-muted rounded-lg px-6 py-4 [&[data-state=open]]:bg-muted [&[data-state=open]]:rounded-b-none">
                        <span className="font-medium">Can I export my invoices?</span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/50 rounded-b-lg px-6 py-4 text-muted-foreground">
                        Yes! You can export your invoices as PDFs or Excel files. Use the export feature in your dashboard to download individual invoices or bulk export all your invoices for accounting purposes.
                      </AccordionContent>
                    </AccordionItem>
                  </ScrollAnimate>
                  <ScrollAnimate delay={600}>
                    <AccordionItem value="item-6" className="border-none">
                      <AccordionTrigger className="text-left bg-muted/50 hover:bg-muted rounded-lg px-6 py-4 [&[data-state=open]]:bg-muted [&[data-state=open]]:rounded-b-none">
                        <span className="font-medium">What currencies can I use?</span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/50 rounded-b-lg px-6 py-4 text-muted-foreground">
                        You can price your invoices in Ghana Cedi (GHS) or US Dollars (USD). The system automatically handles currency conversion for crypto payments based on real-time exchange rates.
                      </AccordionContent>
                    </AccordionItem>
                  </ScrollAnimate>
                </Accordion>
              </div>
            </div>

          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            {brand?.assets?.logo?.[theme] ? (
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">Zyra for</span>
                <Image
                  src={brand.assets.logo[theme]!}
                  alt={brand.name || "Company"}
                  width={120}
                  height={24}
                  className="h-6 w-auto"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="size-6" />
                <h1 className="text-xl font-bold">Zyra</h1>
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage your invoices and track payments</p>
          </div>

          <div className="space-y-6">
            {/* Loading Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="px-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                        <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
                      </div>
                      <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading Table */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Recent Invoices</CardTitle>
                  <Spinner size="sm" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                        <TableHead className="font-semibold">Bill To</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Chain</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3].map((i) => (
                        <TableRow key={i}>
                          <TableCell className="py-4">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="h-5 w-12 bg-muted animate-pulse rounded-full"></div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          {brand?.assets?.logo?.[theme] ? (
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">Zyra for</span>
              <Image
                src={brand.assets.logo[theme]!}
                alt={brand.name || "Company"}
                width={120}
                height={24}
                className="h-6 w-auto"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FileText className="size-6" />
              <h1 className="text-xl font-bold">Zyra</h1>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/admin', '_blank')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
            <ThemeToggle />
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                </DialogHeader>
                <PaymentForm onSuccess={handleInvoiceCreated} />
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {account.address?.slice(0, 6)}...{account.address?.slice(-4)}
              </span>
              <DisconnectButton variant="outline" size="sm">
                Disconnect
              </DisconnectButton>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your invoices and track payments</p>
        </div>

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                    <p className="text-3xl font-bold">{paymentLinks.length + mobileMoneyInvoices.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid</p>
                    <p className="text-3xl font-bold text-green-600">
                      {paymentLinks.filter(link => getPaymentStatus(link.id) === 'Paid').length + mobileMoneyInvoices.length}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-600/20 border border-green-600/30 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold">
                      {paymentLinks.filter(link => getPaymentStatus(link.id) === 'Unpaid').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filter */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Filter & Search Invoices</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <AdvancedFilter
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
              />
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-xl font-semibold">Invoices</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {filteredAndSortedInvoices.length} of {getAllInvoices().length} invoice{getAllInvoices().length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ExportInvoices invoices={filteredAndSortedInvoices} />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order as "asc" | "desc");
                    }}
                    aria-label="Sort invoices"
                    className="px-3 py-1 text-sm border border-border rounded-md bg-background"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                    <option value="customer-asc">Customer (A-Z)</option>
                    <option value="customer-desc">Customer (Z-A)</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                      <TableHead className="font-semibold">Bill To</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Method</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                            <div>
                              <p className="font-medium text-muted-foreground">
                                {getAllInvoices().length === 0 ? "No invoices yet" : "No invoices match your filters"}
                              </p>
                              <p className="text-sm text-muted-foreground/70">
                                {getAllInvoices().length === 0 
                                  ? "Create your first invoice to get started" 
                                  : "Try adjusting your search criteria"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedInvoices.map((invoice) => (
                        <TableRow
                          key={invoice.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors border-border/50"
                          onClick={() => {
                            if (invoice.paymentMethod === "mobile_money") {
                              window.open(`/invoice/${invoice.id}`, '_blank');
                            } else {
                              window.open(`/${invoice.id}`, '_blank');
                            }
                          }}
                        >
                          <TableCell className="font-medium py-4">
                            {invoice.paymentMethod === "mobile_money" 
                              ? invoice.metadata?.customer_name || invoice.title
                              : invoice.title
                            }
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-mono font-medium">
                              {invoice.paymentMethod === "mobile_money" 
                                ? `${invoice.metadata?.original_amount} ${invoice.metadata?.original_currency}`
                                : (invoice.priceUsd 
                                  ? formatUsdAmount(invoice.amount, invoice.destinationToken?.decimals, invoice.priceUsd) ||
                                    `${formatAmount(invoice.amount, invoice.destinationToken?.decimals)} ${invoice.destinationToken?.symbol}`
                                  : `${formatAmount(invoice.amount, invoice.destinationToken?.decimals)} ${invoice.destinationToken?.symbol}`
                                )
                              }
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="text-xs">
                              {invoice.paymentMethod === "mobile_money" 
                                ? "Mobile Money"
                                : `Crypto (Chain ${invoice.destinationToken?.chainId})`
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant={invoice.status === 'Paid' ? 'default' : 'secondary'}
                              className={invoice.status === 'Paid' ? 'bg-green-600/20 hover:bg-green-600/20 border border-green-600 text-green-600' : ''}
                            >
                              {invoice.status === 'Paid' && <Check className="h-3 w-3 mr-1" />}
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-muted-foreground">
                            {formatDate(invoice.createdAt)}
                          </TableCell>
                          <TableCell className="py-4">
                            {invoice.paymentMethod === "mobile_money" ? (
                              <InvoicePDFGenerator invoice={invoice as unknown as MobileMoneyInvoice} />
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert('PDF generation for crypto payments coming soon!');
                                }}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
