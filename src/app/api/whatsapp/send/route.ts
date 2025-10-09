import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp-service';
import { getWhatsAppConfig } from '@/lib/whatsapp-config';

/**
 * API endpoint to manually send WhatsApp notifications
 * This can be used for testing or manual notifications
 */
export async function POST(request: NextRequest) {
  try {
    const config = getWhatsAppConfig();
    
    if (!config.enabled) {
      return NextResponse.json(
        { error: 'WhatsApp notifications are disabled' },
        { status: 400 }
      );
    }

    if (!whatsappService.isConfigured()) {
      return NextResponse.json(
        { error: 'WhatsApp service is not properly configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      phoneNumber, 
      message, 
      customerName, 
      amount, 
      currency, 
      paymentMethod, 
      reference,
      type = 'custom' // 'custom', 'payment_success', 'payment_notification'
    } = body;

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    let result: boolean;

    switch (type) {
      case 'payment_success':
        if (!customerName || !amount || !currency || !paymentMethod) {
          return NextResponse.json(
            { error: 'Customer name, amount, currency, and payment method are required for payment success notifications' },
            { status: 400 }
          );
        }
        result = await whatsappService.sendPaymentSuccessNotification(
          phoneNumber,
          customerName,
          amount,
          currency,
          paymentMethod,
          reference
        );
        break;

      case 'payment_notification':
        if (!customerName || !amount || !currency || !paymentMethod) {
          return NextResponse.json(
            { error: 'Customer name, amount, currency, and payment method are required for payment notifications' },
            { status: 400 }
          );
        }
        result = await whatsappService.sendPaymentNotification(
          phoneNumber,
          customerName,
          amount,
          currency,
          paymentMethod,
          reference
        );
        break;

      case 'custom':
      default:
        if (!message) {
          return NextResponse.json(
            { error: 'Message is required for custom notifications' },
            { status: 400 }
          );
        }
        const response = await whatsappService.sendMessage(phoneNumber, message);
        result = response !== null;
        break;
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp notification sent successfully',
        type,
        phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number for security
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get WhatsApp service status
 */
export async function GET() {
  try {
    const config = getWhatsAppConfig();
    const isConfigured = whatsappService.isConfigured();

    return NextResponse.json({
      enabled: config.enabled,
      configured: isConfigured,
      webhookVerification: config.verifyWebhook,
      hasAccessToken: !!config.accessToken,
      hasPhoneNumberId: !!config.phoneNumberId,
      hasWebhookSecret: !!config.webhookSecret,
    });
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

