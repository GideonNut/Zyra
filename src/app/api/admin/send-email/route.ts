import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getFirestoreInstance } from '@/lib/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { recipientIds, subject, body } = await request.json();

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    if (!subject || !body) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Fetch actual contact emails from Firestore
    const db = getFirestoreInstance();
    const recipients: string[] = [];
    const failedIds: string[] = [];

    // Query Firestore for each contact ID to get email addresses
    for (const contactId of recipientIds) {
      try {
        const docSnapshot = await db.collection('contact-interests').doc(contactId).get();
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          if (data?.email) {
            recipients.push(data.email);
          } else {
            failedIds.push(contactId);
          }
        } else {
          failedIds.push(contactId);
        }
      } catch (error) {
        console.error(`Failed to fetch contact ${contactId}:`, error);
        failedIds.push(contactId);
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipients found' },
        { status: 400 }
      );
    }

    // Send email to each recipient
    const sendPromises = recipients.map((email: string) =>
      resend.emails.send({
        from: 'Zyra <noreply@myzyra.xyz>',
        to: email,
        subject: subject,
        html: body,
      })
    );

    const results = await Promise.allSettled(sendPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    if (successCount === 0) {
      return NextResponse.json(
        { error: 'Failed to send emails' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Emails sent successfully`,
        sentCount: successCount,
        failureCount: failureCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
