import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSession } from "@/Providers/SessionProvider";

const navigation = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Case studies", to: "/case-studies" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mutationPending, setMutationPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  const handleLogout = async () => {
    if (mutationPending) return;
    setMutationPending(true);
    setActionError(null);
    try {
      await logout();
    } catch {
      setActionError("Sign-out could not be completed.");
    } finally {
      setMutationPending(false);
    }
  };

  return (
    <header className="orbit-site-header" data-orbit-component="header">
      <a className="orbit-skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="orbit-header-inner">
        <Link className="orbit-brand" to="/" aria-label="Codestra home">
          Codestra
        </Link>

        <button
          className="orbit-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="orbit-primary-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <nav
          id="orbit-primary-navigation"
          className="orbit-primary-navigation"
          aria-label="Primary navigation"
          data-open={menuOpen ? "true" : "false"}
        >
          {navigation.map((item) => (
            <Link
              className="orbit-navigation-link"
              key={item.to}
              to={item.to}
              aria-current={location.pathname === item.to ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="orbit-account-actions">
          {actionError ? <span className="orbit-action-error" role="alert">{actionError}</span> : null}
          {isAuthenticated ? (
            <>
              <Link className="orbit-text-action" to="/auth/dashboard">
                {user?.first_name || user?.email || "Account"}
              </Link>
              <button
                className="orbit-button orbit-button--primary orbit-button--header"
                disabled={mutationPending}
                onClick={() => void handleLogout()}
                type="button"
              >
                {mutationPending ? "Signing out" : "Log out"}
              </button>
            </>
          ) : isLoading ? (
            <span className="orbit-session-status">Checking session</span>
          ) : (
            <Link
              className="orbit-button orbit-button--primary orbit-button--header"
              to={`/login?return_to=${encodeURIComponent(returnTo)}`}
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
