import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance } from '@/lib/firestore';

interface ContactInterest {
  id: string;
  email: string;
  phone: string;
  createdAt: string;
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreInstance();

    // Fetch all contact interests from Firestore, sorted by most recent first
    const snapshot = await db
      .collection('contact-interests')
      .orderBy('createdAt', 'desc')
      .get();

    const interests: ContactInterest[] = [];
    snapshot.forEach((doc) => {
      interests.push({
        id: doc.id,
        ...doc.data(),
      } as ContactInterest);
    });

    return NextResponse.json(
      { interests },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching contact interests:', errorMessage);

    return NextResponse.json(
      { error: 'Failed to fetch contact interests' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreInstance();
    await db.collection('contact-interests').doc(id).delete();

    return NextResponse.json(
      { success: true, message: 'Contact interest deleted' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting contact interest:', errorMessage);

    return NextResponse.json(
      { error: 'Failed to delete contact interest' },
      { status: 500 }
    );
  }
}
