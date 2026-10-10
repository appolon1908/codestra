import { readFileSync, existsSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

describe('public chat integration contract', () => {
  it('gates page content behind a widget navigation boundary', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    expect(app).toContain('<ChatWidgetBoundary>');
    expect(app.indexOf('<ChatWidgetBoundary>')).toBeLessThan(app.indexOf('<SessionProvider>'));
  });
  it('keeps loader out of unconditional HTML', () => {
    expect(readFileSync('index.html', 'utf8')).not.toContain('widgets.leadconnectorhq.com/loader.js');
  });
  it('provides reviewed messaging terms and footer navigation', () => {
    expect(existsSync('src/Pages/Terms/Terms.tsx')).toBe(true);
    expect(readFileSync('src/Components/Layouts/Footer.tsx', 'utf8')).toContain('to="/terms"');
  });
  it('allows the provider without disabling script protections', () => {
    const config=readFileSync('nginx.conf','utf8');
    expect(config).toContain('https://widgets.leadconnectorhq.com');
    expect(config).not.toMatch(/script-src[^;]*unsafe-eval/);
    expect(config).not.toMatch(/script-src[^;]*unsafe-inline/);
  });
});

describe('observed vendor dependencies', () => {
  it('allows phone input and session resources in both deployment configs', () => {
    for (const path of ['nginx.conf', 'deploy/leadconnector-nginx-lan.conf']) {
      const config = readFileSync(path, 'utf8');
      expect(config).toContain('https://stcdn.leadconnectorhq.com');
      expect(config).toContain('https://services.leadconnectorhq.com/appengine/cors/js/user-session.js');
    }
  });
});


describe('privacy-preserving font loading', () => {
  it('does not request the blocked remote font stylesheet', () => {
    const css = readFileSync('src/index.css', 'utf8');
    expect(css).not.toMatch(/@import\s+url\(['"]?https?:/);
    expect(css).toContain('system-ui');
  });
});
