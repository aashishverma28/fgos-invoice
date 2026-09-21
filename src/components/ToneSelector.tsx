import type { ReminderTone } from '../types/invoice';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { toneNote } from '../lib/aiParser';
import { formatMoney } from '../lib/currency';
import { selectTotals } from '../store/useInvoiceStore';

const TONES: ReminderTone[] = ['polite', 'formal', 'firm'];

export function ToneSelector() {
  const tone = useInvoiceStore((s) => s.tone);
  const setTone = useInvoiceStore((s) => s.setTone);
  const update = useInvoiceStore((s) => s.update);
  const s = useInvoiceStore();
  const t = selectTotals(s);

  const apply = (next: ReminderTone) => {
    setTone(next);
    update({ notes: toneNote(next, formatMoney(t.total, s.currency), s.dueDate) });
  };

  return (
    <div className="bento">
      <h2><i style={{ background: '#FF6B4A' }} />AI Tone — reminders &amp; terms</h2>
      <div className="chips">
        {TONES.map((x) => (
          <button key={x} className={`chip${tone === x ? ' active' : ''}`} onClick={() => apply(x)}>
            {x}
          </button>
        ))}
      </div>
    </div>
  );
}
