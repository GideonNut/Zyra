"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SecurityDoc() {
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
              Security
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Security & Data Protection</h1>
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
            <h2 className="text-2xl font-bold mb-3">Security at Zyra</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take security seriously. Your financial data and personal information are protected with industry-leading encryption and security practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Encryption & Data Protection</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>End-to-end encryption for all transactions</li>
              <li>256-bit SSL/TLS encryption for data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Compliance with international data protection standards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Account Security</h2>
            <div className="space-y-4">
              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA on your account for an extra layer of protection. We support authenticator apps and SMS.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Strong Passwords</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Use strong, unique passwords. Change them regularly and never share with anyone.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Session Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your session automatically logs out after 30 minutes of inactivity for security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Payment Security</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>PCI DSS compliance for payment processing</li>
              <li>Tokenized payment processing - no full card numbers stored</li>
              <li>Fraud detection systems monitoring transactions</li>
              <li>Secure API keys for integrations</li>
              <li>Never store sensitive payment data on our servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Cryptocurrency Security</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Multi-signature wallets for crypto storage</li>
              <li>Cold storage for majority of funds</li>
              <li>Insurance coverage for digital assets</li>
              <li>Regular security reviews by blockchain experts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Best Practices for You</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Enable two-factor authentication immediately</li>
              <li>Use unique passwords for each account</li>
              <li>Don&apos;t share your login credentials</li>
              <li>Be cautious of phishing emails</li>
              <li>Update your browser and security software</li>
              <li>Review your account activity regularly</li>
              <li>Log out when using shared computers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">Incident Response</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you believe your account has been compromised or notice suspicious activity, contact us immediately. We have a dedicated security team ready to help.
            </p>
          </section>

          {/* Troubleshooting */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Security Concerns?</h3>
            <p className="text-muted-foreground mb-4">
              If you have security concerns, reach out to us on Telegram immediately.
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
