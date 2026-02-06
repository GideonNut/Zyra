import { getFirestoreInstance, COLLECTIONS } from './firestore';

export interface CompanyAddress {
  id: string;
  companySlug: string;
  address: string; // Blockchain or physical address
  type: 'blockchain' | 'physical'; // Type of address
  isPrimary: boolean; // Whether this is the primary address for the company
  createdAt: string;
  updatedAt: string;
}

export interface CompanyWithAddresses {
  slug: string;
  name: string;
  addresses: CompanyAddress[];
}

/**
 * Map an address to its associated company
 * Supports both blockchain and physical addresses
 */
export async function getCompanyByAddress(address: string): Promise<CompanyWithAddresses | null> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.COMPANY_ADDRESSES)
      .where('address', '==', address.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const addressData = doc.data() as CompanyAddress;

    // Get the company (brand) data
    const { getBrandBySlug } = await import('./brand-storage');
    const company = await getBrandBySlug(addressData.companySlug);

    if (!company) {
      return null;
    }

    // Get all addresses for this company
    const allAddresses = await getAllCompanyAddresses(addressData.companySlug);

    const companyName = (company as Record<string, unknown>).name || (company as Record<string, unknown>).id || addressData.companySlug;

    return {
      slug: addressData.companySlug,
      name: String(companyName),
      addresses: allAddresses,
    };
  } catch (error) {
    console.error('Error getting company by address:', error);
    return null;
  }
}

/**
 * Get all addresses associated with a company
 */
export async function getAllCompanyAddresses(companySlug: string): Promise<CompanyAddress[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.COMPANY_ADDRESSES)
      .where('companySlug', '==', companySlug)
      .orderBy('isPrimary', 'desc')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CompanyAddress[];
  } catch (error) {
    console.error('Error fetching company addresses:', error);
    return [];
  }
}

/**
 * Add a new address to a company
 */
export async function addCompanyAddress(
  companySlug: string,
  address: string,
  type: 'blockchain' | 'physical' = 'blockchain',
  isPrimary: boolean = false
): Promise<CompanyAddress> {
  try {
    const db = getFirestoreInstance();
    
    // Normalize address (lowercase for blockchain addresses)
    const normalizedAddress = address.toLowerCase();

    // Check if address already exists for this company
    const existingSnapshot = await db.collection(COLLECTIONS.COMPANY_ADDRESSES)
      .where('companySlug', '==', companySlug)
      .where('address', '==', normalizedAddress)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      throw new Error('This address is already associated with this company');
    }

    // If setting as primary, unset other primary addresses
    if (isPrimary) {
      const primarySnapshot = await db.collection(COLLECTIONS.COMPANY_ADDRESSES)
        .where('companySlug', '==', companySlug)
        .where('isPrimary', '==', true)
        .get();

      const batch = db.batch();
      primarySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isPrimary: false });
      });
      await batch.commit();
    }

    const id = `addr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();

    const companyAddress: CompanyAddress = {
      id,
      companySlug,
      address: normalizedAddress,
      type,
      isPrimary,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(COLLECTIONS.COMPANY_ADDRESSES).doc(id).set(companyAddress);
    return companyAddress;
  } catch (error) {
    console.error('Error adding company address:', error);
    throw error;
  }
}

/**
 * Remove an address from a company
 */
export async function removeCompanyAddress(addressId: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    await db.collection(COLLECTIONS.COMPANY_ADDRESSES).doc(addressId).delete();
    return true;
  } catch (error) {
    console.error('Error removing company address:', error);
    return false;
  }
}

/**
 * Update a company address
 */
export async function updateCompanyAddress(
  addressId: string,
  updates: Partial<Omit<CompanyAddress, 'id' | 'companySlug'>>
): Promise<CompanyAddress | null> {
  try {
    const db = getFirestoreInstance();
    
    // Get the document first to verify it exists
    const doc = await db.collection(COLLECTIONS.COMPANY_ADDRESSES).doc(addressId).get();
    if (!doc.exists) {
      return null;
    }

    const currentData = doc.data() as CompanyAddress;

    // If updating to make primary, unset other primary addresses
    if (updates.isPrimary) {
      const primarySnapshot = await db.collection(COLLECTIONS.COMPANY_ADDRESSES)
        .where('companySlug', '==', currentData.companySlug)
        .where('isPrimary', '==', true)
        .get();

      const batch = db.batch();
      primarySnapshot.docs.forEach(doc => {
        if (doc.id !== addressId) {
          batch.update(doc.ref, { isPrimary: false });
        }
      });
      await batch.commit();
    }

    const updated: CompanyAddress = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.COMPANY_ADDRESSES).doc(addressId).set(updated);
    return updated;
  } catch (error) {
    console.error('Error updating company address:', error);
    return null;
  }
}

/**
 * Get the primary address for a company
 */
export async function getPrimaryCompanyAddress(companySlug: string): Promise<CompanyAddress | null> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.COMPANY_ADDRESSES)
      .where('companySlug', '==', companySlug)
      .where('isPrimary', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as CompanyAddress;
  } catch (error) {
    console.error('Error getting primary company address:', error);
    return null;
  }
}
