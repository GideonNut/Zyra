"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MobileMoneyDoc() {
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
          <h1 className="text-4xl font-bold mb-4">Mobile Money Payments</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: January 28, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>4 min read</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-3">What is Mobile Money?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mobile Money is a payment service that allows customers to send and receive money using their mobile phones. It&apos;s popular across Africa and provides a quick, secure way to transfer funds without needing a traditional bank account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Supported Providers</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">MTN MoMo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    MTN Mobile Money is available in multiple countries. Customers can pay using their MTN phone number with a simple PIN.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Vodafone Cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Vodafone&apos;s mobile money solution offers seamless payments for Vodafone subscribers. Easy to use and widely available.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">AirtelTigo Money</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AirtelTigo Money provides mobile payment services across their network. Quick transactions with competitive rates.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">How to Enable Mobile Money</h2>
            <div className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Go to your company settings</li>
                <li>Navigate to Payment Methods</li>
                <li>Toggle on &quot;Mobile Money&quot;</li>
                <li>Select which providers you want to accept</li>
                <li>Save your preferences</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Best Practices</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Always provide clear payment instructions to customers</li>
              <li>Keep transaction fees transparent</li>
              <li>Enable multiple providers to give customers options</li>
              <li>Monitor your mobile money account regularly</li>
              <li>Set up withdrawal schedules to your bank account</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If you encounter any issues with mobile money setup or payments, reach out to us on Telegram.
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
