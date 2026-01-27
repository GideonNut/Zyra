import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance } from '@/lib/firestore';

interface InterestFormData {
  email: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InterestFormData = await request.json();

    // Validate input
    if (!body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Email and phone number are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreInstance();

    // Store the interest form data in Firestore
    const timestamp = new Date().toISOString();
    const docRef = await db.collection('contact-interests').add({
      email: body.email.toLowerCase(),
      phone: body.phone,
      createdAt: timestamp,
      status: 'new',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your interest! We will contact you soon.',
        id: docRef.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving contact interest:', errorMessage);

    return NextResponse.json(
      { error: 'Failed to save your information. Please try again.' },
      { status: 500 }
    );
  }
}
