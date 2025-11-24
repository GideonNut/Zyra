import { getFirestoreInstance, COLLECTIONS } from './firestore';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  assets: {
    logo: {
      light: string;
      dark: string;
    };
    favicon: string;
  };
  meta: {
    title: string;
    description: string;
  };
  payment: {
    receiver: string;
    paystackPublicKey: string;
  };
  whatsapp?: {
    enabled: boolean;
    accessToken?: string;
    phoneNumberId?: string;
    verifyWebhook?: boolean;
    webhookSecret?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Get all brands
export async function getAllBrands(): Promise<Brand[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.BRANDS)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Brand[];
  } catch (error) {
    console.error('Error fetching brands from Firestore:', error);
    return [];
  }
}

// Get brand by slug
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.BRANDS)
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Brand;
  } catch (error) {
    console.error('Error fetching brand by slug from Firestore:', error);
    return null;
  }
}

// Get brand by ID
export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const db = getFirestoreInstance();
    const doc = await db.collection(COLLECTIONS.BRANDS).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data(),
    } as Brand;
  } catch (error) {
    console.error('Error fetching brand by ID from Firestore:', error);
    return null;
  }
}

// Create or update brand
export async function saveBrand(brand: Omit<Brand, 'createdAt' | 'updatedAt'>): Promise<Brand> {
  try {
    const db = getFirestoreInstance();
    const now = new Date().toISOString();
    
    // Check if brand exists
    const existing = await getBrandBySlug(brand.slug);
    
    if (existing) {
      // Update existing brand
      const updatedBrand: Brand = {
        ...existing,
        ...brand,
        updatedAt: now,
      };
      await db.collection(COLLECTIONS.BRANDS).doc(existing.id).set(updatedBrand, { merge: true });
      return updatedBrand;
    } else {
      // Create new brand
      const newBrand: Brand = {
        ...brand,
        createdAt: now,
        updatedAt: now,
      };
      await db.collection(COLLECTIONS.BRANDS).doc(brand.id || brand.slug).set(newBrand);
      return newBrand;
    }
  } catch (error) {
    console.error('Error saving brand to Firestore:', error);
    throw new Error('Failed to save brand');
  }
}

// Delete brand
export async function deleteBrand(slug: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    const brand = await getBrandBySlug(slug);
    
    if (!brand) {
      return false;
    }
    
    await db.collection(COLLECTIONS.BRANDS).doc(brand.id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting brand from Firestore:', error);
    throw new Error('Failed to delete brand');
  }
}

