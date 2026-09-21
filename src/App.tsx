import { useMemo, useState } from 'react';
import { AiPromptBar } from './components/AiPromptBar';
import { InvoiceEditor } from './components/InvoiceEditor';
import { LivePreview } from './components/LivePreview';
import { TemplateSwitcher } from './components/TemplateSwitcher';
import { ToneSelector } from './components/ToneSelector';
import { BrandControls } from './components/BrandControls';
import { PricingPage, type Route } from './pages/Pricing';
import { useInvoiceStore, selectTotals } from './store/useInvoiceStore';
import { useAutoSave } from './hooks/useAutoSave';
import { usePdfExport } from './hooks/usePdfExport';
import { formatMoney } from './lib/currency';
import { buildShareText } from './lib/aiParser';

export default function App() {
  const [route, setRoute] = useState<Route>('gen');
  const inv = useInvoiceStore();
  const reset = useInvoiceStore((s) => s.reset);
  const totals = useMemo(() => selectTotals(inv), [inv]);
  const saveState = useAutoSave(JSON.stringify([inv.invoiceNo, inv.items, inv.billTo, inv.currency, inv.template]));
  const { exportPdf, busy } = usePdfExport();

  const go = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  };

  const share = async () => {    const text = buildShareText(inv.invoiceNo, inv.billTo.name || 'Client', formatMoney(totals.total, inv.currency), inv.dueDate, inv.paymentLink);
    try {
      await navigator.clipboard.writeText(text);
      alert('Invoice summary copied to clipboard ✓');
    } catch {
      alert(text);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="logo logo-brand">
          <img
            src="/logo.png"
            alt="Fastit logo"
            className="brand-mark"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          Fast Invoicely <span>FREE</span>
        </div>
        <nav className="topnav" aria-label="Site">
          <button className={`topnav-btn${route === 'gen' ? ' active' : ''}`} onClick={() => go('gen')}>Generator</button>
          <button className={`topnav-btn${route === 'pricing' ? ' active' : ''}`} onClick={() => go('pricing')}>Pricing</button>
        </nav>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="pill">{saveState === 'saved' ? '● Auto-saved' : '○ Saving…'}</span>
          <span className="pill">{formatMoney(totals.total, inv.currency)}</span>
        </div>
      </header>

      {route === 'pricing' ? (
        <PricingPage onNavigate={go} />
      ) : (
      <main className="layout">
        <section className="editor-col">
          <AiPromptBar />
          <TemplateSwitcher />
          <BrandControls />
          <ToneSelector />
          <InvoiceEditor />
        </section>

        <section className="preview-wrap">
          <div className="toolbar">
            <button className="btn btn-primary" disabled={busy} onClick={() => void exportPdf('invoice-sheet', inv.invoiceNo)}>
              {busy ? 'Exporting…' : '⬇ Download PDF'}
            </button>
            <button className="btn" onClick={() => window.print()}>🖨 Print</button>
            <button className="btn btn-lime" onClick={() => void share()}>🔗 Share / Copy</button>
            <button className="btn" onClick={() => { if (confirm('Reset invoice?')) reset(); }}>Reset</button>
          </div>
          <LivePreview />
          <p style={{ fontSize: 12, color: '#6b6b66', marginTop: 10 }}>
            100% free · No login · Data stays in your browser (localStorage) · FX &amp; late-fees are estimates. · A{' '}
            <a href="https://www.fastitgroup.in" target="_blank" rel="noreferrer">Fastit Group of Solutions</a> product.
          </p>
        </section>
      </main>
      )}
    </>
  );
}
