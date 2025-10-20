import { promises as fs } from 'fs';
import path from 'path';

export interface CompanyMobileMoneyInvoice {
  id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: 'mobile_money';
  reference: string;
  customer: Record<string, unknown>;
  paid_at: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

function baseDir(slug: string) {
  return path.join(process.cwd(), 'data', 'companies', slug);
}

function invoicesDir(slug: string) {
  return path.join(baseDir(slug), 'mobile-money', 'invoices');
}

async function ensureDir(p: string) {
  try {
    await fs.access(p);
  } catch {
    await fs.mkdir(p, { recursive: true });
  }
}

export async function getAllCompanyInvoices(slug: string): Promise<CompanyMobileMoneyInvoice[]> {
  const dir = invoicesDir(slug);
  try {
    await ensureDir(dir);
    const files = await fs.readdir(dir);
    const results: CompanyMobileMoneyInvoice[] = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const content = await fs.readFile(path.join(dir, f), 'utf-8');
      results.push(JSON.parse(content));
    }
    // sort newest first
    results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return results;
  } catch {
    return [];
  }
}

export async function saveCompanyInvoice(slug: string, invoice: Omit<CompanyMobileMoneyInvoice, 'id' | 'createdAt'>): Promise<CompanyMobileMoneyInvoice> {
  const dir = invoicesDir(slug);
  await ensureDir(dir);
  const id = `mobile_money_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();
  const full: CompanyMobileMoneyInvoice = { ...invoice, id, createdAt };
  const filePath = path.join(dir, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(full, null, 2), 'utf-8');
  return full;
}
