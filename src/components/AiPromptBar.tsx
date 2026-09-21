import { useState } from 'react';
import { useInvoiceGenerator } from '../hooks/useInvoiceGenerator';

const EXAMPLES = [
  'Billed John Doe $1,500 for 30 hours of React dev plus $200 hosting setup, 15% discount, due net 14',
  'Invoice Acme Corp $800 for 10h UI design plus $50 icons, 10% discount, 8% tax, net 30',
  'Billed Beta LLC at $50/hr for 20 hours of consulting, due in 7 days',
];

export function AiPromptBar() {
  const { run, status, error, result } = useInvoiceGenerator();
  const [val, setVal] = useState('');
  const busy = status === 'parsing';

  const submit = () => {
    if (!val.trim() || busy) return;
    run(val);
  };

  return (
    <section className="ai-bar" aria-label="AI invoice creator">
      <h2>✨ AI Invoice Prompt</h2>
      <p>Describe the job in plain words — client, work, amounts, discount, tax, due date. Free, on-device, no login.</p>
      <div className="ai-row">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="e.g. Billed John Doe $1,500 for 30 hours of React dev…"
          aria-label="Natural language invoice prompt"
        />
        <button className="btn btn-lime" onClick={submit} disabled={busy || !val.trim()}>
          {busy ? '…' : 'Generate'}
        </button>
      </div>
      <div className="chips" style={{ marginTop: 10 }}>
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="chip chip-dark" onClick={() => setVal(ex)} title={ex}>
            Try example {i + 1}
          </button>
        ))}
      </div>
      {status === 'error' && <div className="status err">{error}</div>}
      {busy && <div className="status busy">Parsing…</div>}
      {status === 'done' && result && (
        <div className="ai-result">
          <strong>✓ Applied to editor &amp; preview</strong>
          <ul>
            {result.billToName && <li>Client: {result.billToName}</li>}
            <li>
              Items ({result.items.length}):{' '}
              {result.items.map((it) => `${it.qty}× ${it.title} @ ${it.rate}`).join(' · ')}
            </li>
            {result.discountRate > 0 && <li>Discount: {result.discountRate}%</li>}
            {result.taxRate > 0 && <li>Tax: {result.taxRate}%</li>}
            {result.dueInDays != null && <li>Due in {result.dueInDays} days</li>}
            {result.currencyHint && <li>Currency: {result.currencyHint}</li>}
          </ul>
        </div>
      )}
    </section>
  );
}
