import { useCallback, useState } from 'react';
import { aiPromptSchema } from '../schemas/invoice.schema';
import type { AiParseResult } from '../types/invoice';
import { parseInvoicePrompt } from '../lib/aiParser';
import { useInvoiceStore } from '../store/useInvoiceStore';

export type GenStatus = 'idle' | 'parsing' | 'done' | 'error';

/**
 * useInvoiceGenerator — explicit, predictable AI prompt flow.
 * No auto-apply while typing: user hits Generate (or Enter), we validate
 * with Zod, parse on-device, refuse empty parses with guidance, else apply
 * to the store and expose the result for the summary UI.
 */
export function useInvoiceGenerator() {
  const [status, setStatus] = useState<GenStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiParseResult | null>(null);
  const applyAiItems = useInvoiceStore((s) => s.applyAiItems);
  const issueDate = useInvoiceStore((s) => s.issueDate);

  const run = useCallback(
    (raw: string) => {
      const check = aiPromptSchema.safeParse(raw);
      if (!check.success) {
        setStatus('error');
        setResult(null);
        setError(check.error.issues[0]?.message ?? 'Invalid prompt');
        return;
      }
      setStatus('parsing');
      setError(null);
      // Let the UI paint the spinner before the (fast) synchronous parse.
      window.setTimeout(() => {
        try {
          const r = parseInvoicePrompt(raw, issueDate);
          if (r.items.length === 0) {
            setStatus('error');
            setResult(null);
            setError(
              'No amounts found — include at least one like $800. Example: "Billed Jane $800 for 10h design plus $50 icons, 10% discount, net 14".',
            );
            return;
          }
          applyAiItems(
            r.billToName,
            r.items,
            r.discountRate,
            r.taxRate,
            r.dueInDays,
            r.currencyHint,
            r.billToEmail,
          );
          setResult(r);
          setStatus('done');
        } catch {
          setStatus('error');
          setResult(null);
          setError('Could not parse that prompt. Try: "Billed Jane $800 for 10h design plus $50 icons, 10% discount, net 14".');
        }
      }, 250);
    },
    [applyAiItems, issueDate],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  return { run, reset, status, error, result };
}
