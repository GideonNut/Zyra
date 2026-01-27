"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PaymentMethodsDoc() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/docs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Docs
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Article Header */}
        <div className="mb-8">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Payment
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Understanding Payment Methods</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: January 26, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>6 min read</span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <Card className="mb-8 bg-muted/30 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li><a href="#overview" className="text-primary hover:underline">Overview</a></li>
              <li><a href="#mobile-money" className="text-primary hover:underline">Mobile Money Payments</a></li>
              <li><a href="#crypto" className="text-primary hover:underline">Cryptocurrency Payments</a></li>
              <li><a href="#comparison" className="text-primary hover:underline">Payment Methods Comparison</a></li>
              <li><a href="#choosing" className="text-primary hover:underline">Choosing Payment Methods</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6">
          <section id="overview">
            <h2 className="text-2xl font-bold mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zyra supports two primary payment methods, each with its own advantages. Understand both to 
              choose what works best for your business and your customers.
            </p>
          </section>

          <section id="mobile-money">
            <h2 className="text-2xl font-bold mb-3">Mobile Money Payments</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Mobile money is a fast, secure way to receive payments directly to your phone using services 
                like MTN MoMo and Vodafone Cash. These are particularly popular in Africa and Southeast Asia.
              </p>

              <div className="bg-muted/30 p-6 rounded-lg border border-border/50 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">MTN MoMo</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Available in 21+ countries across Africa</li>
                    <li>Send money to any MTN MoMo account instantly</li>
                    <li>Minimal fees (typically 1-2%)</li>
                    <li>Works on any feature phone or smartphone</li>
                  </ul>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="font-semibold mb-2">Vodafone Cash</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Available in Ghana and other countries</li>
                    <li>Direct transfers to Vodafone accounts</li>
                    <li>Fast settlement (within minutes)</li>
                    <li>Secure and regulated by telecom operators</li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground">
                  <strong>How it works:</strong> When you create an invoice with mobile money as a payment option, 
                  your customer receives payment instructions. They simply send the amount to your mobile number via 
                  MoMo or Vodafone Cash, and the money appears in your account instantly.
                </p>
              </div>
            </div>
          </section>

          <section id="crypto">
            <h2 className="text-2xl font-bold mb-3">Cryptocurrency Payments</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Accept payments in major cryptocurrencies including Bitcoin, Ethereum, USDC, USDT, and many others. 
                Crypto payments are perfect for international transactions and tech-savvy customers.
              </p>

              <div className="bg-muted/30 p-6 rounded-lg border border-border/50 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Supported Cryptocurrencies</h4>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <li>✓ Bitcoin (BTC)</li>
                    <li>✓ Ethereum (ETH)</li>
                    <li>✓ USD Coin (USDC)</li>
                    <li>✓ Tether (USDT)</li>
                    <li>✓ Polygon (MATIC)</li>
                    <li>✓ Binance Coin (BNB)</li>
                    <li>✓ Solana (SOL)</li>
                    <li>✓ Avalanche (AVAX)</li>
                  </ul>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="font-semibold mb-2">Key Advantages</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Global payments without borders</li>
                    <li>Low transaction fees</li>
                    <li>Instant settlement</li>
                    <li>Secure blockchain verification</li>
                    <li>No intermediaries needed</li>
                  </ul>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="font-semibold mb-2">How It Works</h4>
                  <p className="text-sm text-muted-foreground">
                    Your invoice includes a QR code and wallet address. The customer scans the QR code or copies the 
                    address to send cryptocurrency. Zyra automatically confirms receipt when the blockchain transaction completes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="comparison">
            <h2 className="text-2xl font-bold mb-3">Payment Methods Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-3 font-semibold">Feature</th>
                    <th className="text-left py-3 px-3 font-semibold">Mobile Money</th>
                    <th className="text-left py-3 px-3 font-semibold">Crypto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="py-3 px-3 text-muted-foreground">Speed</td>
                    <td className="py-3 px-3 text-muted-foreground">Instant</td>
                    <td className="py-3 px-3 text-muted-foreground">Instant to 10 mins</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-muted-foreground">Geographic Reach</td>
                    <td className="py-3 px-3 text-muted-foreground">Limited to specific countries</td>
                    <td className="py-3 px-3 text-muted-foreground">Global</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-muted-foreground">Fees</td>
                    <td className="py-3 px-3 text-muted-foreground">1-2% typically</td>
                    <td className="py-3 px-3 text-muted-foreground">0.5-1% typically</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-muted-foreground">Ease of Use</td>
                    <td className="py-3 px-3 text-muted-foreground">Very easy - phone number required</td>
                    <td className="py-3 px-3 text-muted-foreground">Easy - wallet app required</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-muted-foreground">Transaction Size</td>
                    <td className="py-3 px-3 text-muted-foreground">Limited daily limits</td>
                    <td className="py-3 px-3 text-muted-foreground">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-muted-foreground">Customer Adoption</td>
                    <td className="py-3 px-3 text-muted-foreground">High in specific regions</td>
                    <td className="py-3 px-3 text-muted-foreground">Growing globally</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="choosing">
            <h2 className="text-2xl font-bold mb-3">Choosing Payment Methods</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                The best approach is to enable both payment methods and let customers choose. Here's guidance for different scenarios:
              </p>

              <div className="grid gap-4">
                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Local Business in Ghana?</h4>
                    <p className="text-sm text-muted-foreground">
                      Prioritize mobile money (MTN MoMo, Vodafone Cash) as it's the most familiar to local customers. 
                      Include crypto as an alternative.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">International Customers?</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on crypto payments as they work globally. Mobile money might not be available in your customer's country.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Tech-Savvy Audience?</h4>
                    <p className="text-sm text-muted-foreground">
                      Crypto is ideal. They likely have wallets and understand blockchain transactions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Mixed Customer Base?</h4>
                    <p className="text-sm text-muted-foreground">
                      Always offer both options. Let customers pay in the way they're most comfortable with.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section>
            <p className="text-sm text-muted-foreground italic border-l-4 border-primary/30 pl-4">
              💡 Pro Tip: Set up both payment methods on your account even if you don't immediately use them. 
              You can always enable or disable them per invoice.
            </p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50 flex justify-between">
          <Link href="/docs/create-first-invoice">
            <Button variant="outline">← Creating Your First Invoice</Button>
          </Link>
          <Link href="/docs/mobile-money">
            <Button>Managing Mobile Money →</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
