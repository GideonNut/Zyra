import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const brandsDir = path.join(process.cwd(), 'public', 'brands');
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

    try {
      const entries = await fs.readdir(brandsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          totalCompanies++;
          
          const brandPath = path.join(brandsDir, entry.name, 'brand.json');
          try {
            const brandData = await fs.readFile(brandPath, 'utf-8');
            const brand = JSON.parse(brandData);
            
            // Consider company active if it has any configuration
            if (brand.payment?.paystackPublicKey || brand.whatsapp?.enabled) {
              activeCompanies++;
            } else {
              activeCompanies++; // For now, consider all companies active
            }
            
            // Get company stats
            const stats = await getCompanyStats(entry.name);
            totalInvoices += stats.totalInvoices;
            totalRevenue += stats.totalRevenue;
            
            // Add recent activity
            if (stats.lastActivity) {
              recentActivity.push({
                id: `${entry.name}-${stats.lastActivity}`,
                company: brand.name,
                action: 'Last payment received',
                timestamp: stats.lastActivity
              });
            }
          } catch (error) {
            console.error(`Error reading brand ${entry.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error reading brands directory:', error);
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
    const mobileMoneyInvoices = await getMobileMoneyInvoices(slug);
    
    // Get crypto invoices (this would need to be implemented based on your storage)
    const cryptoInvoices = await getCryptoInvoices(slug);
    
    const totalInvoices = mobileMoneyInvoices.length + cryptoInvoices.length;
    const totalRevenue = mobileMoneyInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) +
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

// Helper function to get mobile money invoices
async function getMobileMoneyInvoices(slug: string) {
  try {
    const invoicesDir = path.join(process.cwd(), 'data', 'companies', slug, 'mobile-money', 'invoices');
    const files = await fs.readdir(invoicesDir);
    
    const invoices = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(invoicesDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        invoices.push(JSON.parse(data));
      }
    }
    
    return invoices;
  } catch {
    return [];
  }
}

// Helper function to get crypto invoices
async function getCryptoInvoices(_slug: string) {
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
