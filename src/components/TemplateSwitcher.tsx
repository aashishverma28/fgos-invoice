import type { TemplateId } from '../types/invoice';
import { useInvoiceStore } from '../store/useInvoiceStore';

const OPTIONS: Array<{ id: TemplateId; label: string }> = [
  { id: 'neo-brutalist', label: 'Neo-Brutal' },
  { id: 'cyber-glass', label: 'Cyber Glass' },
  { id: 'editorial-swiss', label: 'Swiss Edit' },
  { id: 'gradient-bento', label: 'Bento Pop' },
  { id: 'executive-monolith', label: 'Executive' },
];

export function TemplateSwitcher() {
  const template = useInvoiceStore((s) => s.template);
  const setTemplate = useInvoiceStore((s) => s.setTemplate);
  return (
    <div className="bento">
      <h2><i />1-click Theme</h2>
      <div className="chips" role="tablist" aria-label="Invoice themes">
        {OPTIONS.map((o) => (
          <button key={o.id} className={`chip${template === o.id ? ' active' : ''}`} onClick={() => setTemplate(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
