import { NextRequest, NextResponse } from 'next/server';
import { saveInvoice } from '@/lib/invoice-storage';
import { saveCompanyInvoice } from '@/lib/company-invoice-storage';
import { whatsappService } from '@/lib/whatsapp-service';
import { getBrandBySlug } from '@/lib/brand-storage';
import { getWhatsAppConfig } from '@/lib/whatsapp-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    // const signature = request.headers.get('x-paystack-signature');
    
    // In production, you should verify the webhook signature
    // For now, we'll process the webhook without verification
    // You can add signature verification using Paystack's webhook verification
    
    const event = JSON.parse(body);
    
    // Handle successful payment events
    if (event.event === 'charge.success') {
      const data = event.data;
      
      // Create invoice for successful mobile money payment
      const invoiceData = {
        title: data.metadata?.customer_name || 'Mobile Money Payment',
        description: data.metadata?.description || `Payment via mobile money - ${data.reference}`,
        amount: data.amount.toString(),
        currency: data.currency,
        paymentMethod: 'mobile_money' as const,
        reference: data.reference,
        customer: data.customer,
        paid_at: data.paid_at,
        metadata: {
          paystack_reference: data.reference,
          paystack_transaction_id: data.id,
          customer_name: data.metadata?.customer_name,
          phone_number: data.metadata?.phone_number,
          original_amount: data.amount,
          original_currency: data.currency,
        }
      };

      try {
        const companySlug: string | undefined = data.metadata?.company_slug || undefined;
        if (companySlug) {
          const saved = await saveCompanyInvoice(companySlug, invoiceData);
          console.log('Webhook: Company Mobile Money Invoice Created:', companySlug, saved.id);
        } else {
          const savedInvoice = await saveInvoice(invoiceData);
          console.log('Webhook: Mobile Money Payment Invoice Created:', savedInvoice);
        }

        // Send WhatsApp notification using per-brand settings if available, otherwise env
        const phoneNumber = data.metadata?.phone_number;
        if (phoneNumber) {
          try {
            const companySlug: string | undefined = data.metadata?.company_slug || undefined;
            if (companySlug) {
              // try load brand config from Firestore
              try {
                const brand = await getBrandBySlug(companySlug);
                if (brand?.whatsapp?.enabled && brand.whatsapp.accessToken && brand.whatsapp.phoneNumberId) {
                  const creds = { 
                    accessToken: brand.whatsapp.accessToken, 
                    phoneNumberId: brand.whatsapp.phoneNumberId 
                  };
                  const ok = await whatsappService.sendPaymentSuccessNotificationWithCredentials(
                    creds,
                    phoneNumber,
                    data.metadata?.customer_name || 'Customer',
                    (data.amount / 100).toFixed(2),
                    data.currency,
                    'mobile_money',
                    data.reference
                  );
                  if (ok) console.log('Webhook: WhatsApp (brand) notification sent successfully');
                } else {
                  // fallback to env-based if globally enabled
                  const whatsappConfig = getWhatsAppConfig();
                  if (whatsappConfig.enabled && whatsappService.isConfigured()) {
                    await whatsappService.sendPaymentSuccessNotification(
                      phoneNumber,
                      data.metadata?.customer_name || 'Customer',
                      (data.amount / 100).toFixed(2),
                      data.currency,
                      'mobile_money',
                      data.reference
                    );
                    console.log('Webhook: WhatsApp (env) notification sent successfully');
                  }
                }
              } catch {
                // if brand config not found or invalid, fallback to env
                const whatsappConfig = getWhatsAppConfig();
                if (whatsappConfig.enabled && whatsappService.isConfigured()) {
                  await whatsappService.sendPaymentSuccessNotification(
                    phoneNumber,
                    data.metadata?.customer_name || 'Customer',
                    (data.amount / 100).toFixed(2),
                    data.currency,
                    'mobile_money',
                    data.reference
                  );
                  console.log('Webhook: WhatsApp (env) notification sent successfully');
                }
              }
            } else {
              const whatsappConfig = getWhatsAppConfig();
              if (whatsappConfig.enabled && whatsappService.isConfigured()) {
                await whatsappService.sendPaymentSuccessNotification(
                  phoneNumber,
                  data.metadata?.customer_name || 'Customer',
                  (data.amount / 100).toFixed(2),
                  data.currency,
                  'mobile_money',
                  data.reference
                );
                console.log('Webhook: WhatsApp (env) notification sent successfully');
              }
            }
          } catch (whatsappError) {
            console.error('Webhook: Error sending WhatsApp notification:', whatsappError);
            // Don't fail the webhook processing if WhatsApp notification fails
          }
        }
      } catch (invoiceError) {
        console.error('Webhook: Error creating invoice for mobile money payment:', invoiceError);
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
