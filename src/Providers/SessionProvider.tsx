import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  const generation = useRef(0);
  const session = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: sessionGet,
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    const expire = () => {
      generation.current += 1;
      void queryClient.cancelQueries({ queryKey: SESSION_QUERY_KEY });
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    };
    window.addEventListener("codestra-auth-expired", expire);
    return () => window.removeEventListener("codestra-auth-expired", expire);
  }, [queryClient]);

  const refreshSession = async () => {
    const currentGeneration = generation.current;
    try {
      const user = await sessionGet();
      if (generation.current !== currentGeneration) return null;
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
      return user;
    } catch {
      if (generation.current === currentGeneration) {
        queryClient.setQueryData(SESSION_QUERY_KEY, null);
      }
      return null;
    }
  };

  const logout = async () => {
    generation.current += 1;
    await queryClient.cancelQueries({ queryKey: SESSION_QUERY_KEY });
    try {
      await logoutPost();
    } finally {
      generation.current += 1;
      await queryClient.cancelQueries({ queryKey: SESSION_QUERY_KEY });
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
