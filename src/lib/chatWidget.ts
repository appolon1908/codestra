/** Public widget identifiers, not credentials. No private API token belongs here. */
export const CHAT_WIDGET_ID = '6ac7add4b17ff091c6b9a42c';
export const CHAT_LOCATION_ID = 'jpzEheys0lV7R6jsD8W9';
export const CHAT_LOADER_ID = 'codestra-leadconnector-loader';
const PUBLIC_PATHS = new Set(['/', '/about', '/case-studies', '/contact', '/contact/sales', '/contact/support', '/services', '/privacy', '/terms']);

export function isPublicChatPath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return PUBLIC_PATHS.has(path);
}

export function ensureChatWidget(doc: Document = document): HTMLScriptElement {
  const existing = doc.getElementById(CHAT_LOADER_ID);
  if (existing instanceof HTMLScriptElement) return existing;
  const script = doc.createElement('script');
  script.id = CHAT_LOADER_ID;
  script.async = true;
  script.src = 'https://widgets.leadconnectorhq.com/loader.js';
  script.dataset.resourcesUrl = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';
  script.dataset.widgetId = CHAT_WIDGET_ID;
  script.dataset.source = 'WEB_USER';
  script.addEventListener('load', () => { script.dataset.loadState = 'loaded'; }, { once: true });
  script.addEventListener('error', () => { script.dataset.loadState = 'failed'; }, { once: true });
  doc.body.appendChild(script);
  return script;
}
