import { getFirestoreInstance, COLLECTIONS } from './firestore';

export interface MobileMoneyInvoice {
  id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: 'mobile_money';
  reference: string;
  customer: {
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    customer_code?: string;
    metadata?: Record<string, unknown>;
    risk_action?: string;
    international_format_phone?: string;
  };
  paid_at: string;
  createdAt: string;
  metadata: {
    paystack_reference: string;
    paystack_transaction_id: string;
    customer_name?: string;
    phone_number?: string;
    original_amount: number;
    original_currency: string;
  };
}

export interface CryptoInvoice {
  id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: 'crypto';
  reference: string;
  customer: Record<string, unknown>;
  paid_at: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export type Invoice = MobileMoneyInvoice | CryptoInvoice;

// Read all invoices
export async function getAllInvoices(): Promise<Invoice[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Invoice[];
  } catch (error) {
    console.error('Error fetching invoices from Firestore:', error);
    return [];
  }
}

// Save a new invoice
export async function saveInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
  try {
    const db = getFirestoreInstance();
    const prefix = invoice.paymentMethod === 'crypto' ? 'crypto' : 'mobile_money';
    const id = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    
    let newInvoice: Invoice;
    if (invoice.paymentMethod === 'crypto') {
      newInvoice = {
        ...invoice,
        id,
        createdAt,
      } as CryptoInvoice;
    } else {
      newInvoice = {
        ...invoice,
        id,
        createdAt,
      } as MobileMoneyInvoice;
    }
    
    await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES).doc(id).set(newInvoice);
    
    return newInvoice;
  } catch (error) {
    console.error('Error saving invoice to Firestore:', error);
    throw new Error('Failed to save invoice');
  }
}

// Get invoice by reference
export async function getInvoiceByReference(reference: string): Promise<Invoice | null> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES)
      .where('reference', '==', reference)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Invoice;
  } catch (error) {
    console.error('Error fetching invoice by reference from Firestore:', error);
    return null;
  }
}

// Get invoices by customer
export async function getInvoicesByCustomer(customerEmail: string): Promise<Invoice[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES)
      .where('customer.email', '==', customerEmail)
      .get();
    
    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Invoice[];
    
    // Also check phone_number in metadata
    const phoneSnapshot = await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES)
      .where('metadata.phone_number', '==', customerEmail)
      .get();
    
    const phoneInvoices = phoneSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Invoice[];
    
    // Combine and deduplicate
    const allInvoices = [...invoices, ...phoneInvoices];
    const uniqueInvoices = Array.from(
      new Map(allInvoices.map(inv => [inv.id, inv])).values()
    );
    
    return uniqueInvoices;
  } catch (error) {
    console.error('Error fetching invoices by customer from Firestore:', error);
    return [];
  }
}
