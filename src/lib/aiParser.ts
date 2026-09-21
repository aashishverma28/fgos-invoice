import type { AiParseResult, CurrencyCode, LineItem } from '../types/invoice';

export const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function addDaysISO(baseISO: string, days: number): string {
  const d = baseISO ? new Date(baseISO) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function calcTotals(s: {
  items: LineItem[];
  taxRate: number;
  discountRate: number;
  discountFlat: number;
  lateFeeRate: number;
}): { subtotal: number; discount: number; taxable: number; tax: number; total: number; lateFeeEstimate: number } {
  const subtotal = s.items.reduce((a, it) => a + it.qty * it.rate, 0);
  const pct = (subtotal * (s.discountRate || 0)) / 100;
  const discount = Math.min(subtotal, pct + (s.discountFlat || 0));
  const taxable = Math.max(0, subtotal - discount);
  const tax = (taxable * (s.taxRate || 0)) / 100;
  const total = taxable + tax;
  const lateFeeEstimate = (total * (s.lateFeeRate || 0)) / 100;
  const r = (n: number) => Math.round(n * 100) / 100;
  return { subtotal: r(subtotal), discount: r(discount), taxable: r(taxable), tax: r(tax), total: r(total), lateFeeEstimate: r(lateFeeEstimate) };
}

// ---------- 100% free client-side "AI" parser (no API key, no login) ----------
// Handles: "Billed John Doe $1,500 for 30 hours of React dev plus $200 hosting setup, 15% discount, due net 14"

const CURRENCY_WORDS: Record<string, CurrencyCode> = {
  dollar: 'USD', dollars: 'USD', usd: 'USD',
  euro: 'EUR', euros: 'EUR', eur: 'EUR',
  pound: 'GBP', pounds: 'GBP', gbp: 'GBP',
  rupee: 'INR', rupees: 'INR', inr: 'INR', '₹': 'INR',
  yen: 'JPY', jpy: 'JPY', '¥': 'JPY',
};

function detectCurrency(text: string): CurrencyCode | null {
  const t = text.toLowerCase();
  if (/\$\s?[\d,]/.test(text)) return 'USD';
  if (/€/.test(text)) return 'EUR';
  if (/£/.test(text)) return 'GBP';
  if (/₹/.test(text)) return 'INR';
  for (const [w, c] of Object.entries(CURRENCY_WORDS)) {
    if (t.includes(w)) return c;
  }
  return null;
}

function parseMoney(n: string): number {
  return Number(n.replace(/,/g, ''));
}

interface MoneyHit {
  value: number;
  index: number;
  end: number;
}

const MONEY_NUM = '(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)';

function collectMoneyHits(text: string): MoneyHit[] {
  const hits: MoneyHit[] = [];
  const re = new RegExp(`[$€£₹]\\s?${MONEY_NUM}`, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const v = parseMoney(m[1]);
    if (v > 0) hits.push({ value: v, index: m.index, end: m.index + m[0].length });
    if (hits.length > 12) break;
  }
  return hits;
}

const cleanLabel = (s: string): string =>
  s
    .trim()
    .replace(/^(for|of)\s+/i, '')
    .replace(/\s+(for|with|at)$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const titleCase = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function parseInvoicePrompt(raw: string, fallbackIssueDate: string): AiParseResult {
  void fallbackIssueDate;
  const text = raw.trim();

  // ---- Client: "Billed John Doe $...", "Invoice Acme Corp ...", "for Beta LLC", email ----
  let billToName = '';
  const clientMatch = text.match(
    /\b(?:billed|bill|invoice(?:d)?|client:?|for|to)\s+([A-Z][A-Za-z.'&\- ]{1,40}?)(?=\s*(?:[$€£₹]|for|@|\d|\bat\b|,|\.|$))/i,
  );
  if (clientMatch) {
    billToName = cleanLabel(clientMatch[1]).replace(/\s+(plus|and|including|incl\.?|with)$/i, '');
  }

  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const billToEmail = emailMatch ? emailMatch[0] : '';
  if (!billToName && billToEmail) {
    billToName = titleCase(emailMatch![0].split('@')[0].replace(/[._-]+/g, ' '));
  }

  // ---- Money (currency symbol required — bare 30 / 15% / net 14 are NOT money) ----
  const hits = collectMoneyHits(text);
  const used = new Set<number>();

  // ---- Per-hour rate: "$50/hr", "$60 per hour", "$45/hour" ----
  let hourlyRate: number | null = null;
  const rateMatch = text.match(new RegExp(`[$€£₹]\\s?${MONEY_NUM}\\s?(?:\\/|per\\s+)?\\s?(?:hour|hrs?|h)\\b`, 'i'));
  if (rateMatch && rateMatch.index !== undefined) {
    hourlyRate = parseMoney(rateMatch[1]);
    const ri = hits.findIndex((h) => rateMatch.index! >= h.index && rateMatch.index! < h.end);
    if (ri >= 0) used.add(ri);
  }

  const items: AiParseResult['items'] = [];

  // ---- Hours item: "30 hours of React dev", "10h UI design", "20 hrs consulting" ----
  const hoursMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)\b\s*(?:of\s+)?([A-Za-z][^,;+.\n@$€£₹]{1,60}?)?(?=\s*(?:plus|\+|,|;|\.|for|with|and|@|due|net|including|incl\.?|$))/i,
  );
  if (hoursMatch && hoursMatch.index !== undefined) {
    const qty = Number(hoursMatch[1]);
    const hoursIdx = hoursMatch.index;
    let title = cleanLabel(hoursMatch[3] ?? '');
    let rate = 0;
    if (hourlyRate != null) {
      rate = hourlyRate;
    } else {
      // headline = money hit NEAREST to the hours phrase (either side of it)
      let best = -1;
      let bestDist = Infinity;
      hits.forEach((h, i) => {
        if (used.has(i)) return;
        const d = Math.abs(h.index - hoursIdx);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      if (best >= 0) {
        used.add(best);
        const total = hits[best].value;
        rate = qty > 0 ? Math.round((total / qty) * 100) / 100 : total;
      }
    }
    if (!title) title = 'Professional services';
    items.push({
      title: `${titleCase(title)} — hourly work`,
      description: `${qty}h of professional ${title} work, incl. delivery, QA & handover.`,
      qty,
      rate,
    });
  }

  // ---- Remaining money hits -> one item each ("plus $200 hosting setup") ----
  hits.forEach((h, i) => {
    if (used.has(i) || items.length >= 8) return;
    used.add(i);
    const after = text.slice(h.end);
    const labelMatch = after.match(
      /^\s*(?:for\s+)?([^,;.\n]+?)(?=,|;|\.|plus|\+|\band\b|discount|tax|vat|gst|due|net|including|incl\.?|$)/i,
    );
    let label = cleanLabel(labelMatch?.[1] ?? '');
    label = label.replace(/^\d+(?:\.\d+)?\s*(hours?|hrs?|h)\b\s*(of\s+)?/i, '').trim();
    if (!label) label = 'Professional services';
    if (/^(discount|tax|vat|gst|due|net|off)\b/i.test(label)) return;
    items.push({
      title: titleCase(label),
      description: `${titleCase(label)} — delivered as agreed.`,
      qty: 1,
      rate: h.value,
    });
  });

  // No amounts at all -> honest empty result (hook shows guidance instead of fake $500)
  const discMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:discount|off)/i);
  const discountRate = discMatch ? Math.min(90, Number(discMatch[1])) : 0;

  const taxMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:tax|vat|gst)/i);
  const taxRate = taxMatch ? Math.min(60, Number(taxMatch[1])) : 0;

  const netMatch = text.match(/(?:net|due in|due|within)\s*(\d{1,3})\b/i);
  const dueInDays = netMatch ? Math.min(365, Number(netMatch[1])) : null;

  return {
    billToName,
    billToEmail,
    items,
    discountRate,
    taxRate,
    dueInDays,
    currencyHint: detectCurrency(text),
    notesHint: null,
  };
}

