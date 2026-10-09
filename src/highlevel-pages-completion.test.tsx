import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import LegalPage from './Pages/Legal/LegalPage';
import content from './Pages/Legal/legalContent.json';
import { isPublicChatPath } from './lib/chatWidget';
vi.mock('./Components/Layouts/Navbar', () => ({ default: () => null }));
vi.mock('./Components/Layouts/Footer', () => ({ default: () => null }));

describe('complete public review pages', () => {
  it.each(['/sms', '/sms-terms', '/contact-information'])('loads the approved widget on %s', path => {
    expect(isPublicChatPath(path)).toBe(true);
    expect(isPublicChatPath(path+'/')).toBe(true);
  });
  it.each([['sms','SMS Updates'],['smsTerms','SMS Terms'],['contactInformation','Business Contact Information']])('renders real %s page content without requiring JavaScript', (kind,title) => {
    expect(content).toHaveProperty(kind);
    const html=renderToStaticMarkup(<LegalPage kind={kind as Parameters<typeof LegalPage>[0]['kind']} />);
    expect(html).toContain(title);
    expect(html).toContain('CODESTRA LLC');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/terms"');
    expect(html).not.toMatch(/<form|type="checkbox"|type="tel"/);
  });
  it('serves the complete messaging rules', () => {
    expect(content).toHaveProperty('smsTerms');
    const html=renderToStaticMarkup(<LegalPage kind={'smsTerms' as Parameters<typeof LegalPage>[0]['kind']} />);
    for(const text of ['STOP','HELP','rates may apply','frequency','Carriers','support@codestra.co']) expect(html).toContain(text);
  });
  it('prerenders all five documents rather than returning the empty SPA shell', () => {
    const dir=mkdtempSync(join(tmpdir(),'codestra-legal-'));
    try {
      mkdirSync(join(dir,'src/Pages/Legal'),{recursive:true});mkdirSync(join(dir,'dist'));
      writeFileSync(join(dir,'src/Pages/Legal/legalContent.json'),readFileSync('src/Pages/Legal/legalContent.json'));
      writeFileSync(join(dir,'dist/index.html'),'<!doctype html><html><head><title>Codestra</title></head><body><div id="root"></div></body></html>');
      execFileSync(process.execPath,[resolve('scripts/prerender-legal.mjs')],{cwd:dir});
      for(const route of ['privacy','terms','sms','sms-terms','contact-information']) {
        const html=readFileSync(join(dir,'dist',route,'index.html'),'utf8');
        expect(html).toContain('<h1');expect(html).toContain('CODESTRA LLC');
        expect(html).toContain(`href="https://codestra.co/${route}"`);
        expect(html).not.toContain('<div id="root"></div>');
      }
    } finally {rmSync(dir,{recursive:true,force:true});}
  });
});
