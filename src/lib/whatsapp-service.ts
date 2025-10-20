interface WhatsAppMessage {
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.baseUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    
    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('WhatsApp credentials not configured. Notifications will be disabled.');
    }
  }

  /**
   * Send a text message using provided credentials (per-brand overrides)
   */
  async sendMessageWithCredentials(
    creds: { accessToken?: string; phoneNumberId?: string },
    to: string,
    message: string,
  ): Promise<WhatsAppResponse | null> {
    const altAccessToken = creds.accessToken || this.accessToken;
    const altPhoneNumberId = creds.phoneNumberId || this.phoneNumberId;
    if (!altAccessToken || !altPhoneNumberId) {
      console.log('WhatsApp not configured for overrides, skipping notification:', message);
      return null;
    }

    const baseUrl = `https://graph.facebook.com/v18.0/${altPhoneNumberId}/messages`;
    const formattedPhone = this.formatPhoneNumber(to);
    if (!formattedPhone) {
      console.error('Invalid phone number format:', to);
      return null;
    }

    const messageData: WhatsAppMessage = {
      to: formattedPhone,
      type: 'text',
      text: { body: message },
    };

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${altAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API error (override):', errorData);
        return null;
      }
      const result = await response.json();
      console.log('WhatsApp message sent successfully (override):', result);
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp message (override):', error);
      return null;
    }
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendMessage(to: string, message: string): Promise<WhatsAppResponse | null> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.log('WhatsApp not configured, skipping notification:', message);
      return null;
    }

    // Format phone number (remove any non-digit characters and ensure it starts with country code)
    const formattedPhone = this.formatPhoneNumber(to);
    if (!formattedPhone) {
      console.error('Invalid phone number format:', to);
      return null;
    }

    const messageData: WhatsAppMessage = {
      to: formattedPhone,
      type: 'text',
      text: {
        body: message
      }
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API error:', errorData);
        return null;
      }

      const result = await response.json();
      console.log('WhatsApp message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return null;
    }
  }

  /**
   * Send payment notification message
   */
  async sendPaymentNotification(
    phoneNumber: string,
    customerName: string,
    amount: string,
    currency: string,
    paymentMethod: string,
    reference?: string
  ): Promise<boolean> {
    const message = this.formatPaymentMessage(
      customerName,
      amount,
      currency,
      paymentMethod,
      reference
    );

    const result = await this.sendMessage(phoneNumber, message);
    return result !== null;
  }

  /**
   * Send payment notification using override credentials
   */
  async sendPaymentNotificationWithCredentials(
    creds: { accessToken?: string; phoneNumberId?: string },
    phoneNumber: string,
    customerName: string,
    amount: string,
    currency: string,
    paymentMethod: string,
    reference?: string
  ): Promise<boolean> {
    const message = this.formatPaymentMessage(
      customerName,
      amount,
      currency,
      paymentMethod,
      reference
    );
    const result = await this.sendMessageWithCredentials(creds, phoneNumber, message);
    return result !== null;
  }

  /**
   * Send payment success notification using override credentials
   */
  async sendPaymentSuccessNotificationWithCredentials(
    creds: { accessToken?: string; phoneNumberId?: string },
    phoneNumber: string,
    customerName: string,
    amount: string,
    currency: string,
    paymentMethod: string,
    reference?: string
  ): Promise<boolean> {
    const message = this.formatPaymentSuccessMessage(
      customerName,
      amount,
      currency,
      paymentMethod,
      reference
    );
    const result = await this.sendMessageWithCredentials(creds, phoneNumber, message);
    return result !== null;
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccessNotification(
    phoneNumber: string,
    customerName: string,
    amount: string,
    currency: string,
    paymentMethod: string,
    reference?: string
  ): Promise<boolean> {
    const message = this.formatPaymentSuccessMessage(
      customerName,
      amount,
      currency,
      paymentMethod,
      reference
    );

    const result = await this.sendMessage(phoneNumber, message);
    return result !== null;
  }

  /**
   * Format phone number for WhatsApp API
   */
  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with 0, replace with country code (assuming Ghana +233)
    if (digits.startsWith('0')) {
      return '233' + digits.substring(1);
    }
    
    // If it already has country code, return as is
    if (digits.startsWith('233') && digits.length >= 12) {
      return digits;
    }
    
    // If it's a local number without country code, add +233
    if (digits.length === 9) {
      return '233' + digits;
    }
    
    return null;
  }

  /**
   * Format payment notification message
   */
  private formatPaymentMessage(
    customerName: string,
    amount: string,
    currency: string,
    paymentMethod: string,
    reference?: string
  ): string {
    const paymentMethodText = paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Crypto';
    const refText = reference ? `\nReference: ${reference}` : '';
    
    return `🎉 *Payment Notification*

Hello ${customerName},

A new payment has been received:
💰 Amount: ${amount} ${currency}
💳 Method: ${paymentMethodText}${refText}

Thank you for your business!

Best regards,
Zyra Team`;
  }

  /**
   * Format payment success notification message
   */
  private formatPaymentSuccessMessage(
    customerName: string,
    amount: string,
    currency: string,
    paymentMethod: string,
    reference?: string
  ): string {
    const paymentMethodText = paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Crypto';
    const refText = reference ? `\nReference: ${reference}` : '';
    
    return `✅ *Payment Successful*

Dear ${customerName},

Your payment has been processed successfully:
💰 Amount: ${amount} ${currency}
💳 Method: ${paymentMethodText}${refText}

Thank you for choosing Zyra!

Best regards,
Zyra Team`;
  }

  /**
   * Check if WhatsApp service is configured
   */
  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId);
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

