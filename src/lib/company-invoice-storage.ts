import { getFirestoreInstance, COLLECTIONS } from './firestore';

export interface CompanyMobileMoneyInvoice {
  id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: 'mobile_money';
  reference: string;
  customer: Record<string, unknown>;
  paid_at: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  companySlug: string;
}

export async function getAllCompanyInvoices(slug: string): Promise<CompanyMobileMoneyInvoice[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.COMPANY_INVOICES)
      .where('companySlug', '==', slug)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CompanyMobileMoneyInvoice[];
  } catch (error) {
    console.error('Error fetching company invoices from Firestore:', error);
    return [];
  }
}

export async function getCompanyInvoiceById(id: string, slug?: string): Promise<CompanyMobileMoneyInvoice | null> {
  try {
    const db = getFirestoreInstance();
    const doc = await db.collection(COLLECTIONS.COMPANY_INVOICES).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const invoice = { id: doc.id, ...doc.data() } as CompanyMobileMoneyInvoice;
    
    // If slug is provided, verify it matches the invoice's company slug
    if (slug && invoice.companySlug !== slug) {
      return null; // Invoice belongs to a different company
    }
    
    return invoice;
  } catch (error) {
    console.error('Error fetching company invoice by ID from Firestore:', error);
    return null;
  }
}

export async function saveCompanyInvoice(slug: string, invoice: Omit<CompanyMobileMoneyInvoice, 'id' | 'createdAt' | 'companySlug'>): Promise<CompanyMobileMoneyInvoice> {
  try {
    const db = getFirestoreInstance();
    const id = `mobile_money_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date().toISOString();
    const full: CompanyMobileMoneyInvoice = { 
      ...invoice, 
      id, 
      createdAt,
      companySlug: slug,
    };
    
    await db.collection(COLLECTIONS.COMPANY_INVOICES).doc(id).set(full);
    
    return full;
  } catch (error) {
    console.error('Error saving company invoice to Firestore:', error);
    throw new Error('Failed to save company invoice');
  }
}
