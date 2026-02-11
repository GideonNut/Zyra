import { NextResponse } from 'next/server';
import { getAllBrands } from '@/lib/brand-storage';
import { getAllCompanyInvoices } from '@/lib/company-invoice-storage';
import { getAllCompanyCryptoInvoices } from '@/lib/crypto-invoice-storage';

export async function GET() {
  try {
    const brands = await getAllBrands();
    let totalCompanies = 0;
    let activeCompanies = 0;
    let totalInvoices = 0;
    let totalRevenue = 0;
    const recentActivity: Array<{
      id: string;
      company: string;
      action: string;
      timestamp: string;
    }> = [];

    for (const brand of brands) {
      try {
        totalCompanies++;
        
        // Consider company active if it has any configuration
        if (brand.payment?.paystackPublicKey || brand.whatsapp?.enabled) {
          activeCompanies++;
        } else {
          activeCompanies++; // For now, consider all companies active
        }
        
        // Get company stats
        const stats = await getCompanyStats(brand.slug);
        totalInvoices += stats.totalInvoices;
        totalRevenue += stats.totalRevenue;
        
        // Add recent activity
        if (stats.lastActivity) {
          recentActivity.push({
            id: `${brand.slug}-${stats.lastActivity}`,
            company: brand.name,
            action: 'Last payment received',
            timestamp: stats.lastActivity
          });
        }
      } catch (error) {
        console.error(`Error processing brand ${brand.slug}:`, error);
      }
    }

    // Sort recent activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      totalCompanies,
      activeCompanies,
      totalInvoices,
      totalRevenue,
      recentActivity: recentActivity.slice(0, 10) // Limit to 10 most recent
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to get dashboard stats' },
      { status: 500 }
    );
  }
}

// Helper function to get company statistics
async function getCompanyStats(slug: string) {
  try {
    // Get mobile money invoices
    const mobileMoneyInvoices = await getAllCompanyInvoices(slug);
    
    // Get crypto invoices for this specific company
    const cryptoInvoices = await getCryptoInvoices(slug);
    
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

// Helper function to get crypto invoices for a specific company
async function getCryptoInvoices(slug: string) {
  try {
    const invoices = await getAllCompanyCryptoInvoices(slug);
    return invoices.map(invoice => ({
      id: invoice.id,
      amountUsd: invoice.priceUsd || 0,
      createdAt: invoice.createdAt,
      status: invoice.status,
      customerName: undefined
    }));
  } catch (error) {
    console.error(`Error getting crypto invoices for ${slug}:`, error);
    return [] as Array<{
      id: string;
      amountUsd: number;
      createdAt: string;
      status: string;
      customerName?: string;
    }>;
  }
}
