"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Mail, Phone, Check } from "lucide-react";
import { Bridge } from "thirdweb";
import { client } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner";

interface PaymentLinkSplitFee {
  feePaymentLinkId: string;
  feeLink: string;
  feeAmountWei?: string;
  mainAmountWei?: string;
  feePercentage?: number;
}

interface PaymentLinkDetails {
  id: string;
  title: string;
  description?: string;
  link: string;
  receiver: string;
  amount: string;
  destinationToken: {
    chainId: number;
    address: string;
    symbol: string;
    decimals: number;
    name: string;
    priceUsd?: number;
  };
  createdAt: string;
  /** Present when this invoice uses a separate Zyra processing-fee payment link. */
  splitFee?: PaymentLinkSplitFee;
}

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [paymentLink, setPaymentLink] = useState<PaymentLinkDetails | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [feeQrCodeDataUrl, setFeeQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchPaymentLink = async () => {
      try {
        const response = await fetch(`/api/payment-link/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Invoice not found");
          } else {
            setError("Failed to load invoice");
          }
          return;
        }
        
        const data = await response.json();
        setPaymentLink(data.data);
        
        // Fetch token price
        if (data.data?.destinationToken) {
          try {
            const tokens = await Bridge.tokens({
              client,
              chainId: data.data.destinationToken.chainId,
              tokenAddress: data.data.destinationToken.address,
              limit: 1,
            });
            if (tokens.length > 0 && tokens[0].prices.USD) {
              setTokenPrice(tokens[0].prices.USD);
            }
          } catch (error) {
            console.warn(`Failed to fetch price for token ${data.data.destinationToken.address}:`, error);
          }
        }
        
        // Generate QR code(s)
        if (data.data?.link) {
          const qrDataUrl = await QRCode.toDataURL(data.data.link, {
            width: 180,
            margin: 0,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          setQrCodeDataUrl(qrDataUrl);
        }
        const feeUrl = data.data?.splitFee?.feeLink as string | undefined;
        if (feeUrl) {
          const feeQr = await QRCode.toDataURL(feeUrl, {
            width: 180,
            margin: 0,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          setFeeQrCodeDataUrl(feeQr);
        } else {
          setFeeQrCodeDataUrl(null);
        }
      } catch (error) {
        console.error('Error fetching payment link:', error);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaymentLink();
    }
  }, [id]);

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

  const handleCopyLink = async () => {
    if (!paymentLink?.link) return;
    
    try {
      const text = paymentLink.splitFee?.feeLink
        ? `Merchant payment: ${paymentLink.link}\nZyra processing fee: ${paymentLink.splitFee.feeLink}`
        : paymentLink.link;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleEmailForward = () => {
    if (!paymentLink) return;
    
    const subject = encodeURIComponent(`Invoice - ${paymentLink.title}`);
    const dec = paymentLink.destinationToken.decimals;
    const sym = paymentLink.destinationToken.symbol;
    const baseStr =
      formatUsdAmount(paymentLink.amount, dec, tokenPrice) ||
      `${formatAmount(paymentLink.amount, dec)} ${sym}`;
    const split = paymentLink.splitFee;
    const feeWei = split?.feeAmountWei;
    const feeStr = feeWei
      ? formatUsdAmount(feeWei, dec, tokenPrice) || `${formatAmount(feeWei, dec)} ${sym}`
      : null;
    const totalStr =
      feeWei && tokenPrice
        ? (() => {
            const baseTok = Number(paymentLink.amount) / Math.pow(10, dec);
            const feeTok = Number(feeWei) / Math.pow(10, dec);
            const usd = (baseTok + feeTok) * tokenPrice;
            return usd.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          })()
        : feeWei
          ? `${(parseFloat(formatAmount(paymentLink.amount, dec)) + parseFloat(formatAmount(feeWei, dec))).toFixed(6)} ${sym}`
          : baseStr;

    const payLines = split?.feeLink
      ? `Amount to merchant: ${baseStr}\nZyra processing fee (${split.feePercentage ?? 3}%): ${feeStr}\nTotal: ${totalStr}\n\nPay merchant: ${paymentLink.link}\nPay processing fee: ${split.feeLink}`
      : `Amount: ${baseStr}\n\nPay now: ${paymentLink.link}`;

    const body = encodeURIComponent(
      `Please find the invoice details below:\n\n` +
        `Bill To: ${paymentLink.title}\n` +
        payLines +
        `\n\nIssue Date: ${formatDate(paymentLink.createdAt)}\n` +
        (paymentLink.description ? `Description: ${paymentLink.description}\n` : ''),
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handlePhoneForward = () => {
    if (!paymentLink) return;
    
    const dec = paymentLink.destinationToken.decimals;
    const sym = paymentLink.destinationToken.symbol;
    const baseStr =
      formatUsdAmount(paymentLink.amount, dec, tokenPrice) ||
      `${formatAmount(paymentLink.amount, dec)} ${sym}`;
    const split = paymentLink.splitFee;
    const message = encodeURIComponent(
      split?.feeLink
        ? `Invoice: ${baseStr} + Zyra fee (separate link). Merchant: ${paymentLink.link} Fee: ${split.feeLink}`
        : `Invoice for ${baseStr} is ready. Pay now: ${paymentLink.link}`,
    );
    window.open(`sms:?body=${message}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Invoice</h1>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-muted to-muted/80 p-8 rounded-2xl border-2 border-primary/30 shadow-2xl">
                    <div className="text-center mb-4">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Loading Invoice</h3>
                    </div>
                    <div className="bg-white p-4 rounded-xl mb-4 flex items-center justify-center" style={{ width: 212, height: 212 }}>
                      <Spinner size="lg" />
                    </div>
                    <div className="text-center">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mx-auto"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-4 bg-muted rounded-lg border border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Total Amount</h3>
                  <div className="h-8 w-32 bg-background animate-pulse rounded mx-auto mb-2"></div>
                  <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Loading Details
                  </h2>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-background animate-pulse rounded"></div>
                    <div className="h-4 w-3/4 bg-background animate-pulse rounded"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bill To</h3>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Issue Date</h3>
                    <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !paymentLink) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">{error || "Invoice not found"}</h1>
            <p className="text-muted-foreground">Please check the invoice link and try again</p>
          </div>
        </div>
      </div>
    );
  }

  const dec = paymentLink.destinationToken.decimals;
  const sym = paymentLink.destinationToken.symbol;
  const feeWei = paymentLink.splitFee?.feeAmountWei;
  const baseDisplay =
    formatUsdAmount(paymentLink.amount, dec, tokenPrice) ||
    `${formatAmount(paymentLink.amount, dec)} ${sym}`;
  const feeDisplay =
    feeWei &&
    (formatUsdAmount(feeWei, dec, tokenPrice) || `${formatAmount(feeWei, dec)} ${sym}`);
  const hasSplit = Boolean(paymentLink.splitFee?.feeLink && feeWei);
  const totalDisplay =
    hasSplit && feeWei
      ? tokenPrice
        ? (() => {
            const baseTok = Number(paymentLink.amount) / Math.pow(10, dec);
            const feeTok = Number(feeWei) / Math.pow(10, dec);
            return ((baseTok + feeTok) * tokenPrice).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          })()
        : `${(parseFloat(formatAmount(paymentLink.amount, dec)) + parseFloat(formatAmount(feeWei, dec))).toFixed(6)} ${sym}`
      : baseDisplay;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoice</h1>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        <Card className="bg-card border-border shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              {hasSplit ? (
                <div className="space-y-8">
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">
                      Payment summary
                    </h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">To merchant</span>
                      <span className="font-medium text-foreground">{baseDisplay}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Zyra processing fee ({paymentLink.splitFee?.feePercentage ?? 3}%)
                      </span>
                      <span className="font-medium text-orange-500">{feeDisplay}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold text-lg">{totalDisplay}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      Complete both payments below. The merchant receives the first amount; the second is the platform fee.
                    </p>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-br from-muted to-muted/80 p-6 rounded-2xl border-2 border-primary/30 shadow-xl w-full max-w-[220px]">
                        <div className="text-center mb-3">
                          <h3 className="text-xs font-bold text-primary uppercase tracking-wide">1 · Merchant</h3>
                        </div>
                        <div className="bg-white p-3 rounded-xl mb-3 flex justify-center">
                          {qrCodeDataUrl && (
                            <img
                              src={qrCodeDataUrl}
                              alt="Pay merchant QR"
                              className="w-full h-auto"
                              style={{ width: 160, height: 160 }}
                            />
                          )}
                        </div>
                        <div className="text-center">
                          <a
                            href={paymentLink.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-xs font-medium underline underline-offset-2"
                          >
                            Pay merchant
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-br from-muted to-muted/80 p-6 rounded-2xl border-2 border-orange-500/40 shadow-xl w-full max-w-[220px]">
                        <div className="text-center mb-3">
                          <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wide">2 · Processing fee</h3>
                        </div>
                        <div className="bg-white p-3 rounded-xl mb-3 flex justify-center">
                          {feeQrCodeDataUrl && (
                            <img
                              src={feeQrCodeDataUrl}
                              alt="Pay processing fee QR"
                              className="w-full h-auto"
                              style={{ width: 160, height: 160 }}
                            />
                          )}
                        </div>
                        <div className="text-center">
                          {paymentLink.splitFee?.feeLink && (
                            <a
                              href={paymentLink.splitFee.feeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-500 text-xs font-medium underline underline-offset-2"
                            >
                              Pay processing fee
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-muted to-muted/80 p-8 rounded-2xl border-2 border-primary/30 shadow-2xl">
                      <div className="text-center mb-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Scan to Pay</h3>
                      </div>
                      <div className="bg-white p-4 rounded-xl mb-4">
                        {qrCodeDataUrl && (
                          <img
                            src={qrCodeDataUrl}
                            alt="Invoice QR Code"
                            className="w-full h-auto"
                            style={{ width: 180, height: 180 }}
                          />
                        )}
                      </div>
                      <div className="text-center">
                        <a
                          href={paymentLink.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-2"
                        >
                          Pay Now
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4 bg-muted rounded-lg border border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Total Amount</h3>
                    <p className="text-3xl font-bold text-foreground mb-2">{baseDisplay}</p>
                    <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
                  </div>
                </>
              )}

              {hasSplit && (
                <div className="text-center py-3 bg-muted/80 rounded-lg border border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total Amount</h3>
                  <p className="text-2xl font-bold text-foreground">{totalDisplay}</p>
                </div>
              )}

              {paymentLink.description && (
                <div className="bg-muted p-4 rounded-lg">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Service Description
                  </h2>
                  <p className="text-foreground leading-relaxed text-sm">{paymentLink.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bill To</h3>
                  <p className="text-sm font-semibold text-foreground">{paymentLink.title}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Issue Date</h3>
                  <p className="text-sm font-semibold text-foreground">{formatDate(paymentLink.createdAt)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={handleEmailForward}
                  className="font-medium py-2"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Invoice
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handlePhoneForward}
                    variant="outline"
                    className="font-medium py-2"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="font-medium py-2"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}