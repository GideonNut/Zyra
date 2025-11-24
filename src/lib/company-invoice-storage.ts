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
