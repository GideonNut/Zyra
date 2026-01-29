"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CurrencyConversionDoc() {
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
              Features
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Currency Conversion</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: January 28, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>3 min read</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-3">Multi-Currency Support</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zyra supports multiple currencies so you can invoice customers in their preferred currency or your local currency. Automatic conversion handles the complexity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Supported Currencies</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold mb-2">Fiat Currencies</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ghana Cedi (GHS)</li>
                  <li>US Dollar (USD)</li>
                  <li>Euro (EUR)</li>
                  <li>British Pound (GBP)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cryptocurrencies</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bitcoin (BTC)</li>
                  <li>Ethereum (ETH)</li>
                  <li>USDC / USDT</li>
                  <li>And more...</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">How Conversion Works</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                When you create an invoice, you can specify the currency. If the customer pays in a different currency:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>The system calculates current exchange rates</li>
                <li>Shows the customer the amount in their currency</li>
                <li>Converts payment to your preferred settlement currency</li>
                <li>Deposits funds in your account</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Exchange Rates</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Real-time rates updated every minute</li>
              <li>Transparent fee structure</li>
              <li>Competitive rates compared to banks</li>
              <li>View historical exchange rates in your dashboard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Setting Your Settlement Currency</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                You can configure which currency you&apos;d like to receive payments in:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Go to Account Settings</li>
                <li>Select &quot;Payment Settings&quot;</li>
                <li>Choose your preferred settlement currency</li>
                <li>Set up your bank account or wallet</li>
                <li>Confirm and save</li>
              </ol>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Questions about currency conversion? We&apos;re here to help.
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
