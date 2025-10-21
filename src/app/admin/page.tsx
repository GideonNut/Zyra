"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  Plus, 
  Settings, 
  Eye, 
  BarChart3, 
  DollarSign,
  Activity,
  FileText,
  CreditCard
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Company {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  lastActivity?: string;
  totalInvoices?: number;
  totalRevenue?: number;
  paymentMethods?: {
    crypto: boolean;
    mobileMoney: boolean;
  };
  whatsapp?: {
    enabled: boolean;
  };
  status: 'active' | 'inactive' | 'pending';
}

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalInvoices: number;
  totalRevenue: number;
  recentActivity: Array<{
    id: string;
    company: string;
    action: string;
    timestamp: string;
  }>;
}

export default function MasterAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Load companies from brands directory
      const companiesRes = await fetch('/api/admin/companies');
      const companiesData = await companiesRes.json();
      setCompanies(companiesData);

      // Load dashboard stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createCompany() {
    if (!newCompany.name || !newCompany.slug) return;
    
    setCreating(true);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany)
      });
      
      if (res.ok) {
        setShowCreateDialog(false);
        setNewCompany({ name: '', slug: '', description: '' });
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create company:', error);
    } finally {
      setCreating(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Master Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Manage all companies and brands</p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Company</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      placeholder="e.g., Fruity Gold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Company Slug</Label>
                    <Input
                      id="slug"
                      value={newCompany.slug}
                      onChange={(e) => setNewCompany({ ...newCompany, slug: e.target.value })}
                      placeholder="e.g., fruity-gold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newCompany.description}
                      onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                      placeholder="Brief description of the company"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createCompany} disabled={creating}>
                      {creating ? <Spinner className="h-4 w-4 mr-2" /> : null}
                      Create Company
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeCompanies} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvoices.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across all companies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All payment methods
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCompanies}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.activeCompanies / stats.totalCompanies) * 100)}% of total
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Companies Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Methods</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground">{company.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {company.paymentMethods?.crypto && (
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Crypto
                          </Badge>
                        )}
                        {company.paymentMethods?.mobileMoney && (
                          <Badge variant="outline" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Mobile Money
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{company.totalInvoices?.toLocaleString() || 0}</TableCell>
                    <TableCell>${company.totalRevenue?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      {company.lastActivity ? new Date(company.lastActivity).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/companies/${company.slug}`)}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/c/${company.slug}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/brands/${company.slug}`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded border">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{activity.company}</span> {activity.action}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
