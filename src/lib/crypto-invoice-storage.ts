import { getFirestoreInstance, COLLECTIONS } from './firestore';

export interface CryptoInvoice {
  id: string;
  paymentLinkId: string;
  title: string;
  description?: string;
  amount: string;
  receiver: string;
  destinationToken: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  status: 'paid' | 'unpaid';
  createdAt: string;
  paidAt?: string;
  companySlug: string;
  priceUsd?: number;
}

export async function getAllCompanyCryptoInvoices(slug: string): Promise<CryptoInvoice[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.CRYPTO_INVOICES)
      .where('companySlug', '==', slug)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CryptoInvoice[];
  } catch (error) {
    console.error('Error fetching company crypto invoices from Firestore:', error);
    return [];
  }
}

export async function saveCompanyCryptoInvoice(
  slug: string, 
  invoice: Omit<CryptoInvoice, 'id' | 'createdAt' | 'companySlug'>
): Promise<CryptoInvoice> {
  try {
    const db = getFirestoreInstance();
    const id = `crypto_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date().toISOString();
    const full: CryptoInvoice = { 
      ...invoice, 
      id, 
      createdAt,
      companySlug: slug,
    };
    
    await db.collection(COLLECTIONS.CRYPTO_INVOICES).doc(id).set(full);
    
    return full;
  } catch (error) {
    console.error('Error saving company crypto invoice to Firestore:', error);
    throw new Error('Failed to save company crypto invoice');
  }
}

export async function deleteCompanyCryptoInvoice(id: string, slug?: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    const docRef = db.collection(COLLECTIONS.CRYPTO_INVOICES).doc(id);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data() as CryptoInvoice | undefined;
      if (slug && data?.companySlug !== slug) {
        return false;
      }

      await docRef.delete();
      return true;
    }

    const snapshot = await db.collection(COLLECTIONS.CRYPTO_INVOICES)
      .where('paymentLinkId', '==', id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return false;
    }

    const targetDoc = snapshot.docs[0];
    const data = targetDoc.data() as CryptoInvoice | undefined;
    if (slug && data?.companySlug !== slug) {
      return false;
    }

    await targetDoc.ref.delete();
    return true;
  } catch (error) {
    console.error('Error deleting company crypto invoice from Firestore:', error);
    return false;
  }
}

export async function updateCryptoInvoiceStatus(
  paymentLinkId: string,
  status: 'paid' | 'unpaid',
  paidAt?: string
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.CRYPTO_INVOICES)
      .where('paymentLinkId', '==', paymentLinkId)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await doc.ref.update({
        status,
        ...(paidAt && { paidAt }),
      });
    }
  } catch (error) {
    console.error('Error updating crypto invoice status in Firestore:', error);
  }
}

