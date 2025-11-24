import { NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS } from '@/lib/firestore';

export async function GET() {
  try {
    // Test Firestore connection
    const db = getFirestoreInstance();
    
    // Try to read from a collection (this will work even if empty)
    const testCollection = db.collection('_test');
    await testCollection.limit(1).get();
    
    // Try to access the actual collections
    const brandsSnapshot = await db.collection(COLLECTIONS.BRANDS).limit(1).get();
    const invoicesSnapshot = await db.collection(COLLECTIONS.MOBILE_MONEY_INVOICES).limit(1).get();
    const companyInvoicesSnapshot = await db.collection(COLLECTIONS.COMPANY_INVOICES).limit(1).get();
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Firestore is connected and working!',
      collections: {
        brands: {
          exists: true,
          count: brandsSnapshot.size,
        },
        mobileMoneyInvoices: {
          exists: true,
          count: invoicesSnapshot.size,
        },
        companyInvoices: {
          exists: true,
          count: companyInvoicesSnapshot.size,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Firebase connection test failed:', error);
    
    // Check for common errors
    const err = error instanceof Error ? error : null;
    let errorMessage = err?.message || 'Unknown error';
    let errorDetails: Record<string, unknown> = {};
    
    if (errorMessage.includes('Missing Firebase configuration')) {
      errorMessage = 'Firebase environment variables are not set';
      errorDetails = {
        required: ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'],
        check: 'Make sure these are set in your .env.local file',
      };
    } else if (errorMessage.includes('Permission denied')) {
      errorMessage = 'Firebase permission denied';
      errorDetails = {
        check: 'Verify your service account has proper permissions',
      };
    } else if (err && 'code' in err && (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Firebase servers';
      errorDetails = {
        check: 'Check your internet connection and Firebase project ID',
      };
    } else {
      errorDetails = {
        message: errorMessage,
      };
      if (err && 'code' in err) {
        errorDetails.code = err.code;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

