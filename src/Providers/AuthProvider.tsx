import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router";
import { useSession } from "./SessionProvider";

type AuthProviderProps = {
  element: ReactNode;
};

const AuthProvider = ({ element }: AuthProviderProps) => {
  const location = useLocation();
  const { status, error, beginLogin, refreshSession } = useSession();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (status === "anonymous") {
      beginLogin(returnTo);
    }
  }, [beginLogin, returnTo, status]);

  if (status === "authenticated") {
    return element;
  }

  if (status === "error") {
    return (
      <main className="orbit-state-page" id="main-content">
        <section className="orbit-status-panel" aria-labelledby="account-unavailable-title">
          <p className="orbit-eyebrow">Account</p>
          <h1 id="account-unavailable-title">Account service unavailable</h1>
          <p>{error}</p>
          <div className="orbit-action-row">
            <button className="orbit-button orbit-button--primary" onClick={() => void refreshSession()} type="button">
              Try again
            </button>
            <button className="orbit-button orbit-button--secondary" onClick={() => beginLogin(returnTo)} type="button">
              Restart login
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="orbit-state-page" id="main-content" aria-live="polite">
      <div className="orbit-loading-indicator" aria-hidden="true" />
      <p>Checking your secure session.</p>
    </main>
  );
};

export default AuthProvider;
