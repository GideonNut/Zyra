"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ExportingInvoicesDoc() {
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
          <h1 className="text-4xl font-bold mb-4">Exporting and Sharing Invoices</h1>
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
            <h2 className="text-2xl font-bold mb-3">Why Export Invoices?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Exporting invoices is useful for accounting, record-keeping, and sharing with accountants or business partners. Zyra makes it easy to export your invoices in various formats.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Export Formats</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">PDF</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Professional PDF format with your branding. Perfect for sending to customers.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">CSV</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Spreadsheet format for bulk data analysis and accounting software integration.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">JSON</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Structured data format for developers and system integrations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">How to Export Invoices</h2>
            <div className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Go to your invoices list</li>
                <li>Click the &quot;Export&quot; button at the top</li>
                <li>Select your desired format</li>
                <li>Choose date range if needed</li>
                <li>Click &quot;Download&quot;</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Bulk Export Options</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Select multiple invoices and export together</li>
              <li>Filter by status, date, or customer</li>
              <li>Automatic monthly backups of your invoice data</li>
              <li>Schedule recurring exports to your email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Sharing Options</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Share PDF directly via WhatsApp or email</li>
              <li>Generate shareable links for customers</li>
              <li>Download and attach to emails manually</li>
              <li>Print directly from Zyra&apos;s dashboard</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If you have issues exporting invoices, contact us on Telegram.
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
