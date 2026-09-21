import type { CurrencyCode } from '../types/invoice';

const LOCALE: Record<CurrencyCode, string> = {
  USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', INR: 'en-IN', JPY: 'ja-JP',
  CAD: 'en-CA', AUD: 'en-AU', AED: 'ar-AE', NGN: 'en-NG', BRL: 'pt-BR',
};

// Static illustrative FX base USD (free, offline). Marked "estimate".
export const FX_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.2, JPY: 156.4,
  CAD: 1.37, AUD: 1.52, AED: 3.67, NGN: 1480, BRL: 5.42,
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  try {
    return new Intl.NumberFormat(LOCALE[currency] ?? 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function convertEstimate(amountUSD: number, to: CurrencyCode): number {
  return Math.round(amountUSD * (FX_FROM_USD[to] ?? 1) * 100) / 100;
}

export const TAX_PRESETS: Array<{ region: string; rate: number }> = [
  { region: 'No tax (0%)', rate: 0 },
  { region: 'US avg sales ~7%', rate: 7 },
  { region: 'EU VAT ~20%', rate: 20 },
  { region: 'UK VAT 20%', rate: 20 },
  { region: 'India GST 18%', rate: 18 },
  { region: 'UAE VAT 5%', rate: 5 },
];
