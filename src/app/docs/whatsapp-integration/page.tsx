"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function WhatsappIntegrationDoc() {
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
          <h1 className="text-4xl font-bold mb-4">WhatsApp Integration</h1>
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
            <h2 className="text-2xl font-bold mb-3">Send Invoices via WhatsApp</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zyra integrates with WhatsApp, allowing you to send invoices directly to your customers. This increases open rates and provides a convenient payment link in their preferred messaging app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Why Use WhatsApp?</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Higher open rates compared to email</li>
              <li>Reach customers on their preferred platform</li>
              <li>Direct, personal touch to invoicing</li>
              <li>Faster payment collection</li>
              <li>Two-way communication opportunity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Setting Up WhatsApp Integration</h2>
            <div className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Go to your Account Settings</li>
                <li>Navigate to &quot;Integrations&quot;</li>
                <li>Click &quot;Connect WhatsApp&quot;</li>
                <li>Scan the QR code with your WhatsApp account</li>
                <li>Authorize Zyra to send messages</li>
                <li>Confirm and save</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Sending Invoices via WhatsApp</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Method 1: Direct Send</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    After creating an invoice, select &quot;Send via WhatsApp&quot;. The system will:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Prepare a formatted message</li>
                    <li>Include a payment link</li>
                    <li>Send to the customer&apos;s number</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Method 2: Copy Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Copy the invoice link and manually paste it into WhatsApp for more control over the message content.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Method 3: Bulk Send</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select multiple invoices and send them all via WhatsApp at once. Great for bulk invoicing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Message Customization</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can customize the WhatsApp message template to include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Custom greeting message</li>
              <li>Invoice details summary</li>
              <li>Payment method options</li>
              <li>Due date reminder</li>
              <li>Your company information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Best Practices</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Send invoices during business hours</li>
              <li>Follow up with professional payment reminders</li>
              <li>Keep messages concise and clear</li>
              <li>Include all necessary invoice information</li>
              <li>Respect customer preferences and time zones</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If WhatsApp integration isn&apos;t working, we&apos;re here to help.
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
