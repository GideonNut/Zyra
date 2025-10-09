/**
 * WhatsApp configuration and message templates
 */

export interface WhatsAppConfig {
  enabled: boolean;
  accessToken?: string;
  phoneNumberId?: string;
  verifyWebhook: boolean;
  webhookSecret?: string;
}

export interface PaymentNotificationData {
  customerName: string;
  phoneNumber: string;
  amount: string;
  currency: string;
  paymentMethod: 'mobile_money' | 'crypto';
  reference?: string;
  invoiceId?: string;
}

export interface NotificationTemplate {
  paymentReceived: string;
  paymentSuccess: string;
  paymentFailed: string;
  invoiceCreated: string;
}

/**
 * Get WhatsApp configuration from environment variables
 */
export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    verifyWebhook: process.env.WHATSAPP_VERIFY_WEBHOOK === 'true',
    webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET,
  };
}

/**
 * Default message templates
 */
export const defaultTemplates: NotificationTemplate = {
  paymentReceived: `🎉 *New Payment Received*

Hello {{customerName}},

We've received your payment:
💰 Amount: {{amount}} {{currency}}
💳 Method: {{paymentMethod}}
{{#reference}}📋 Reference: {{reference}}{{/reference}}

Thank you for your business!

Best regards,
Zyra Team`,

  paymentSuccess: `✅ *Payment Successful*

Dear {{customerName}},

Your payment has been processed successfully:
💰 Amount: {{amount}} {{currency}}
💳 Method: {{paymentMethod}}
{{#reference}}📋 Reference: {{reference}}{{/reference}}

Thank you for choosing Zyra!

Best regards,
Zyra Team`,

  paymentFailed: `❌ *Payment Failed*

Dear {{customerName}},

Unfortunately, your payment could not be processed:
💰 Amount: {{amount}} {{currency}}
💳 Method: {{paymentMethod}}
{{#reference}}📋 Reference: {{reference}}{{/reference}}

Please try again or contact support.

Best regards,
Zyra Team`,

  invoiceCreated: `📄 *Invoice Created*

Hello {{customerName}},

Your invoice has been created:
💰 Amount: {{amount}} {{currency}}
💳 Method: {{paymentMethod}}
{{#invoiceId}}📋 Invoice ID: {{invoiceId}}{{/invoiceId}}

Please complete your payment to proceed.

Best regards,
Zyra Team`,
};

/**
 * Template rendering function
 */
type TemplateData = {
  customerName?: string;
  amount?: string;
  currency?: string;
  paymentMethod?: 'mobile_money' | 'crypto' | string;
  reference?: string;
  invoiceId?: string;
  [key: string]: string | undefined;
};

export function renderTemplate(template: string, data: TemplateData): string {
  let rendered = template;

  // Replace variables in the format {{variableName}}
  rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    return typeof value === 'string' ? value : match;
  });

  // Handle conditional blocks {{#variable}}content{{/variable}} (supports multiline)
  rendered = rendered.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    return data[key] ? content : '';
  });

  // Replace payment method with human-readable text
  if (rendered.includes('{{paymentMethod}}')) {
    const paymentMethodText = data.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Cryptocurrency';
    rendered = rendered.replace(/\{\{paymentMethod\}\}/g, paymentMethodText);
  }

  return rendered;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a valid Ghana number (9 digits after country code)
  if (digits.startsWith('233') && digits.length === 12) {
    return true;
  }
  
  // Check if it's a local Ghana number (9 digits starting with 0)
  if (digits.startsWith('0') && digits.length === 10) {
    return true;
  }
  
  // Check if it's a local Ghana number without leading 0 (9 digits)
  if (digits.length === 9) {
    return true;
  }
  
  return false;
}

/**
 * Format phone number for WhatsApp API
 */
export function formatPhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 0, replace with country code (Ghana +233)
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

