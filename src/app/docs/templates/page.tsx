"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TemplatesDoc() {
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
              Customization
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Invoice Templates</h1>
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
            <h2 className="text-2xl font-bold mb-3">Customizing Your Invoices</h2>
            <p className="text-muted-foreground leading-relaxed">
              Make your invoices reflect your brand. Zyra provides flexible templating options so every invoice looks professional and consistent with your company&apos;s identity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Template Options</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Modern</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Clean, contemporary design with minimalist styling. Perfect for tech companies and modern businesses.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Classic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Traditional invoice format with all essential information clearly organized.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Elegant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sophisticated design with premium styling. Ideal for luxury and professional services.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Colorful</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Vibrant design options to match your brand colors and personality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Brand Customization</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Personalize your invoices with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Company logo placement</li>
                <li>Brand colors and accent colors</li>
                <li>Custom fonts and typography</li>
                <li>Company contact information</li>
                <li>Invoice number formatting</li>
                <li>Custom footer messages</li>
                <li>Payment instruction customization</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">How to Change Templates</h2>
            <div className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Go to your Company Settings</li>
                <li>Click on &quot;Invoice Templates&quot;</li>
                <li>Browse available templates</li>
                <li>Click &quot;Preview&quot; to see how it looks</li>
                <li>Click &quot;Select&quot; to choose your template</li>
                <li>Customize colors, logos, and information</li>
                <li>Save your template</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Template Variables</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our templates use smart variables that automatically populate with your invoice data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>&apos;Invoice Number&apos; - Auto-incremented invoice ID</li>
              <li>&apos;Customer Name&apos; - Dynamic customer information</li>
              <li>&apos;Invoice Date&apos; - Current or custom date</li>
              <li>&apos;Due Date&apos; - Payment deadline</li>
              <li>&apos;Line Items&apos; - Product/service details</li>
              <li>&apos;Total Amount&apos; - Calculated sum with taxes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Best Practices</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Keep designs clean and professional</li>
              <li>Ensure all text is readable and clear</li>
              <li>Use your brand colors consistently</li>
              <li>Include all required legal information</li>
              <li>Test templates before sending to customers</li>
              <li>Update templates if your branding changes</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Questions about templates? Contact us on Telegram.
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
