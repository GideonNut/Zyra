import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // TODO: Implement actual unsubscribe logic
    // This could involve:
    // 1. Adding email to a blocklist/unsubscribe list in your database
    // 2. Removing from mailing list
    // 3. Updating contact interest status
    // 4. Logging the unsubscribe action
    
    // For now, we'll just log it and return success
    console.log(`Unsubscribe request for email: ${email}`);

    return NextResponse.json(
      { 
        message: 'You have been successfully unsubscribed from our mailing list.',
        email: email
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}
