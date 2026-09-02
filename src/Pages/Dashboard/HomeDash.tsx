import Footer from "@/Components/Layouts/Footer";
import Navbar from "@/Components/Layouts/Navbar";
import { useSession } from "@/Providers/SessionProvider";
import { useState } from "react";

const HomeDash = () => {
  const { session, logout, logoutAll } = useSession();
  const [pendingAction, setPendingAction] = useState<"current" | "all" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const revoke = async (scope: "current" | "all") => {
    if (pendingAction) return;
    setPendingAction(scope);
    setActionError(null);
    try {
      if (scope === "all") {
        await logoutAll();
      } else {
        await logout();
      }
    } catch {
      setActionError("The session could not be revoked. Try again.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="orbit-page">
      <Navbar />
      <main className="orbit-dashboard" id="main-content">
        <section className="orbit-dashboard-hero" aria-labelledby="dashboard-title">
          <p className="orbit-eyebrow">Account</p>
          <h1 id="dashboard-title">
            Welcome{session?.user?.displayName ? `, ${session.user.displayName}` : ""}
          </h1>
          <p>
            Your account is protected by a same-origin server session. Browser JavaScript does not hold an access or refresh token.
          </p>
        </section>

        <section className="orbit-account-card" aria-labelledby="session-title">
          <div>
            <p className="orbit-eyebrow">Security</p>
            <h2 id="session-title">Session controls</h2>
            <p>Revoke this browser session or every active session connected to your account.</p>
          </div>
          {actionError ? <p className="orbit-action-error" role="alert">{actionError}</p> : null}
          <div className="orbit-action-row">
            <button
              className="orbit-button orbit-button--secondary"
              disabled={pendingAction !== null}
              onClick={() => void revoke("current")}
              type="button"
            >
              {pendingAction === "current" ? "Signing out" : "Log out"}
            </button>
            <button
              className="orbit-button orbit-button--primary"
              disabled={pendingAction !== null}
              onClick={() => void revoke("all")}
              type="button"
            >
              {pendingAction === "all" ? "Revoking sessions" : "Log out everywhere"}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomeDash;
