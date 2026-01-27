"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function GettingStartedDoc() {
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
              Basics
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Getting Started with Zyra</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: January 27, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>5 min read</span>
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
              <li><a href="#what-is-zyra" className="text-primary hover:underline">What is Zyra?</a></li>
              <li><a href="#create-account" className="text-primary hover:underline">Creating Your Account</a></li>
              <li><a href="#first-steps" className="text-primary hover:underline">First Steps</a></li>
              <li><a href="#next" className="text-primary hover:underline">What&apos;s Next?</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6">
          <section id="what-is-zyra">
            <h2 className="text-2xl font-bold mb-3">What is Zyra?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zyra is a modern invoice management platform that helps you create, send, and track invoices 
              with ease. Whether you&apos;re a freelancer, small business owner, or entrepreneur, Zyra simplifies 
              the invoicing process and supports multiple payment methods including mobile money and cryptocurrency.
            </p>
          </section>

          <section id="create-account">
            <h2 className="text-2xl font-bold mb-3">Creating Your Account</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Getting started with Zyra is quick and easy. Follow these steps:
              </p>
              
              <div className="bg-muted/30 p-6 rounded-lg border border-border/50 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 1: Sign Up</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill out the &quot;Interested in Zyra?&quot; form on our home page with your email and phone number. 
                    Our team will reach out to you within an hour to help you get set up.
                  </p>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h3 className="font-semibold mb-2">Step 2: Verify Your Details</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll contact you to verify your information and discuss your invoicing needs. 
                    This helps us tailor Zyra to work best for your business.
                  </p>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h3 className="font-semibold mb-2">Step 3: Set Up Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Once verified, you can create your business profile, add your logo, and configure your 
                    payment preferences. This usually takes about 5-10 minutes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="first-steps">
            <h2 className="text-2xl font-bold mb-3">First Steps</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                After your account is set up, here&apos;s what you should do:
              </p>

              <div className="grid gap-4">
                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">1. Configure Payment Methods</h4>
                    <p className="text-sm text-muted-foreground">
                      Add your mobile money accounts (MTN MoMo, Vodafone Cash) or connect your crypto wallet 
                      to receive payments. This determines which payment options your customers can use.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">2. Customize Your Invoice Template</h4>
                    <p className="text-sm text-muted-foreground">
                      Design your invoice template to match your brand. You can add your logo, change colors, 
                      and customize the layout to reflect your business identity.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">3. Create Your First Invoice</h4>
                    <p className="text-sm text-muted-foreground">
                      Click on &quot;Create Invoice&quot; and fill in your customer details, amount, and payment method. 
                      Review the preview and send it to your customer via email or share link.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="next">
            <h2 className="text-2xl font-bold mb-3">What&apos;s Next?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Now that you understand the basics, explore more features:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Learn how to create detailed invoices with the <Link href="/docs/create-first-invoice" className="text-primary hover:underline">step-by-step guide</Link></li>
              <li>Understand different <Link href="/docs/payment-methods" className="text-primary hover:underline">payment methods</Link> available</li>
              <li>Track your invoices and payments in real-time</li>
              <li>Export invoices for accounting purposes</li>
              <li>Explore WhatsApp integration for sending invoices</li>
            </ul>
          </section>

          <section>
            <p className="text-sm text-muted-foreground italic border-l-4 border-primary/30 pl-4">
              Need help? Contact our support team at support@zyra.app or fill out the contact form on our home page.
            </p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50 flex justify-between">
          <Link href="/docs">
            <Button variant="outline">← Back to Docs</Button>
          </Link>
          <Link href="/docs/create-first-invoice">
            <Button>Next: Creating Your First Invoice →</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
