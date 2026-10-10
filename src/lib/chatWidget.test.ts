// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { CHAT_WIDGET_ID, CHAT_LOADER_ID, ensureChatWidget, isPublicChatPath } from './chatWidget';

describe('public widget loader', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  it.each(['/', '/about', '/contact', '/contact/sales', '/contact/support/', '/privacy', '/terms', '/services'])('allows public route %s', path => {
    expect(isPublicChatPath(path)).toBe(true);
  });
  it.each(['/login', '/signup', '/dashboard', '/admin', '/api/docs', '/electronic-billing/form', '/hiring/positions', '/contact/private', '/Contact', '/%63ontact', '//contact', '/contact//'])('denies nonpublic route %s', path => {
    expect(isPublicChatPath(path)).toBe(false);
  });
  it('loads the exact approved widget once, including StrictMode-style repeated setup', () => {
    const first=ensureChatWidget();
    const second=ensureChatWidget();
    expect(first).toBe(second);
    expect(document.querySelectorAll(`#${CHAT_LOADER_ID}`)).toHaveLength(1);
    expect(first.src).toBe('https://widgets.leadconnectorhq.com/loader.js');
    expect(first.dataset.widgetId).toBe(CHAT_WIDGET_ID);
    expect(first.dataset.resourcesUrl).toBe('https://widgets.leadconnectorhq.com/chat-widget/loader.js');
    expect(first.dataset.source).toBe('WEB_USER');
    expect(first.async).toBe(true);
  });
  it('records failure without submitting forms or disabling the page', () => {
    const script=ensureChatWidget();
    script.dispatchEvent(new Event('error'));
    expect(script.dataset.loadState).toBe('failed');
    expect(document.querySelector('form')).toBeNull();
  });
});
