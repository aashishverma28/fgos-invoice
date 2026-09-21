import { memo, useCallback } from 'react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { polishLineItem } from '../lib/aiParser';

const ItemRow = memo(function ItemRow({ id }: { id: string }) {
  const item = useInvoiceStore((s) => s.items.find((i) => i.id === id)!);
  const updateItem = useInvoiceStore((s) => s.updateItem);
  const removeItem = useInvoiceStore((s) => s.removeItem);

  const polish = useCallback(() => {
    const p = polishLineItem(item.title, item.description);
    updateItem(id, { description: p.description });
  }, [id, item.title, item.description, updateItem]);

  if (!item) return null;
  return (
    <div className="item-card">
      <div className="grid2">
        <label className="f">Title<input value={item.title} onChange={(e) => updateItem(id, { title: e.target.value })} /></label>
        <label className="f">Description
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={item.description} onChange={(e) => updateItem(id, { description: e.target.value })} placeholder="short note…" />
            <button className="btn btn-sm btn-violet" title="Magic Polish — expand into client-ready copy" onClick={polish}>✨</button>
          </div>
        </label>
        <label className="f">Qty<input type="number" min={0} step="any" value={item.qty} onChange={(e) => updateItem(id, { qty: Number(e.target.value) })} /></label>
        <label className="f">Rate<input type="number" min={0} step="any" value={item.rate} onChange={(e) => updateItem(id, { rate: Number(e.target.value) })} /></label>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <strong>${(item.qty * item.rate).toFixed(2)}</strong>
        <button className="btn btn-sm" onClick={() => removeItem(id)}>Remove</button>
      </div>
    </div>
  );
});

export function InvoiceEditor() {
  const s = useInvoiceStore();
  const update = useInvoiceStore((st) => st.update);
  const addItem = useInvoiceStore((st) => st.addItem);

  return (
    <div>
      <div className="bento">
        <h2><i />Document</h2>
        <div className="grid3">
          <label className="f">No.<input value={s.invoiceNo} onChange={(e) => update({ invoiceNo: e.target.value })} /></label>
          <label className="f">Issue<input type="date" value={s.issueDate} onChange={(e) => update({ issueDate: e.target.value })} /></label>
          <label className="f">Due<input type="date" value={s.dueDate} onChange={(e) => update({ dueDate: e.target.value })} /></label>
          <label className="f">PO<input value={s.poNumber} onChange={(e) => update({ poNumber: e.target.value })} placeholder="PO-…" /></label>
          <label className="f">Tax ID<input value={s.taxId} onChange={(e) => update({ taxId: e.target.value })} /></label>
          <label className="f">Terms<input value={s.paymentTerms} onChange={(e) => update({ paymentTerms: e.target.value })} /></label>
        </div>
      </div>

      <div className="bento">
        <h2><i style={{ background: '#FF6B4A' }} />Parties</h2>
        <div className="grid2">
          <label className="f">From — name<input value={s.from.name} onChange={(e) => update({ from: { ...s.from, name: e.target.value } })} /></label>
          <label className="f">From — email<input value={s.from.email} onChange={(e) => update({ from: { ...s.from, email: e.target.value } })} /></label>
          <label className="f">Bill to — name<input value={s.billTo.name} onChange={(e) => update({ billTo: { ...s.billTo, name: e.target.value } })} /></label>
          <label className="f">Bill to — email<input value={s.billTo.email} onChange={(e) => update({ billTo: { ...s.billTo, email: e.target.value } })} /></label>
          <label className="f">From address<input value={s.from.address} onChange={(e) => update({ from: { ...s.from, address: e.target.value } })} /></label>
          <label className="f">Bill-to address<input value={s.billTo.address} onChange={(e) => update({ billTo: { ...s.billTo, address: e.target.value } })} /></label>
        </div>
      </div>

      <div className="bento">
        <h2><i />Line items</h2>
        {s.items.map((it) => <ItemRow key={it.id} id={it.id} />)}
        <button className="btn" onClick={addItem}>+ Add item</button>
      </div>

      <div className="bento">
        <h2><i />Totals &amp; payment</h2>
        <div className="grid3">
          <label className="f">Tax %<input type="number" min={0} max={60} step="any" value={s.taxRate} onChange={(e) => update({ taxRate: Number(e.target.value) })} /></label>
          <label className="f">Discount %<input type="number" min={0} max={90} step="any" value={s.discountRate} onChange={(e) => update({ discountRate: Number(e.target.value) })} /></label>
          <label className="f">Late fee %/mo<input type="number" min={0} max={30} step="any" value={s.lateFeeRate} onChange={(e) => update({ lateFeeRate: Number(e.target.value) })} /></label>
        </div>
        <label className="f" style={{ marginTop: 10 }}>Payment link (Stripe / PayPal / UPI)<input value={s.paymentLink} onChange={(e) => update({ paymentLink: e.target.value })} placeholder="https://…" /></label>
        <label className="f" style={{ marginTop: 10 }}>Notes / terms<textarea rows={3} value={s.notes} onChange={(e) => update({ notes: e.target.value })} /></label>
      </div>
    </div>
  );
}
