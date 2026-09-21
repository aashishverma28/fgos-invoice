import { useMemo } from 'react';
import type { CurrencyCode } from '../types/invoice';
import { formatMoney } from '../lib/currency';

export function useCurrency(currency: CurrencyCode) {
  return useMemo(
    () => ({ fmt: (n: number) => formatMoney(n, currency) }),
    [currency],
  );
}
