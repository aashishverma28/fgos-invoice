import { memo, useMemo } from 'react';
import { useInvoiceStore, selectTotals } from '../store/useInvoiceStore';
import { useCurrency } from '../hooks/useCurrency';
import { TplBento, TplCyber, TplMono, TplNeo, TplSwiss } from '../templates/templates';

/** LivePreview — memoized to avoid re-render churn while typing. */
export const LivePreview = memo(function LivePreview() {
  const inv = useInvoiceStore();
  const totals = useMemo(
    () => selectTotals(inv),
    [inv.items, inv.taxRate, inv.discountRate, inv.discountFlat, inv.lateFeeRate],
  );
  const { fmt } = useCurrency(inv.currency);
  const props = useMemo(() => ({ inv, totals, fmt }), [inv, totals, fmt]);

  return (
    <div className="sheet" id="invoice-sheet" aria-live="polite">
      {inv.template === 'neo-brutalist' && <TplNeo {...props} />}
      {inv.template === 'cyber-glass' && <TplCyber {...props} />}
      {inv.template === 'editorial-swiss' && <TplSwiss {...props} />}
      {inv.template === 'gradient-bento' && <TplBento {...props} />}
      {inv.template === 'executive-monolith' && <TplMono {...props} />}
    </div>
  );
});
