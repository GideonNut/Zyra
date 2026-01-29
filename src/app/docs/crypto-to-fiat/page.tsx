"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CryptoToFiatDoc() {

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
          <h1 className="text-4xl font-bold mb-4">Converting Crypto to Fiat</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: January 29, 2026</span>
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
            <h2 className="text-2xl font-bold mb-3">Why Convert Crypto to Fiat?</h2>
            <p className="text-muted-foreground leading-relaxed">
              After receiving cryptocurrency payments, you may want to convert them to fiat currency (like GHS or USD) for business expenses or personal use. This guide shows you the best ways to do it safely and efficiently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Conversion Methods</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Method 1: Centralized Exchanges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Use regulated cryptocurrency exchanges to convert directly to fiat and withdraw to your bank account.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Fastest method for large amounts</li>
                    <li>Regulated and secure</li>
                    <li>May require KYC verification</li>
                    <li>Standard banking fees apply</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Method 2: Peer-to-Peer (P2P)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Trade directly with other users on P2P marketplaces. Often provides better rates and flexible payment methods.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Potentially better rates</li>
                    <li>Multiple payment methods</li>
                    <li>Requires escrow protection</li>
                    <li>Takes more time than exchanges</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Method 3: ATMs & Local Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Use Bitcoin ATMs or local cryptocurrency services in your area for quick conversions.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Instant conversion</li>
                    <li>Cash in hand immediately</li>
                    <li>Higher fees typically</li>
                    <li>Limited availability</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Recommended P2P Vendors</h2>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We&apos;re curating a list of trusted, verified P2P vendors with real contact information and direct links.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Coming soon: A comprehensive directory of P2P vendors with contact details, rates, and user reviews to help you find the best option for your conversion needs.
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Step-by-Step Conversion Guide</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Step 1: Choose Your Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Select a platform based on your needs (speed, rates, payment methods, location).
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Step 2: Complete Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Most platforms require identity verification. Have your ID and proof of address ready.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Step 3: Create Sell Offer or Find Buyer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    List your crypto for sale or browse offers from other traders.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Step 4: Execute Trade with Escrow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Send crypto to platform&apos;s escrow. Buyer transfers fiat to your account.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Step 5: Release & Withdraw</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Confirm receipt of fiat funds, release crypto from escrow, and withdraw to your bank.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Tips for Safe Conversion</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Always use platforms with escrow protection</li>
              <li>Check trader ratings and reviews before trading</li>
              <li>Start with smaller amounts until you&apos;re comfortable</li>
              <li>Never share your private keys or seed phrases</li>
              <li>Use established, well-known platforms</li>
              <li>Verify payment method details before proceeding</li>
              <li>Keep records of all transactions for tax purposes</li>
              <li>Be wary of offers that seem too good to be true</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Coming Soon: Zyra P2P Platform</h2>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  We&apos;re building a dedicated P2P conversion platform within Zyra. This will allow you to convert your received cryptocurrency directly to fiat without leaving the platform. Stay tuned for updates!
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Have questions about converting crypto to fiat or which platform to use? Our team is ready to help.
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