// ---------- Magic Polish (local, free) ----------

const POLISH_TEMPLATES = [
  (t: string) => `${t}: end-to-end delivery including planning, implementation, QA, documentation and a walkthrough session. Timeline & acceptance criteria as agreed.`,
  (t: string) => `Professional ${t.toLowerCase()} package — setup, configuration, testing and production-ready handover with post-delivery support window.`,
  (t: string) => `${t} — scoped, executed and verified against requirements. Includes revisions round, status updates and final deliverables archive.`,
];

export function polishLineItem(title: string, note: string): { title: string; description: string } {
  const cleanTitle = (title || note || 'Service deliverable').trim();
  const seed = cleanTitle.length % POLISH_TEMPLATES.length;
  const base = note.trim().length > cleanTitle.length ? note.trim() : cleanTitle;
  const cap = base.charAt(0).toUpperCase() + base.slice(1);
  return { title: cleanTitle, description: POLISH_TEMPLATES[seed](cap) };
}

// ---------- Tones ----------

export function toneNote(tone: 'polite' | 'formal' | 'firm', totalLabel: string, dueDate: string): string {
  if (tone === 'formal')
    return `Payment terms: ${totalLabel} due on ${dueDate}. Please remit per the payment details above and quote the invoice number. Statutory late fees may apply thereafter.`;
  if (tone === 'firm')
    return `OVERDUE NOTICE READY: ${totalLabel} was due ${dueDate}. Please pay immediately to avoid late fees and service pause. Reply with proof of payment today.`;
  return `Thank you so much for your business! ${totalLabel} is kindly due by ${dueDate}. Pay with the QR/link above — and just reply if you need anything. 💛`;
}

export function buildShareText(inv: string, client: string, total: string, due: string, link: string): string {
  return `Invoice ${inv} for ${client}: ${total} due ${due}. Pay: ${link || 'see invoice PDF'}`;
}
