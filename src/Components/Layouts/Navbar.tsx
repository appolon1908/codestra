import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { clearAccessToken, hasUsableAccessToken } from '@/lib/auth'

const primaryLinks = [
  { label: 'Services', to: '/services' },
  { label: 'Case studies', to: '/case-studies' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = hasUsableAccessToken()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    clearAccessToken()
    navigate('/', { replace: true })
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/" aria-label="Codestra home">
            <span className="brand__mark" aria-hidden="true">C</span>
            <span className="brand__copy">
              <strong>Codestra</strong>
              <small>AI · Automation · Software</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            {isAuthenticated ? (
              <>
                <Link className="header-text-link" to="/auth/dashboard">Dashboard</Link>
                <button className="header-text-link" type="button" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <Link className="header-text-link desktop-only" to="/login">Client login</Link>
            )}
            <Link className="button button--gold button--compact desktop-only" to="/contact/sales">
              Talk to an expert <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <button
              className="menu-toggle"
              type="button"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsOpen((value) => !value)}
            >
              {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div id="mobile-navigation" className={`mobile-nav${isOpen ? ' mobile-nav--open' : ''}`}>
          <nav aria-label="Mobile navigation">
            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }: { isActive: boolean }) => `mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            {!isAuthenticated && <Link className="mobile-nav__link" to="/login">Client login</Link>}
            <Link className="button button--gold mobile-nav__cta" to="/contact/sales">
              Talk to an expert <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}

export default Navbar
