"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CryptoPaymentsDoc() {
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
              Payment Methods
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Accepting Crypto Payments</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: January 28, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>5 min read</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-3">Why Accept Cryptocurrency?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cryptocurrency payments offer global reach, instant settlements, and lower fees compared to traditional payment methods. Whether your customers are international or local, crypto provides a modern payment option.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Supported Cryptocurrencies</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Bitcoin (BTC)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The original cryptocurrency. High value, widely recognized, and accepted globally.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Ethereum (ETH)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Smart contract platform. Faster transactions and popular for decentralized applications.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Stablecoins (USDC, USDT)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Tied to fiat currency value, reducing volatility. Great for businesses that want crypto benefits without price fluctuation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Other Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We also support MATIC (Polygon), BNB, SOL, and AVAX for diverse payment options.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Setting Up Crypto Payments</h2>
            <div className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Navigate to your payment settings</li>
                <li>Enable &quot;Cryptocurrency Payments&quot;</li>
                <li>Select which cryptocurrencies you&apos;d like to accept</li>
                <li>Connect your crypto wallet (or use Zyra&apos;s wallet management)</li>
                <li>Set your preferred settlement currency (crypto or fiat)</li>
                <li>Save and start receiving payments</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Wallet Management</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Zyra provides secure wallet management for your crypto transactions. You can view your balances, transaction history, and withdraw your funds anytime.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Real-time balance tracking across multiple networks</li>
              <li>Low withdrawal fees</li>
              <li>Automatic currency conversion if needed</li>
              <li>Full transaction history and reporting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Security Considerations</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Keep your private keys safe - never share them</li>
              <li>Use strong passwords for your Zyra account</li>
              <li>Enable two-factor authentication</li>
              <li>Verify wallet addresses before transfers</li>
              <li>Use hardware wallets for large amounts</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If you have questions about crypto payments or wallet setup, contact us on Telegram.
            </p>
            <a
              href="https://t.me/GideonDern"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Send className="h-4 w-4" />
              Message GideonDern on Telegram
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
