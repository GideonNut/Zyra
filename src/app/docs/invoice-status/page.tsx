"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function InvoiceStatusDoc() {
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
          <h1 className="text-4xl font-bold mb-4">Understanding Invoice Status</h1>
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
            <h2 className="text-2xl font-bold mb-3">Invoice Lifecycle</h2>
            <p className="text-muted-foreground leading-relaxed">
              Each invoice goes through different states as it moves from creation to payment completion. Understanding these statuses helps you track your invoices and follow up appropriately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Invoice Statuses</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Draft</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Invoice is being created but hasn&apos;t been sent yet. You can edit all details at this stage.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Invoice has been sent to the customer. You&apos;ll be notified when they open it.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Viewed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Customer has opened the invoice. This doesn&apos;t mean they&apos;ve paid, just that they&apos;ve seen it.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Partial</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Customer has paid part of the invoice amount. Remaining balance is still due.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Invoice has been fully paid. The transaction is complete.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Invoice payment deadline has passed but payment hasn&apos;t been received yet.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Cancelled</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Invoice has been cancelled and no longer needs payment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Tracking Your Invoices</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Check your dashboard for a real-time overview of all invoices</li>
              <li>Get notifications when customers open or pay invoices</li>
              <li>Filter invoices by status to focus on what needs attention</li>
              <li>Set up automated reminders for overdue invoices</li>
              <li>Export your invoice data for accounting purposes</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If your invoice statuses aren&apos;t updating correctly, reach out to us.
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
