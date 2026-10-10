import Footer from "@/Components/Layouts/Footer";
import Navbar from "@/Components/Layouts/Navbar";
import { useSession } from "@/Providers/SessionProvider";
import { useState } from "react";

const HomeDash = () => {
  const { user, logout } = useSession();
  const [pendingAction, setPendingAction] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const revoke = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    setActionError(null);
    try {
      await logout();
    } catch {
      setActionError("The session could not be revoked. Try again.");
    } finally {
      setPendingAction(false);
    }
  };

  return (
    <div className="orbit-page">
      <Navbar />
      <main className="orbit-dashboard" id="main-content">
        <section className="orbit-dashboard-hero" aria-labelledby="dashboard-title">
          <p className="orbit-eyebrow">Account</p>
          <h1 id="dashboard-title">
            Welcome{user?.first_name ? `, ${user.first_name}` : ""}
          </h1>
          <p>
            Your account is protected by a same-origin server session. Browser JavaScript does not hold an access or refresh token.
          </p>
        </section>

        <section className="orbit-account-card" aria-labelledby="session-title">
          <div>
            <p className="orbit-eyebrow">Security</p>
            <h2 id="session-title">Session controls</h2>
            <p>End the active session in this browser.</p>
          </div>
          {actionError ? <p className="orbit-action-error" role="alert">{actionError}</p> : null}
          <div className="orbit-action-row">
            <button
              className="orbit-button orbit-button--secondary"
              disabled={pendingAction}
              onClick={() => void revoke()}
              type="button"
            >
              {pendingAction ? "Signing out" : "Log out"}
            </button>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomeDash;
