import { useInvoiceStore } from '../store/useInvoiceStore';
import type { CurrencyCode } from '../types/invoice';
import { TAX_PRESETS } from '../lib/currency';

const CURRENCIES: CurrencyCode[] = ['USD','EUR','GBP','INR','JPY','CAD','AUD','AED','NGN','BRL'];

export function BrandControls() {
  const s = useInvoiceStore();
  const update = useInvoiceStore((st) => st.update);
  const setLogo = useInvoiceStore((st) => st.setLogo);
  const setCurrency = useInvoiceStore((st) => st.setCurrency);

  const onLogo = async (f: File | undefined) => {
    if (!f) return;
    const buf = await f.arrayBuffer();
    // downscale via canvas to keep localStorage small
    const blob = new Blob([buf]);
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const scale = Math.min(1, 320 / img.width);
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
      setLogo(c.toDataURL('image/png'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="bento">
      <h2><i style={{ background: '#D4FF3F' }} />Brand &amp; Money</h2>
      <div className="grid2">
        <label className="f">Brand color
          <input type="color" value={s.brandColor} onChange={(e) => update({ brandColor: e.target.value })} />
        </label>
        <label className="f">Currency
          <select value={s.currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="f">Logo upload
          <input type="file" accept="image/*" onChange={(e) => void onLogo(e.target.files?.[0])} />
        </label>
        <label className="f">Tax preset
          <select onChange={(e) => update({ taxRate: Number(e.target.value) })} defaultValue={String(s.taxRate)}>
            {TAX_PRESETS.map((p) => <option key={p.region} value={p.rate}>{p.region}</option>)}
          </select>
        </label>
      </div>
      {s.logoDataUrl && <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => setLogo(null)}>Remove logo</button>}
    </div>
  );
}
