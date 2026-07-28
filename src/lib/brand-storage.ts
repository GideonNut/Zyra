import fs from 'fs/promises';
import path from 'path';
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
    skipPayments?: boolean;
    cashEnabled?: boolean;
    mobileMoneyEnabled?: boolean;
    cryptoEnabled?: boolean;
  };
  inventory?: {
    enabled?: boolean;
    items?: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      quantity: number;
      sku?: string;
      imageUrl?: string;
      allowHalfQuarter?: boolean;
    }>;
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

async function writeBrandJsonFile(slug: string, brand: Brand): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'brands', slug, 'brand.json');
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(brand, null, 2), 'utf8');
  } catch (error) {
    console.warn('Failed to update public brand json file:', error);
  }
}

export async function updateBrandInventory(slug: string, items: Array<{ id: string; quantity: number }>): Promise<Brand | null> {
  try {
    const existing = await getBrandBySlug(slug);
    if (!existing) {
      return null;
    }

    const updatedItems = (existing.inventory?.items || []).map((item) => {
      const saleItem = items.find((entry) => entry.id === item.id);
      if (!saleItem || saleItem.quantity <= 0) {
        return item;
      }

      const nextQuantity = Math.max(0, Number((item.quantity - saleItem.quantity).toFixed(2)));
      return { ...item, quantity: nextQuantity };
    });

    const updatedBrand: Brand = {
      ...existing,
      inventory: {
        ...(existing.inventory || {}),
        enabled: existing.inventory?.enabled ?? false,
        items: updatedItems,
      },
      updatedAt: new Date().toISOString(),
    };

    const db = getFirestoreInstance();
    await db.collection(COLLECTIONS.BRANDS).doc(existing.id).set(updatedBrand, { merge: true });
    await writeBrandJsonFile(slug, updatedBrand);
    return updatedBrand;
  } catch (error) {
    console.error('Error updating brand inventory:', error);
    throw new Error('Failed to update brand inventory');
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

