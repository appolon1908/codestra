import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { ensureChatWidget, isPublicChatPath } from '../lib/chatWidget';

/** Third-party scripts cannot be safely unloaded by deleting a script tag.
 * Crossings between public-chat and private routes therefore replace the
 * document, and private children are never rendered in a chat-loaded page.
 */
export default function ChatWidgetBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const enabled = import.meta.env.VITE_CHAT_WIDGET_ENABLED !== 'false';
  const scope = enabled && isPublicChatPath(pathname);
  const [initialScope] = useState(scope);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    if (scope !== initialScope) window.location.replace(window.location.href);
  }, [scope, initialScope]);

  useEffect(() => {
    if (!initialScope) return;
    const script = ensureChatWidget();
    const onError = () => setFailed(true);
    script.addEventListener('error', onError);
    const timer = window.setTimeout(() => {
      if (script.dataset.loadState !== 'loaded') setFailed(true);
    }, 15000);
    return () => {
      window.clearTimeout(timer);
      script.removeEventListener('error', onError);
      // Intentionally preserve the one script through React StrictMode.
    };
  }, [initialScope]);

  if (scope !== initialScope) return null;
  return <>{children}{initialScope && failed && (
    <aside role="status" className="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg border border-neutral-600 bg-neutral-950 p-4 text-sm text-white">
      Chat is temporarily unavailable. <a className="underline" href="mailto:support@codestra.co">Email Codestra support</a>.
    </aside>
  )}</>;
}
