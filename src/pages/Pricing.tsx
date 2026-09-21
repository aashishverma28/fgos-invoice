import { useState } from 'react';

export type Route = 'gen' | 'pricing';

interface Tier {
  name: string;
  tagline: string;
  cta: string;
  featured?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: 'Starter',
    tagline: 'Everything you need to send your first invoice today.',
    cta: 'Start free',
    features: [
      'Unlimited invoices',
      'All 5 invoice themes',
      'AI prompt + Magic Polish',
      'PDF download, print & share',
      'QR payment blocks',
      'No login, data stays in your browser',
    ],
  },
  {
    name: 'Pro',
    tagline: 'For freelancers who bill every week.',
    cta: 'Start free',
    featured: true,
    features: [
      'Everything in Starter',
      'White-label PDFs (no branding)',
      'Custom brand kits & fonts',
      'Recurring invoices',
      'Automatic payment reminders',
      'Priority support',
    ],
  },
  {
    name: 'Team',
    tagline: 'For studios & agencies billing together.',
    cta: 'Start free',
    features: [
      'Everything in Pro',
      '5 seats included',
      'Shared client book',
      'Roles & approval flow',
      'Audit log & exports',
      'Dedicated support',
    ],
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'Is it really ₹0? What is the catch?',
    a: 'No catch. Every plan — Starter, Pro, and Team — costs ₹0 forever. No credit card, no trial, no locked features, no invoice limits.',
  },
  {
    q: 'Do I need an account to use Invoicely?',
    a: 'No. The generator works instantly in your browser and auto-saves to localStorage. There is nothing to sign up for.',
  },
  {
    q: 'Where is my invoice data stored?',
    a: '100% in your own browser (localStorage). Nothing is uploaded anywhere. Clear your browser data and it is gone — export PDFs for safekeeping.',
  },
  {
    q: 'Will you ever add paid plans?',
    a: 'No. Invoicely is free software, free forever. If hosting costs ever need covering, it will be through optional donations — never paywalls.',
  },
  {
    q: 'Do you take a cut of my payments?',
    a: 'Never. QR codes and payment links point straight at your Stripe, PayPal, bank, or UPI details. Money moves only between you and your client.',
  },
];

export function PricingPage({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="pricing-page">
      <section className="pricing-hero">
        <span className="badge">★ 100% FREE</span>
        <h1>
          Absolutely free.
          <br />
          ₹0. Forever.
        </h1>
        <p>No paid plans. No trials. No credit card. Every feature on this page costs exactly ₹0 — pick any plan, it is all free.</p>
      </section>

      <section className="tier-grid">
        {TIERS.map((t) => (
          <article key={t.name} className={`tier-card${t.featured ? ' featured' : ''}`}>
            {t.featured && <span className="badge badge-lime">MOST POPULAR</span>}
            <h2>{t.name}</h2>
            <p className="tier-tag">{t.tagline}</p>
            <div className="price-row">
              <span className="price">₹0</span>
            </div>
            <div className="price-sub">free forever, no card required</div>
            <button className={`btn ${t.featured ? 'btn-lime' : 'btn-primary'} tier-cta`} onClick={() => onNavigate('gen')}>
              {t.cta} →
            </button>
            <ul className="feat-list">
              {t.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="bento faq">
        <h2>
          <i /> Questions, answered
        </h2>
        {FAQS.map((f, i) => (
          <div key={f.q} className="faq-item">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
              {f.q}
              <span>{openFaq === i ? '−' : '+'}</span>
            </button>
            {openFaq === i && <p>{f.a}</p>}
          </div>
        ))}
      </section>

      <section className="cta-banner">
        <h2>Everything here costs ₹0. Go bill someone.</h2>
        <p>No signup. No credit card. Just type a sentence and hit Generate.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('gen')}>
          Open the free generator →
        </button>
      </section>

      <footer className="site-footer">
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
        <div className="foot-links">
          <button onClick={() => onNavigate('gen')}>Generator</button>
          <button onClick={() => onNavigate('pricing')}>Pricing</button>
        </div>
        <small>
          © 2026 Fast Invoicely · A{' '}
          <a href="https://www.fastitgroup.in" target="_blank" rel="noreferrer">
            Fastit Group of Solutions
          </a>{' '}
          product · Absolutely free (₹0) forever · No login required
        </small>
      </footer>
    </div>
  );
}
