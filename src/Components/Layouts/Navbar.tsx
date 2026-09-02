import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { clearAccessToken, hasUsableAccessToken } from "@/lib/auth";
import { SITE } from "@/config/site";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = hasUsableAccessToken();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAccessToken();
    navigate("/", { replace: true });
  };

  return (
    <>
      <a className="hz-skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="hz-site-header">
        <div className="hz-container hz-site-header__inner">
          <Link className="hz-brand" to="/" aria-label={`${SITE.brand} home`}>
            <span className="hz-brand__mark" aria-hidden="true">C</span>
            <span>{SITE.brand}</span>
            <span className="hz-brand__domain">{SITE.domainLabel}</span>
          </Link>

          <nav className="hz-site-nav hz-site-nav--desktop" aria-label="Primary navigation">
            {SITE.primaryNavigation.map((item) => (
              <NavLink
                key={item.to}
                className="hz-site-nav__link"
                to={item.to}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hz-header-actions">
            {isAuthenticated ? (
              <>
                <Link className="hz-button hz-button--secondary hz-button--small" to="/auth/dashboard">
                  Dashboard
                </Link>
                <button className="hz-button hz-button--primary hz-button--small" type="button" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link className="hz-button hz-button--secondary hz-button--small" to="/login">
                  Log in
                </Link>
                <Link className="hz-button hz-button--primary hz-button--small" to="/signup">
                  Create account
                </Link>
              </>
            )}

            <button
              className="hz-button hz-button--secondary hz-menu-button"
              type="button"
              aria-expanded={isOpen}
              aria-controls="codestra-mobile-navigation"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsOpen((current) => !current)}
            >
              {isOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        <div id="codestra-mobile-navigation" className="hz-mobile-panel" data-open={isOpen}>
          <nav className="hz-container hz-mobile-panel__inner" aria-label="Mobile navigation">
            {SITE.primaryNavigation.map((item) => (
              <NavLink
                key={item.to}
                className="hz-site-nav__link"
                to={item.to}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
            <a className="hz-site-nav__link" href={SITE.domains.social}>
              Social platform
            </a>
            <a className="hz-site-nav__link" href={SITE.domains.identity}>
              Identity
            </a>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navbar;
