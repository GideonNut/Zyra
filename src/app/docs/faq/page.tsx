"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Clock, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function FaqDoc() {
  const faqs = [
    {
      id: "1",
      question: "How much does Zyra cost?",
      answer: "Zyra offers flexible pricing. We have a free tier to get started, and premium plans with additional features. Contact us for detailed pricing information."
    },
    {
      id: "2",
      question: "Can I export my invoices?",
      answer: "Yes! You can export invoices in PDF, CSV, or JSON formats. Check out our Exporting Invoices documentation for detailed instructions."
    },
    {
      id: "3",
      question: "Do you support cryptocurrency payments?",
      answer: "Absolutely! We support Bitcoin, Ethereum, USDC, USDT, and many other cryptocurrencies. See our Crypto Payments guide for setup instructions."
    },
    {
      id: "4",
      question: "Is my data secure?",
      answer: "Yes, security is a top priority. We use 256-bit SSL/TLS encryption, AES-256 for data at rest, and comply with international standards. See our Security documentation."
    },
    {
      id: "5",
      question: "Can I use Zyra on mobile?",
      answer: "Zyra is fully responsive and works great on mobile devices. You can create and manage invoices from any device."
    },
    {
      id: "6",
      question: "What payment methods do you support?",
      answer: "We support mobile money (MTN MoMo, Vodafone Cash, AirtelTigo) and cryptocurrency payments. You can accept one or both methods."
    },
    {
      id: "7",
      question: "How long does it take to get paid?",
      answer: "Payment timing depends on your payment method. Mobile money typically settles within 24-48 hours, while crypto can vary."
    },
    {
      id: "8",
      question: "Can I send invoices via WhatsApp?",
      answer: "Yes! Integrate your WhatsApp account with Zyra to send invoices directly to customers. See our WhatsApp Integration guide."
    }
  ];

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
              Support
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
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

        {/* FAQs */}
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">Common Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border border-border/50 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="text-left font-semibold text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you didn&apos;t find the answer you were looking for, check out our other documentation pages or reach out to us directly.
            </p>
            <div className="space-y-3">
              <Link href="/docs">
                <Button variant="outline" className="w-full">
                  Browse All Documentation
                </Button>
              </Link>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <h3 className="text-lg font-bold mb-3">Need More Help?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is ready to help with any questions or issues you have.
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
