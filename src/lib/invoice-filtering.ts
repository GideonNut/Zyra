import { FilterState } from "@/components/ui/advanced-filter";

export interface Invoice {
  id: string;
  title: string;
  description?: string;
  amount: string;
  currency?: string;
  paymentMethod: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  paidAt?: string;
  reference?: string;
  transactionId?: string;
  chainId?: number;
  tokenSymbol?: string;
  usdValue?: string;
  priceUsd?: number;
  destinationToken?: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  metadata?: {
    customer_name?: string;
    phone_number?: string;
    original_amount: number;
    original_currency: string;
  };
}

export function filterInvoices(invoices: Invoice[], filters: FilterState): Invoice[] {
  return invoices.filter(invoice => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        invoice.title,
        invoice.description,
        invoice.metadata?.customer_name,
        invoice.metadata?.phone_number,
        invoice.destinationToken?.symbol,
        invoice.id,
        invoice.reference
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (filters.status.length > 0) {
      const invoiceStatus = getInvoiceStatus(invoice);
      if (!filters.status.includes(invoiceStatus)) {
        return false;
      }
    }

    // Payment method filter
    if (filters.paymentMethod.length > 0) {
      const paymentMethod = invoice.paymentMethod === "mobile_money" ? "mobile_money" : "crypto";
      if (!filters.paymentMethod.includes(paymentMethod)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const invoiceDate = new Date(invoice.createdAt);
      
      if (filters.dateRange.from && invoiceDate < filters.dateRange.from) {
        return false;
      }
      
      if (filters.dateRange.to) {
        // Set to end of day for "to" date
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (invoiceDate > toDate) {
          return false;
        }
      }
    }

    // Amount range filter
    if (filters.amountRange.min || filters.amountRange.max) {
      const invoiceAmount = getInvoiceAmount(invoice);
      
      if (filters.amountRange.min && invoiceAmount < parseFloat(filters.amountRange.min)) {
        return false;
      }
      
      if (filters.amountRange.max && invoiceAmount > parseFloat(filters.amountRange.max)) {
        return false;
      }
    }

    // Customer filter
    if (filters.customer) {
      const customerLower = filters.customer.toLowerCase();
      const customerName = invoice.metadata?.customer_name || invoice.title || '';
      
      if (!customerName.toLowerCase().includes(customerLower)) {
        return false;
      }
    }

    return true;
  });
}

export function getInvoiceStatus(invoice: Invoice): string {
  if (invoice.paymentMethod === "mobile_money") {
    return "paid"; // Mobile money invoices are always paid when they appear
  } else {
    // For crypto payments, we'd need to check payment status
    // For now, assuming they're paid if they appear in the list
    return "paid";
  }
}

export function getInvoiceAmount(invoice: Invoice): number {
  if (invoice.paymentMethod === "mobile_money") {
    return invoice.metadata?.original_amount || 0;
  } else {
    // For crypto payments, convert from wei/smallest unit
    const decimals = invoice.destinationToken?.decimals || 18;
    return parseFloat(invoice.amount) / Math.pow(10, decimals);
  }
}

export function getInvoiceCurrency(invoice: Invoice): string {
  if (invoice.paymentMethod === "mobile_money") {
    return invoice.metadata?.original_currency || "GHS";
  } else {
    return invoice.destinationToken?.symbol || "Unknown";
  }
}

export function getInvoiceCustomerName(invoice: Invoice): string {
  if (invoice.paymentMethod === "mobile_money") {
    return invoice.metadata?.customer_name || "Unknown Customer";
  } else {
    return invoice.title || "Unknown Customer";
  }
}

export function sortInvoices(invoices: Invoice[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Invoice[] {
  return [...invoices].sort((a, b) => {
    let aValue: unknown;
    let bValue: unknown;

    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'amount':
        aValue = getInvoiceAmount(a);
        bValue = getInvoiceAmount(b);
        break;
      case 'customer':
        aValue = getInvoiceCustomerName(a);
        bValue = getInvoiceCustomerName(b);
        break;
      case 'status':
        aValue = getInvoiceStatus(a);
        bValue = getInvoiceStatus(b);
        break;
      default:
        aValue = a.title;
        bValue = b.title;
    }

    // Type-safe comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }
    
    // For Date objects
    if (aValue instanceof Date && bValue instanceof Date) {
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }
    
    return 0;
  });
}
