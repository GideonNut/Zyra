import { NextRequest, NextResponse } from 'next/server';
import { getAllBrands, getBrandBySlug } from '@/lib/brand-storage';
import { getAllCompanyInvoices } from '@/lib/company-invoice-storage';

// Get all companies
export async function GET() {
  try {
    const brands = await getAllBrands();
    const companies = [];

    for (const brand of brands) {
      try {
        // Get company stats
        const stats = await getCompanyStats(brand.slug);
        
        companies.push({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
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
          status: 'active' // Default to active
        });
      } catch (error) {
        console.error(`Error processing brand ${brand.slug}:`, error);
      }
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

    // Check if company already exists
    const existing = await getBrandBySlug(slug);
    if (existing) {
      return NextResponse.json(
        { error: 'Company with this slug already exists' },
        { status: 409 }
      );
    }

    // Create default brand configuration
    const brandConfig = {
      id: slug,
      name: name,
      slug: slug,
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

    // Save brand to Firestore
    const { saveBrand } = await import('@/lib/brand-storage');
    const savedBrand = await saveBrand(brandConfig);

    return NextResponse.json({
      success: true,
      company: {
        id: savedBrand.id,
        name: savedBrand.name,
        slug: savedBrand.slug,
        createdAt: savedBrand.createdAt || new Date().toISOString(),
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

// Delete a company
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Company slug is required' },
        { status: 400 }
      );
    }

    // Check if company exists and delete from Firestore
    const { deleteBrand } = await import('@/lib/brand-storage');
    const deleted = await deleteBrand(slug);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Note: Company invoices will remain in Firestore but can be cleaned up separately if needed
    // You may want to add a function to delete all company invoices when deleting a company

    return NextResponse.json({
      success: true,
      message: `Company ${slug} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
