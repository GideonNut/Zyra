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

// Read all invoices
export async function getAllInvoices(): Promise<MobileMoneyInvoice[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MobileMoneyInvoice[];
  } catch (error) {
    console.error('Error fetching invoices from Firestore:', error);
    return [];
  }
}

// Save a new invoice
export async function saveInvoice(invoice: Omit<MobileMoneyInvoice, 'id' | 'createdAt'>): Promise<MobileMoneyInvoice> {
  try {
    const db = getFirestoreInstance();
    const id = `mobile_money_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    
    const newInvoice: MobileMoneyInvoice = {
      ...invoice,
      id,
      createdAt,
    };
    
    await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES).doc(id).set(newInvoice);
    
    return newInvoice;
  } catch (error) {
    console.error('Error saving invoice to Firestore:', error);
    throw new Error('Failed to save invoice');
  }
}

// Get invoice by reference
export async function getInvoiceByReference(reference: string): Promise<MobileMoneyInvoice | null> {
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
    } as MobileMoneyInvoice;
  } catch (error) {
    console.error('Error fetching invoice by reference from Firestore:', error);
    return null;
  }
}

// Get invoices by customer
export async function getInvoicesByCustomer(customerEmail: string): Promise<MobileMoneyInvoice[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES)
      .where('customer.email', '==', customerEmail)
      .get();
    
    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MobileMoneyInvoice[];
    
    // Also check phone_number in metadata
    const phoneSnapshot = await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES)
      .where('metadata.phone_number', '==', customerEmail)
      .get();
    
    const phoneInvoices = phoneSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MobileMoneyInvoice[];
    
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
