export type TemplateId =
  | 'neo-brutalist'
  | 'cyber-glass'
  | 'editorial-swiss'
  | 'gradient-bento'
  | 'executive-monolith';

export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD' | 'AED' | 'NGN' | 'BRL';

export type ReminderTone = 'polite' | 'formal' | 'firm';

export interface LineItem {
  id: string;
  title: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Party {
  name: string;
  email: string;
  address: string;
}

export interface InvoiceState {
  invoiceNo: string;
  issueDate: string; // ISO yyyy-mm-dd
  dueDate: string;
  currency: CurrencyCode;
  brandColor: string;
  logoDataUrl: string | null;
  from: Party;
  billTo: Party;
  items: LineItem[];
  taxRate: number; // %
  discountRate: number; // %
  discountFlat: number;
  lateFeeRate: number; // % per month estimate
  poNumber: string;
  taxId: string;
  paymentTerms: string;
  paymentLink: string;
  notes: string;
  tone: ReminderTone;
  template: TemplateId;
}

export interface Totals {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
  lateFeeEstimate: number;
}

export interface AiParseResult {
  billToName: string;
  billToEmail: string;
  items: Array<{ title: string; description: string; qty: number; rate: number }>;
  discountRate: number;
  taxRate: number;
  dueInDays: number | null;
  currencyHint: CurrencyCode | null;
  notesHint: string | null;
}
