import { useEffect, useState } from 'react'
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { clearAccessToken, hasUsableAccessToken } from '@/lib/auth'

const featuredServices = [
  { label: 'AI agent development', to: '/ai-services/ai-agent-development' },
  { label: 'AI workflow automation', to: '/ai-services/ai-workflow-automation' },
  { label: 'Odoo AI integration', to: '/ai-services/odoo-ai-integration' },
  { label: 'Custom software', to: '/ai-services/custom-software-development' },
]

const featuredIndustries = [
  { label: 'Healthcare', to: '/industries/healthcare' },
  { label: 'Financial services', to: '/industries/financial-services' },
  { label: 'Logistics', to: '/industries/logistics-transportation' },
  { label: 'Call centers & BPO', to: '/industries/call-centers-bpo' },
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
            <span className="brand__copy"><strong>Codestra</strong><small>AI · Automation · Software</small></span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <details className="nav-menu">
              <summary>Services <ChevronDown size={14} aria-hidden="true" /></summary>
              <div className="nav-menu__panel">
                <div><span>Build the intelligence layer</span><strong>AI and software connected to the operating workflow.</strong><Link to="/ai-services">View all 30 services <ArrowUpRight size={15} /></Link></div>
                <nav aria-label="Featured services">{featuredServices.map((item) => <Link key={item.to} to={item.to}>{item.label}<ArrowUpRight size={14} /></Link>)}</nav>
              </div>
            </details>
            <details className="nav-menu">
              <summary>Industries <ChevronDown size={14} aria-hidden="true" /></summary>
              <div className="nav-menu__panel">
                <div><span>Adapt the workflow</span><strong>Industry-specific context, integrations and controls.</strong><Link to="/industries">View all 25 industries <ArrowUpRight size={15} /></Link></div>
                <nav aria-label="Featured industries">{featuredIndustries.map((item) => <Link key={item.to} to={item.to}>{item.label}<ArrowUpRight size={14} /></Link>)}</nav>
              </div>
            </details>
            <NavLink to="/case-studies" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>Case studies</NavLink>
            <NavLink to="/about" className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>About</NavLink>
          </nav>

          <div className="site-header__actions">
            {isAuthenticated ? (
              <><Link className="header-text-link" to="/auth/dashboard">Dashboard</Link><button className="header-text-link" type="button" onClick={handleLogout}>Log out</button></>
            ) : <Link className="header-text-link desktop-only" to="/login">Client login</Link>}
            <Link className="button button--gold button--compact desktop-only" to="/contact/sales">Talk to an expert <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <button className="menu-toggle" type="button" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen((value) => !value)}>
              {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div id="mobile-navigation" className={`mobile-nav${isOpen ? ' mobile-nav--open' : ''}`}>
          <nav aria-label="Mobile navigation">
            <Link className="mobile-nav__link" to="/ai-services">AI & software services</Link>
            <Link className="mobile-nav__link" to="/industries">Industries</Link>
            <Link className="mobile-nav__link" to="/case-studies">Case studies</Link>
            <Link className="mobile-nav__link" to="/about">About</Link>
            <Link className="mobile-nav__link" to="/contact">Contact</Link>
            {!isAuthenticated && <Link className="mobile-nav__link" to="/login">Client login</Link>}
            <Link className="button button--gold mobile-nav__cta" to="/contact/sales">Talk to an expert <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </nav>
        </div>
      </header>
    </>
  )
}

export default Navbar
