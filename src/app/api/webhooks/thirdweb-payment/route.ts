import { NextRequest, NextResponse } from 'next/server';
import { saveInvoice } from '@/lib/invoice-storage';
import { saveCompanyInvoice } from '@/lib/company-invoice-storage';
import { updateCryptoInvoiceStatus } from '@/lib/crypto-invoice-storage';
import { getCompanySlugForPaymentLink } from '@/lib/payment-link-storage';
import { generateCryptoReferenceHash, recordTransactionToRegistry } from '@/lib/transaction-recorder';
import { whatsappService } from '@/lib/whatsapp-service';
import { getWhatsAppConfig } from '@/lib/whatsapp-config';
import { getBrandBySlug } from '@/lib/brand-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, transactionHash, payer, receiver, amount, token, metadata } = body;
    const paymentLinkId: string | undefined =
      metadata?.paymentLinkId || metadata?.payment_link_id || id;

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (status === 'completed' || status === 'success') {
      try {
        // Record transaction to TransactionRegistry
        const amountBigInt = BigInt(amount);
        const referenceHash = generateCryptoReferenceHash(
          transactionHash || `thirdweb_${id}`,
          receiver,
          amount,
          token,
          Math.floor(Date.now() / 1000)
        );

        const registryRecord = await recordTransactionToRegistry({
          merchant: receiver,
          payer: payer || '0x0000000000000000000000000000000000000000',
          amount: amountBigInt,
          token: token,
          referenceHash: referenceHash,
          paymentMethod: 'crypto',
          paymentReference: transactionHash || id,
          customerName: metadata?.customerName || 'Crypto Payment',
          description: metadata?.description,
        });

        if (registryRecord.success) {
          console.log('Crypto transaction recorded to registry:', registryRecord.hash);
        } else {
          console.warn('Failed to record crypto transaction to registry:', registryRecord.error);
        }
      } catch (registryError) {
        console.error('Error recording to transaction registry:', registryError);
        // Don't fail webhook if registry recording fails
      }

      // Create invoice for successful crypto payment
      try {
        const invoiceData = {
          title: metadata?.customerName || 'Crypto Payment',
          description: metadata?.description || `Crypto payment - ${transactionHash || id}`,
          amount: amount,
          currency: 'CRYPTO',
          paymentMethod: 'crypto' as const,
          reference: transactionHash || id,
          customer: {
            payer,
          },
          paid_at: new Date().toISOString(),
          metadata: {
            thirdweb_payment_id: id,
            transaction_hash: transactionHash,
            payer: payer,
            receiver: receiver,
            token: token,
            customer_name: metadata?.customerName,
            company_slug: metadata?.companySlug,
          }
        };

        const companySlug =
          metadata?.companySlug ||
          metadata?.company_slug ||
          (paymentLinkId ? await getCompanySlugForPaymentLink(paymentLinkId) : undefined);

        if (companySlug) {
          const savedInvoice = await saveCompanyInvoice(companySlug, invoiceData as Parameters<typeof saveCompanyInvoice>[1]);
          console.log('Crypto Payment Invoice Created and Saved (Company):', companySlug, savedInvoice.id);
        } else {
          const savedInvoice = await saveInvoice(invoiceData as Parameters<typeof saveInvoice>[0]);
          console.log('Crypto Payment Invoice Created and Saved (Global):', savedInvoice.id);
        }

        if (paymentLinkId) {
          await updateCryptoInvoiceStatus(paymentLinkId, 'paid', new Date().toISOString());
        }

        // Send WhatsApp notification if phone number available
        const phoneNumber = metadata?.phoneNumber;
        if (phoneNumber) {
          try {
            if (companySlug) {
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
                    metadata?.customerName || 'Customer',
                    (BigInt(amount) / BigInt(10 ** 18)).toString(), // Assuming 18 decimals
                    'CRYPTO',
                    'crypto',
                    transactionHash || id
                  );
                  if (ok) console.log('WhatsApp (brand) notification sent successfully');
                } else {
                  const whatsappConfig = getWhatsAppConfig();
                  if (whatsappConfig.enabled && whatsappService.isConfigured()) {
                    await whatsappService.sendPaymentSuccessNotification(
                      phoneNumber,
                      metadata?.customerName || 'Customer',
                      (BigInt(amount) / BigInt(10 ** 18)).toString(),
                      'CRYPTO',
                      'crypto',
                      transactionHash || id
                    );
                    console.log('WhatsApp (env) notification sent successfully');
                  }
                }
              } catch {
                const whatsappConfig = getWhatsAppConfig();
                if (whatsappConfig.enabled && whatsappService.isConfigured()) {
                  await whatsappService.sendPaymentSuccessNotification(
                    phoneNumber,
                    metadata?.customerName || 'Customer',
                    (BigInt(amount) / BigInt(10 ** 18)).toString(),
                    'CRYPTO',
                    'crypto',
                    transactionHash || id
                  );
                  console.log('WhatsApp (env) notification sent successfully');
                }
              }
            } else {
              const whatsappConfig = getWhatsAppConfig();
              if (whatsappConfig.enabled && whatsappService.isConfigured()) {
                await whatsappService.sendPaymentSuccessNotification(
                  phoneNumber,
                  metadata?.customerName || 'Customer',
                  (BigInt(amount) / BigInt(10 ** 18)).toString(),
                  'CRYPTO',
                  'crypto',
                  transactionHash || id
                );
                console.log('WhatsApp (env) notification sent successfully');
              }
            }
          } catch (whatsappError) {
            console.error('Error sending WhatsApp notification:', whatsappError);
          }
        }
      } catch (invoiceError) {
        console.error('Error creating invoice for crypto payment:', invoiceError);
      }

      return NextResponse.json({
        success: true,
        status: status,
        paymentId: id,
        transactionHash: transactionHash,
        invoiceCreated: true,
      });
    } else {
      return NextResponse.json(
        { error: 'Payment not successful', status: status },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing crypto payment webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
