import { NextRequest, NextResponse } from 'next/server';
import { getBrandBySlug } from '@/lib/brand-storage';
import { getAllCompanyInvoices } from '@/lib/company-invoice-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Load brand configuration from Firestore
    const brand = await getBrandBySlug(slug);
    if (!brand) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get company stats
    const stats = await getCompanyStats(slug);
    
    // Get recent invoices
    const recentInvoices = await getRecentInvoices(slug);
    
    // Get monthly stats
    const monthlyStats = await getMonthlyStats(slug);

    const companyDetails = {
      id: brand.id,
      name: brand.name,
      slug: slug,
      createdAt: brand.createdAt || new Date().toISOString(),
      lastActivity: stats.lastActivity,
      totalInvoices: stats.totalInvoices,
      totalRevenue: stats.totalRevenue,
      paymentMethods: {
        crypto: true, // Assume crypto is always available
        mobileMoney: !!brand.payment?.paystackPublicKey
      },
      whatsapp: {
        enabled: !!brand.whatsapp?.enabled
      },
      status: 'active' as const,
      recentInvoices,
      monthlyStats
    };

    return NextResponse.json(companyDetails);
  } catch (error) {
    console.error('Error getting company analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get company analytics' },
      { status: 500 }
    );
  }
}

// Helper function to get company statistics
async function getCompanyStats(slug: string) {
  try {
    // Get mobile money invoices
    const mobileMoneyInvoices = await getAllCompanyInvoices(slug);
    
    // Get crypto invoices (this would need to be implemented based on your storage)
    const cryptoInvoices = await getCryptoInvoices();
    
    const totalInvoices = mobileMoneyInvoices.length + cryptoInvoices.length;
    const totalRevenue = mobileMoneyInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || '0'), 0) +
                        cryptoInvoices.reduce((sum, invoice) => sum + (invoice.amountUsd || 0), 0);
    
    const lastActivity = [...mobileMoneyInvoices, ...cryptoInvoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt;

    return {
      totalInvoices,
      totalRevenue,
      lastActivity
    };
  } catch (error) {
    console.error(`Error getting stats for ${slug}:`, error);
    return {
      totalInvoices: 0,
      totalRevenue: 0,
      lastActivity: null
    };
  }
}

// Helper function to get crypto invoices
async function getCryptoInvoices() {
  try {
    // This would need to be implemented based on how you store crypto invoices
    // For now, return empty array with proper typing
    return [] as Array<{
      id: string;
      amountUsd: number;
      createdAt: string;
      status: string;
      customerName?: string;
    }>;
  } catch {
    return [] as Array<{
      id: string;
      amountUsd: number;
      createdAt: string;
      status: string;
      customerName?: string;
    }>;
  }
}

// Helper function to get recent invoices
async function getRecentInvoices(slug: string) {
  try {
    const mobileMoneyInvoices = await getAllCompanyInvoices(slug);
    const cryptoInvoices = await getCryptoInvoices();
    
    const allInvoices = [
      ...mobileMoneyInvoices.map(invoice => ({
        id: invoice.id,
        amount: parseFloat(invoice.amount || '0'),
        currency: invoice.currency || 'USD',
        status: 'paid',
        createdAt: invoice.createdAt,
        customerName: ((invoice.customer as Record<string, unknown>)?.first_name as string) || 
                      ((invoice.metadata as Record<string, unknown>)?.customer_name as string) ||
                      undefined,
        paymentMethod: 'mobile-money'
      })),
      ...cryptoInvoices.map(invoice => ({
        id: invoice.id,
        amount: invoice.amountUsd || 0,
        currency: 'USD',
        status: invoice.status || 'paid',
        createdAt: invoice.createdAt,
        customerName: invoice.customerName,
        paymentMethod: 'crypto'
      }))
    ];
    
    return allInvoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10); // Return last 10 invoices
  } catch (error) {
    console.error(`Error getting recent invoices for ${slug}:`, error);
    return [];
  }
}

// Helper function to get monthly stats
async function getMonthlyStats(slug: string) {
  try {
    const mobileMoneyInvoices = await getAllCompanyInvoices(slug);
    const cryptoInvoices = await getCryptoInvoices();
    
    const allInvoices = [
      ...mobileMoneyInvoices.map(invoice => ({
        amount: parseFloat(invoice.amount || '0'),
        createdAt: invoice.createdAt
      })),
      ...cryptoInvoices.map(invoice => ({
        amount: invoice.amountUsd || 0,
        createdAt: invoice.createdAt
      }))
    ];
    
    // Group by month
    const monthlyData: { [key: string]: { invoices: number; revenue: number } } = {};
    
    allInvoices.forEach(invoice => {
      const date = new Date(invoice.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { invoices: 0, revenue: 0 };
      }
      
      monthlyData[monthKey].invoices++;
      monthlyData[monthKey].revenue += invoice.amount;
    });
    
    // Convert to array and sort by month
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        invoices: data.invoices,
        revenue: data.revenue
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // Last 12 months
  } catch (error) {
    console.error(`Error getting monthly stats for ${slug}:`, error);
    return [];
  }
}
