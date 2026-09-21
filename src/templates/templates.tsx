import { memo, useMemo } from 'react';
import type { InvoiceState, Totals } from '../types/invoice';
import { useCurrency } from '../hooks/useCurrency';
import { selectTotals, useInvoiceStore } from '../store/useInvoiceStore';
import { QrPayBlock } from '../components/QrPayBlock';

interface DocProps { inv: InvoiceState; totals: Totals; fmt: (n: number) => string }

function Lines({ inv, fmt }: DocProps) {
  return (
    <table className="lines">
      <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
      <tbody>
        {inv.items.map((it) => (
          <tr key={it.id}>
            <td><strong>{it.title}</strong>{it.description && <div style={{ opacity: 0.7, fontSize: 12 }}>{it.description}</div>}</td>
            <td>{it.qty}</td><td>{fmt(it.rate)}</td>
            <td style={{ textAlign: 'right' }}>{fmt(it.qty * it.rate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TotalsBlock({ totals, fmt }: DocProps) {
  return (
    <div className="totals">
      <div><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
      <div><span>Discount</span><span>−{fmt(totals.discount)}</span></div>
      <div><span>Tax</span><span>{fmt(totals.tax)}</span></div>
      <div className="grand"><span>Total</span><span>{fmt(totals.total)}</span></div>
      <div style={{ fontSize: 12, opacity: 0.7 }}><span>Late-fee est./mo</span><span>{fmt(totals.lateFeeEstimate)}</span></div>
    </div>
  );
}

function Meta({ inv }: DocProps) {
  return (
    <div className="meta">
      <span><strong>{inv.invoiceNo}</strong></span>
      <span>Issued {inv.issueDate}</span>
      <span>Due {inv.dueDate}</span>
      {inv.poNumber && <span>PO {inv.poNumber}</span>}
      {inv.taxId && <span>Tax ID {inv.taxId}</span>}
      {inv.paymentTerms && <span>{inv.paymentTerms}</span>}
    </div>
  );
}

function BrandMark({ inv }: DocProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {inv.logoDataUrl
        ? <img src={inv.logoDataUrl} alt="logo" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 10 }} />
        : <div style={{ width: 46, height: 46, borderRadius: 12, background: inv.brandColor, border: '2px solid #000' }} />}
      <div><strong>{inv.from.name}</strong><div style={{ fontSize: 12, opacity: 0.75 }}>{inv.from.email} · {inv.from.address}</div></div>
    </div>
  );
}

// Five distinct themes — presentation only, same data
export const TplNeo = (p: DocProps) => (
  <div className="tpl tpl-neo">
    <div><span className="badge">★ INVOICE</span> <span className="badge" style={{ background: '#fff' }}>{p.inv.invoiceNo}</span></div>
    <h1>{p.inv.billTo.name || 'Client'}</h1>
    <div className="rule" style={{ borderTop: '4px solid #000', margin: '14px 0' }} />
    <BrandMark {...p} />
    <Meta {...p} />
    <Lines {...p} /><TotalsBlock {...p} />
    <p style={{ fontWeight: 700 }}>{p.inv.notes}</p>
    <QrPayBlock link={p.inv.paymentLink} color={p.inv.brandColor} />
  </div>
);

export const TplCyber = (p: DocProps) => (
  <div className="tpl tpl-cyber"><div className="glass">
    <div style={{ fontSize: 12, letterSpacing: 4 }}>◈ INVOICE // {p.inv.invoiceNo}</div>
    <h1>{(p.inv.billTo.name || 'CLIENT').toUpperCase()}</h1>
    <BrandMark {...p} /><Meta {...p} /><Lines {...p} /><TotalsBlock {...p} />
    <p style={{ opacity: 0.8 }}>{p.inv.notes}</p>
    <QrPayBlock link={p.inv.paymentLink} color={p.inv.brandColor} />
  </div></div>
);

export const TplSwiss = (p: DocProps) => (
  <div className="tpl tpl-swiss">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Invoice</span><span>N° {p.inv.invoiceNo}</span></div>
    <h1>Invoice<br />{p.inv.billTo.name}</h1>
    <div className="asym" style={{ marginTop: 20 }}>
      <div><BrandMark {...p} /><Lines {...p} /></div>
      <div><Meta {...p} /><TotalsBlock {...p} /><p style={{ fontStyle: 'italic' }}>{p.inv.notes}</p></div>
    </div>
    <QrPayBlock link={p.inv.paymentLink} color={p.inv.brandColor} />
  </div>
);

export const TplBento = (p: DocProps) => (
  <div className="tpl tpl-bento">
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <BrandMark {...p} />
      <div style={{ background: p.inv.brandColor, color: '#fff', borderRadius: 999, padding: '8px 16px', fontWeight: 900 }}>{p.inv.invoiceNo}</div>
    </div>
    <h1 style={{ marginTop: 16 }}>Hey {p.inv.billTo.name || 'there'} 👋</h1>
    <div className="card"><Meta {...p} /><Lines {...p} /><TotalsBlock {...p} /></div>
    <div className="card" style={{ marginTop: 12 }}>{p.inv.notes}</div>
    <QrPayBlock link={p.inv.paymentLink} color={p.inv.brandColor} />
  </div>
);

export const TplMono = (p: DocProps) => (
  <div className="tpl tpl-mono">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><BrandMark {...p} /><div style={{ textAlign: 'right' }}><h1>INVOICE</h1><div>{p.inv.invoiceNo}</div></div></div>
    <Meta {...p} /><Lines {...p} /><TotalsBlock {...p} />
    <div style={{ marginTop: 16, fontSize: 13, borderTop: '2px solid #0f172a', paddingTop: 10 }}>{p.inv.notes} — Bill to: {p.inv.billTo.name} {p.inv.billTo.address}</div>
    <QrPayBlock link={p.inv.paymentLink} color={p.inv.brandColor} />
  </div>
);
