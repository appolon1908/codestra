import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import Privacy from './Pages/Privacy/Privacy';
import Terms from './Pages/Terms/Terms';
vi.mock('./Components/Layouts/Navbar', () => ({ default: () => null }));
vi.mock('./Components/Layouts/Footer', () => ({ default: () => null }));

describe('HighLevel public policy page requirements', () => {
  it('identifies the registered business and data handling in the privacy policy', () => {
    const html = renderToStaticMarkup(<Privacy />);
    for (const text of ['CODESTRA LLC', 'Information we collect', 'Retention', 'support@codestra.co']) expect(html).toContain(text);
  });
  it('includes the mobile information and consent non-sharing clause', () => {
    const html = renderToStaticMarkup(<Privacy />);
    expect(html).toContain('No mobile information will be shared');
    expect(html).toContain('text messaging originator opt-in data and consent');
    expect(html).toContain('href="/terms"');
  });
  it('identifies message purposes, separate consent, and re-enrollment in the terms', () => {
    const html = renderToStaticMarkup(<Terms />);
    for (const text of ['Terms &amp; Conditions', 'CODESTRA LLC', 'service and project updates', 'separate marketing consent', 'new opt-in']) expect(html).toContain(text);
  });
  it('keeps opt-out, help, rates, frequency, privacy and support visible', () => {
    const html = renderToStaticMarkup(<Terms />);
    for (const text of ['STOP', 'HELP', 'frequency varies', 'Message and data rates may apply', 'Carriers are not liable', 'href="/privacy"', 'mailto:support@codestra.co']) expect(html).toContain(text);
  });
});

import { readFileSync, existsSync } from 'node:fs';
describe('policy delivery and form access', () => {
  it('renders policy pages in the build for visitors without JavaScript', () => {
    expect(JSON.parse(readFileSync('package.json','utf8')).scripts.build).toContain('prerender-legal.mjs');
    expect(existsSync('scripts/prerender-legal.mjs')).toBe(true);
  });
  it.each(['Contact/ContactSales','ElectronicBilling/ElectronicBilling','BillingForm/ElectronicBillingForm','Login/Login','Signup/Signup'])('provides nearby policy access at %s', page => {
    expect(readFileSync(`src/Pages/${page}.tsx`,'utf8')).toContain('<FormLegalLinks />');
  });
});
