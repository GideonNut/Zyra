import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let db: Firestore | undefined;

// Initialize Firebase Admin
export function getFirestoreInstance(): Firestore {
  if (db) {
    return db;
  }

  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    // Initialize with service account credentials from environment variables
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    // Check for missing environment variables
    const missing: string[] = [];
    if (!serviceAccount.projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!serviceAccount.privateKey) missing.push('FIREBASE_PRIVATE_KEY');
    if (!serviceAccount.clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');

    if (missing.length > 0) {
      throw new Error(
        `Missing Firebase configuration. Please set the following environment variables: ${missing.join(', ')}. See FIREBASE_SETUP.md for instructions.`
      );
    }

    try {
      app = initializeApp({
        credential: cert({
          projectId: serviceAccount.projectId,
          privateKey: serviceAccount.privateKey,
          clientEmail: serviceAccount.clientEmail,
        }),
        projectId: serviceAccount.projectId,
      });
      console.log(`✅ Firebase initialized successfully for project: ${serviceAccount.projectId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Firebase initialization failed:', errorMessage);
      throw new Error(`Failed to initialize Firebase: ${errorMessage}`);
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  return db;
}

// Collection names
export const COLLECTIONS = {
  MOBILE_MONEY_INVOICES: 'mobileMoneyInvoices',
  COMPANY_INVOICES: 'companyInvoices',
  CRYPTO_INVOICES: 'cryptoInvoices',
  BRANDS: 'brands',
} as const;

