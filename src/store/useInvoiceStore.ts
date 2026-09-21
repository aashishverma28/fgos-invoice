import { create } from 'zustand';
import type { CurrencyCode, InvoiceState, LineItem, ReminderTone, TemplateId } from '../types/invoice';
import { addDaysISO, calcTotals, uid } from '../lib/aiParser';

const STORAGE_KEY = 'invoicely:v1';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function seedItems(): LineItem[] {
  return [
    { id: uid(), title: 'React development', description: '30 hours of professional React dev work, incl. implementation, testing & handover.', qty: 30, rate: 50, amount: 1500 },
    { id: uid(), title: 'Hosting setup', description: 'Hosting setup — one-time setup, configuration & verification.', qty: 1, rate: 200, amount: 200 },
  ];
}

export function defaultState(): InvoiceState {
  const issue = todayISO();
  return {
    invoiceNo: `INV-${new Date().getFullYear()}-001`,
    issueDate: issue,
    dueDate: addDaysISO(issue, 14),
    currency: 'USD',
    brandColor: '#7C5CFF',
    logoDataUrl: null,
    from: { name: 'Ava Studio', email: 'hello@avastudio.co', address: '21 Bright St, Austin TX' },
    billTo: { name: 'John Doe', email: '', address: '' },
    items: seedItems(),
    taxRate: 0,
    discountRate: 15,
    discountFlat: 0,
    lateFeeRate: 1.5,
    poNumber: '',
    taxId: '',
    paymentTerms: 'Net 14',
    paymentLink: '',
    notes: 'Thank you for your business!',
    tone: 'polite',
    template: 'gradient-bento',
  };
}

function load(): InvoiceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as InvoiceState;
    if (!parsed.items || !Array.isArray(parsed.items)) return defaultState();
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

interface Actions {
  update: (patch: Partial<InvoiceState>) => void;
  updateItem: (id: string, patch: Partial<LineItem>) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  applyAiItems: (billToName: string, items: Array<{ title: string; description: string; qty: number; rate: number }>, discountRate: number, taxRate: number, dueInDays: number | null, currency: CurrencyCode | null, billToEmail?: string) => void;
  setTemplate: (t: TemplateId) => void;
  setTone: (t: ReminderTone) => void;
  setCurrency: (c: CurrencyCode) => void;
  setLogo: (dataUrl: string | null) => void;
  reset: () => void;
  persist: () => void;
}

export const useInvoiceStore = create<InvoiceState & Actions>()((set, get) => ({
  ...load(),

  update: (patch) => {
    set(patch);
    get().persist();
  },
  updateItem: (id, patch) =>
    set((s) => {
      const items = s.items.map((it) => {
        if (it.id !== id) return it;
        const next = { ...it, ...patch };
        next.amount = Math.round(next.qty * next.rate * 100) / 100;
        return next;
      });
      const out = { items };
      queueMicrotask(() => get().persist());
      return out;
    }),
  addItem: () =>
    set((s) => {
      const items = [...s.items, { id: uid(), title: 'New service', description: '', qty: 1, rate: 100, amount: 100 }];
      queueMicrotask(() => get().persist());
      return { items };
    }),
  removeItem: (id) =>
    set((s) => {
      const items = s.items.filter((i) => i.id !== id);
      queueMicrotask(() => get().persist());
      return { items };
    }),
  applyAiItems: (billToName, items, discountRate, taxRate, dueInDays, currency, billToEmail) =>
    set((s) => {
      const mapped: LineItem[] = items.map((it) => ({
        id: uid(),
        title: it.title,
        description: it.description,
        qty: it.qty,
        rate: it.rate,
        amount: Math.round(it.qty * it.rate * 100) / 100,
      }));
      const billTo =
        billToName || billToEmail
          ? {
              ...s.billTo,
              name: billToName || s.billTo.name,
              email: billToEmail || s.billTo.email,
            }
          : s.billTo;
      const patch: Partial<InvoiceState> = {
        items: mapped,
        discountRate,
        taxRate,
        billTo,
        dueDate: dueInDays != null ? addDaysISO(s.issueDate, dueInDays) : s.dueDate,
        currency: currency ?? s.currency,
      };
      queueMicrotask(() => get().persist());
      return patch;
    }),
  setTemplate: (template) => { set({ template }); get().persist(); },
  setTone: (tone) => { set({ tone }); get().persist(); },
  setCurrency: (currency) => { set({ currency }); get().persist(); },
  setLogo: (logoDataUrl) => { set({ logoDataUrl }); get().persist(); },
  reset: () => { const d = defaultState(); set(d); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* noop */ } },
  persist: () => {
    try {
      const s = get();
      const { ...data } = s;
      // strip functions automatically — zustand get() returns state+actions; pick known keys
      const clean: InvoiceState = {
        invoiceNo: s.invoiceNo, issueDate: s.issueDate, dueDate: s.dueDate, currency: s.currency,
        brandColor: s.brandColor, logoDataUrl: s.logoDataUrl, from: s.from, billTo: s.billTo,
        items: s.items, taxRate: s.taxRate, discountRate: s.discountRate, discountFlat: s.discountFlat,
        lateFeeRate: s.lateFeeRate, poNumber: s.poNumber, taxId: s.taxId, paymentTerms: s.paymentTerms,
        paymentLink: s.paymentLink, notes: s.notes, tone: s.tone, template: s.template,
      };
      void data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch { /* quota / private mode */ }
  },
}));

export const selectTotals = (s: InvoiceState) =>
  calcTotals({ items: s.items, taxRate: s.taxRate, discountRate: s.discountRate, discountFlat: s.discountFlat, lateFeeRate: s.lateFeeRate });
