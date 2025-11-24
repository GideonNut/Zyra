import { NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS } from '@/lib/firestore';
import { saveBrand } from '@/lib/brand-storage';

export async function GET() {
  try {
    const db = getFirestoreInstance();
    
    // Test creating a brand
    const testBrand = {
      id: 'test-brand',
      name: 'Test Brand',
      slug: 'test-brand',
      assets: {
        logo: {
          light: '/brands/test-brand/logo.png',
          dark: '/brands/test-brand/logo.png'
        },
        favicon: '/brands/test-brand/favicon.ico'
      },
      meta: {
        title: 'Test Brand Invoicing',
        description: 'A test brand to verify Firestore is working'
      },
      payment: {
        receiver: '',
        paystackPublicKey: ''
      }
    };

    const savedBrand = await saveBrand(testBrand);
    
    // Test reading it back
    const brandRef = db.collection(COLLECTIONS.BRANDS).doc(savedBrand.id);
    const brandDoc = await brandRef.get();
    
    if (!brandDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Brand was created but could not be read back'
      }, { status: 500 });
    }

    // Clean up - delete the test brand
    await brandRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Firestore create, read, and delete operations are working!',
      test: {
        created: true,
        read: true,
        deleted: true
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Firestore operations test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Test failed';
    const errorDetails: Record<string, unknown> = {
      message: errorMessage,
    };
    
    if (error && typeof error === 'object' && 'code' in error) {
      errorDetails.code = error.code;
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

