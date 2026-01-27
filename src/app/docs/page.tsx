"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

interface DocArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  lastUpdated: string;
  readTime: number;
  slug: string;
}

const docs: DocArticle[] = [
  {
    id: "1",
    title: "Getting Started with Zyra",
    description: "Learn how to create your account and set up your first invoice in minutes",
    category: "Basics",
    lastUpdated: "2026-01-27",
    readTime: 5,
    slug: "getting-started",
  },
  {
    id: "2",
    title: "Creating Your First Invoice",
    description: "Step-by-step guide to create and send your first invoice",
    category: "Guides",
    lastUpdated: "2026-01-27",
    readTime: 8,
    slug: "create-first-invoice",
  },
  {
    id: "3",
    title: "Understanding Payment Methods",
    description: "Explore mobile money and crypto payment options available on Zyra",
    category: "Payment",
    lastUpdated: "2026-01-26",
    readTime: 6,
    slug: "payment-methods",
  },
  {
    id: "4",
    title: "Managing Mobile Money Payments",
    description: "Configure and manage mobile money payments for MTN MoMo and Vodafone Cash",
    category: "Payment",
    lastUpdated: "2026-01-26",
    readTime: 7,
    slug: "mobile-money",
  },
  {
    id: "5",
    title: "Managing Crypto Payments",
    description: "Accept cryptocurrency payments and manage your wallet on Zyra",
    category: "Payment",
    lastUpdated: "2026-01-25",
    readTime: 10,
    slug: "crypto-payments",
  },
  {
    id: "6",
    title: "Tracking Invoice Status",
    description: "Monitor invoice progress and payment status in real-time",
    category: "Guides",
    lastUpdated: "2026-01-27",
    readTime: 4,
    slug: "invoice-status",
  },
  {
    id: "7",
    title: "Exporting Invoices",
    description: "Download and export your invoices as PDF or Excel files",
    category: "Features",
    lastUpdated: "2026-01-24",
    readTime: 5,
    slug: "exporting-invoices",
  },
  {
    id: "8",
    title: "Understanding Currency Conversion",
    description: "Learn how currency conversion works for multi-currency invoices",
    category: "Payment",
    lastUpdated: "2026-01-23",
    readTime: 6,
    slug: "currency-conversion",
  },
  {
    id: "9",
    title: "Security and Privacy",
    description: "How Zyra protects your data and ensures secure transactions",
    category: "Security",
    lastUpdated: "2026-01-27",
    readTime: 7,
    slug: "security",
  },
  {
    id: "10",
    title: "WhatsApp Integration",
    description: "Send and track invoices directly through WhatsApp",
    category: "Features",
    lastUpdated: "2026-01-20",
    readTime: 6,
    slug: "whatsapp-integration",
  },
  {
    id: "11",
    title: "Invoice Templates and Customization",
    description: "Customize invoice templates to match your brand",
    category: "Customization",
    lastUpdated: "2026-01-19",
    readTime: 8,
    slug: "templates",
  },
  {
    id: "12",
    title: "FAQ and Troubleshooting",
    description: "Common questions and solutions to problems",
    category: "Support",
    lastUpdated: "2026-01-27",
    readTime: 5,
    slug: "faq",
  },
];

const categories = ["All", ...Array.from(new Set(docs.map((doc) => doc.category)))];

export default function DocsPortal() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = docs.filter((doc) => {
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Zyra Documentation</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Title and Description */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome to Zyra Docs</h2>
          <p className="text-lg text-muted-foreground">
            Complete guide to using Zyra. Learn how to create invoices, manage payments, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Documentation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Link key={doc.id} href={`/docs/${doc.slug}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {doc.category}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {doc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full">
                  <p className="text-sm text-muted-foreground mb-4">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{doc.readTime} min read</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(doc.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
