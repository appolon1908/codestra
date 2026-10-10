import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { logoutPost, sessionGet, type SessionUser } from "@/lib/auth";

const SESSION_QUERY_KEY = ["auth", "session"] as const;

type SessionContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<SessionUser | null>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: sessionGet,
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    const expire = () => queryClient.setQueryData(SESSION_QUERY_KEY, null);
    window.addEventListener("codestra-auth-expired", expire);
    return () => window.removeEventListener("codestra-auth-expired", expire);
  }, [queryClient]);

  const refreshSession = async () => {
    try {
      const user = await sessionGet();
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
      return user;
    } catch {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      return null;
    }
  };

  const logout = async () => {
    try {
      await logoutPost();
    } finally {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        user: session.data ?? null,
        isLoading: session.isLoading,
        isAuthenticated: Boolean(session.data),
        refreshSession,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
};
