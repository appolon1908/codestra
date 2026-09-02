import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  beginLogin,
  beginSignup,
  getBrowserSession,
  logout,
  logoutAll,
  subscribeToAuthEvents,
  type BrowserSession,
} from "@/lib/browserSession";

type SessionStatus = "loading" | "authenticated" | "anonymous" | "error";

type SessionContextValue = {
  session: BrowserSession | null;
  status: SessionStatus;
  error: string | null;
  refreshSession: () => Promise<void>;
  beginLogin: (returnTo?: string | null) => string;
  beginSignup: (returnTo?: string | null) => string;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<BrowserSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setError(null);
    try {
      const next = await getBrowserSession();
      setSession(next);
      setStatus(next.authenticated ? "authenticated" : "anonymous");
    } catch {
      setSession(null);
      setStatus("error");
      setError("The account service is temporarily unavailable.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getBrowserSession({ signal: controller.signal })
      .then((next) => {
        if (!active) return;
        setSession(next);
        setStatus(next.authenticated ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (!active || controller.signal.aborted) return;
        setStatus("error");
        setError("The account service is temporarily unavailable.");
      });

    const unsubscribe = subscribeToAuthEvents((event) => {
      if (event.type === "signed-out" || event.type === "signed-out-all") {
        setSession({ authenticated: false, roles: [], capabilities: [] });
        setStatus("anonymous");
        setError(null);
      }
      if (event.type === "session-refreshed") {
        void refreshSession();
      }
    });

    return () => {
      active = false;
      controller.abort();
      unsubscribe();
    };
  }, [refreshSession]);

  const context = useMemo<SessionContextValue>(
    () => ({
      session,
      status,
      error,
      refreshSession,
      beginLogin,
      beginSignup,
      logout: async () => {
        await logout();
      },
      logoutAll: async () => {
        await logoutAll();
      },
    }),
    [error, refreshSession, session, status],
  );

  return <SessionContext.Provider value={context}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};
