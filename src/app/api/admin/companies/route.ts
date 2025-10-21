import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Get all companies
export async function GET() {
  try {
    const brandsDir = path.join(process.cwd(), 'public', 'brands');
    const companies = [];

    try {
      const entries = await fs.readdir(brandsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const brandPath = path.join(brandsDir, entry.name, 'brand.json');
          try {
            const brandData = await fs.readFile(brandPath, 'utf-8');
            const brand = JSON.parse(brandData);
            
            // Get company stats
            const stats = await getCompanyStats(entry.name);
            
            companies.push({
              id: brand.id,
              name: brand.name,
              slug: entry.name,
              createdAt: new Date().toISOString(), // We don't track this yet
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
              status: 'active' // Default to active
            });
          } catch (error) {
            console.error(`Error reading brand ${entry.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error reading brands directory:', error);
    }

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error getting companies:', error);
    return NextResponse.json(
      { error: 'Failed to get companies' },
      { status: 500 }
    );
  }
}

// Create new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const brandsDir = path.join(process.cwd(), 'public', 'brands');
    const companyDir = path.join(brandsDir, slug);
    const brandPath = path.join(companyDir, 'brand.json');

    // Check if company already exists
    try {
      await fs.access(brandPath);
      return NextResponse.json(
        { error: 'Company with this slug already exists' },
        { status: 409 }
      );
    } catch {
      // Company doesn't exist, which is what we want
    }

    // Create company directory
    await fs.mkdir(companyDir, { recursive: true });

    // Create default brand configuration
    const brandConfig = {
      id: slug,
      name: name,
      assets: {
        logo: {
          light: `/brands/${slug}/logo.png`,
          dark: `/brands/${slug}/logo.png`
        },
        favicon: `/brands/${slug}/favicon.ico`
      },
      meta: {
        title: `${name} Invoicing`,
        description: description || `Invoices and instant payments powered by Zyra`
      },
      payment: {
        receiver: "",
        paystackPublicKey: ""
      },
      whatsapp: {
        enabled: false,
        accessToken: "",
        phoneNumberId: "",
        verifyWebhook: false,
        webhookSecret: ""
      }
    };

    // Write brand configuration
    await fs.writeFile(brandPath, JSON.stringify(brandConfig, null, 2));

    return NextResponse.json({
      success: true,
      company: {
        id: slug,
        name: name,
        slug: slug,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
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
