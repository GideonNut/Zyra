"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CreateFirstInvoiceDoc() {
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
              Guides
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Creating Your First Invoice</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: January 27, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>8 min read</span>
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
              <li><a href="#accessing" className="text-primary hover:underline">Accessing the Invoice Creator</a></li>
              <li><a href="#customer-info" className="text-primary hover:underline">Customer Information</a></li>
              <li><a href="#invoice-details" className="text-primary hover:underline">Invoice Details</a></li>
              <li><a href="#payment-settings" className="text-primary hover:underline">Payment Settings</a></li>
              <li><a href="#sending" className="text-primary hover:underline">Sending Your Invoice</a></li>
              <li><a href="#tips" className="text-primary hover:underline">Pro Tips</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6">
          <section id="overview">
            <h2 className="text-2xl font-bold mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Creating an invoice in Zyra is intuitive and takes just a few minutes. This guide walks you through 
              every step to ensure you create professional invoices that get paid faster.
            </p>
          </section>

          <section id="accessing">
            <h2 className="text-2xl font-bold mb-3">Accessing the Invoice Creator</h2>
            <div className="bg-muted/30 p-6 rounded-lg border border-border/50 space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>Method 1: Quick Create</strong><br/>
                Click the "+ Create Invoice" button in the top right corner of the dashboard.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Method 2: From Dashboard</strong><br/>
                Navigate to your dashboard and click "New Invoice" from the invoices section.
              </p>
            </div>
          </section>

          <section id="customer-info">
            <h2 className="text-2xl font-bold mb-3">Customer Information</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Start by entering your customer's details. This information will appear on the invoice.
              </p>
              
              <div className="bg-muted/20 p-4 rounded-lg border border-border/50 space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Customer Name</h4>
                  <p className="text-xs text-muted-foreground">Enter the full name or business name of your customer</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Email Address</h4>
                  <p className="text-xs text-muted-foreground">This is where the invoice will be sent. Make sure it's correct!</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Phone Number (Optional)</h4>
                  <p className="text-xs text-muted-foreground">Useful for WhatsApp reminders or direct contact</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Business Address (Optional)</h4>
                  <p className="text-xs text-muted-foreground">Customer's business address for formal invoices</p>
                </div>
              </div>
            </div>
          </section>

          <section id="invoice-details">
            <h2 className="text-2xl font-bold mb-3">Invoice Details</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Enter the specifics of what you're invoicing for.
              </p>

              <div className="grid gap-4">
                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Invoice Number</h4>
                    <p className="text-sm text-muted-foreground">
                      Auto-generated based on your numbering format. You can customize this in settings.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      Describe the goods or services provided. Example: "Website Design - 3 pages"
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Amount</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter the total amount. You can add line items for detailed breakdowns.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Currency</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose GHS (Ghana Cedi) or USD (US Dollars). Rates are converted automatically for crypto payments.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Due Date</h4>
                    <p className="text-sm text-muted-foreground">
                      Set when payment is expected. Reminders can be automatically sent to customers.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="payment-settings">
            <h2 className="text-2xl font-bold mb-3">Payment Settings</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Choose how your customer will pay you. Zyra supports multiple payment methods.
              </p>

              <div className="bg-muted/30 p-6 rounded-lg border border-border/50 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Mobile Money</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay via MTN MoMo or Vodafone Cash. They'll receive payment instructions in the invoice.
                  </p>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="font-semibold mb-2">Cryptocurrency</h4>
                  <p className="text-sm text-muted-foreground">
                    Accept payments in ETH, BTC, USDC, USDT, and other tokens. The invoice will include a QR code for easy payment.
                  </p>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="font-semibold mb-2">Multiple Methods</h4>
                  <p className="text-sm text-muted-foreground">
                    You can allow customers to choose their preferred payment method when they receive the invoice.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="sending">
            <h2 className="text-2xl font-bold mb-3">Sending Your Invoice</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Once you've filled in all the details, you can send your invoice in multiple ways:
              </p>

              <div className="grid gap-4">
                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">1. Email</h4>
                    <p className="text-sm text-muted-foreground">
                      The invoice is automatically sent to your customer's email address with a payment link.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">2. WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">
                      If you have WhatsApp integration enabled, send the invoice directly to their WhatsApp.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">3. Share Link</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate a shareable link that you can send through any method - SMS, Slack, Teams, etc.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="tips">
            <h2 className="text-2xl font-bold mb-3">Pro Tips</h2>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>Always double-check customer details before sending</li>
              <li>Set realistic due dates (7-30 days is typical)</li>
              <li>Include clear descriptions - it reduces payment disputes</li>
              <li>Use notes to thank customers or add terms and conditions</li>
              <li>Enable payment reminders so customers don't forget</li>
              <li>Keep your payment methods updated to ensure customers can pay</li>
            </ul>
          </section>

          <section>
            <p className="text-sm text-muted-foreground italic border-l-4 border-primary/30 pl-4">
              💡 Tip: After sending, you can track your invoice's status in the dashboard. You'll be notified 
              instantly when your customer opens the invoice or makes a payment!
            </p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50 flex justify-between">
          <Link href="/docs/getting-started">
            <Button variant="outline">← Getting Started</Button>
          </Link>
          <Link href="/docs/payment-methods">
            <Button>Payment Methods →</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
