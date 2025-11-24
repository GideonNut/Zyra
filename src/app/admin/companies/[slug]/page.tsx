"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Building2, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  CreditCard,
  Smartphone,
  MessageSquare,
  Settings,
  Eye,
  ArrowLeft
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

interface CompanyDetails {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  lastActivity?: string;
  totalInvoices: number;
  totalRevenue: number;
  paymentMethods: {
    crypto: boolean;
    mobileMoney: boolean;
  };
  whatsapp: {
    enabled: boolean;
  };
  status: 'active' | 'inactive' | 'pending';
  recentInvoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    customerName?: string;
    paymentMethod: string;
  }>;
  monthlyStats: Array<{
    month: string;
    invoices: number;
    revenue: number;
  }>;
}

export default function CompanyAnalyticsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyDetails | null>(null);

  useEffect(() => {
    if (slug) {
      loadCompanyDetails();
    }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCompanyDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/companies/${slug}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setCompany(data);
      }
    } catch (error) {
      console.error('Failed to load company details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
            <Button onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin')}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <p className="text-sm text-muted-foreground">Company Analytics & Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/c/${company.slug}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Company
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/brands/${company.slug}`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.totalInvoices.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${company.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All payment methods
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 mb-2">
                {company.paymentMethods.crypto && (
                  <Badge variant="outline" className="text-xs">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Crypto
                  </Badge>
                )}
                {company.paymentMethods.mobileMoney && (
                  <Badge variant="outline" className="text-xs">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Mobile Money
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {company.whatsapp.enabled && (
                  <Badge variant="outline" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Badge>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                {company.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Last activity: {company.lastActivity ? new Date(company.lastActivity).toLocaleDateString() : 'Never'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.customerName || 'N/A'}</TableCell>
                    <TableCell>
                      {invoice.currency} {invoice.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {invoice.paymentMethod === 'crypto' ? (
                          <CreditCard className="h-3 w-3 mr-1" />
                        ) : (
                          <Smartphone className="h-3 w-3 mr-1" />
                        )}
                        {invoice.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        {company.monthlyStats && company.monthlyStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg per Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.monthlyStats.map((stat) => (
                    <TableRow key={stat.month}>
                      <TableCell>{stat.month}</TableCell>
                      <TableCell>{stat.invoices}</TableCell>
                      <TableCell>${stat.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        ${stat.invoices > 0 ? Math.round(stat.revenue / stat.invoices).toLocaleString() : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
