import { promises as fs } from 'fs';
import path from 'path';

export interface MobileMoneyInvoice {
  id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: 'mobile_money';
  reference: string;
  customer: {
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    customer_code?: string;
    metadata?: Record<string, unknown>;
    risk_action?: string;
    international_format_phone?: string;
  };
  paid_at: string;
  createdAt: string;
  metadata: {
    paystack_reference: string;
    paystack_transaction_id: string;
    customer_name?: string;
    phone_number?: string;
    original_amount: number;
    original_currency: string;
  };
}

const INVOICES_FILE = path.join(process.cwd(), 'data', 'mobile-money-invoices.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(INVOICES_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read all invoices
export async function getAllInvoices(): Promise<MobileMoneyInvoice[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(INVOICES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

// Save a new invoice
export async function saveInvoice(invoice: Omit<MobileMoneyInvoice, 'id' | 'createdAt'>): Promise<MobileMoneyInvoice> {
  try {
    await ensureDataDirectory();
    
    const invoices = await getAllInvoices();
    const newInvoice: MobileMoneyInvoice = {
      ...invoice,
      id: `mobile_money_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    invoices.push(newInvoice);
    
    await fs.writeFile(INVOICES_FILE, JSON.stringify(invoices, null, 2));
    
    return newInvoice;
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw new Error('Failed to save invoice');
  }
}

// Get invoice by reference
export async function getInvoiceByReference(reference: string): Promise<MobileMoneyInvoice | null> {
  const invoices = await getAllInvoices();
  return invoices.find(invoice => invoice.reference === reference) || null;
}

// Get invoices by customer
export async function getInvoicesByCustomer(customerEmail: string): Promise<MobileMoneyInvoice[]> {
  const invoices = await getAllInvoices();
  return invoices.filter(invoice => 
    invoice.customer?.email === customerEmail || 
    invoice.metadata.phone_number === customerEmail
  );
}
