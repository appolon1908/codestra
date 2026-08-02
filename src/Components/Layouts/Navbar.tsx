import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { ArrowRight, Menu, X } from 'lucide-react'
import logo from '../../assets/logo.png'
import { clearAccessToken, hasUsableAccessToken } from '../../lib/auth'

const links = [
  ['Services', '/services'], ['Approach', '/about'], ['Work', '/case-studies'], ['Billing', '/electronic-billing'], ['Insights', '/insights'],
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const authenticated = hasUsableAccessToken()
  const close = () => setOpen(false)
  const logout = () => { clearAccessToken(); close(); navigate('/') }

  return <header className="site-header">
    <nav className="page-wrap nav-inner" aria-label="Main navigation">
      <Link to="/" onClick={close} className="brand"><img src={logo} alt="Codestra home" /></Link>
      <div className={`nav-links ${open ? 'is-open' : ''}`}>
        {links.map(([label, href]) => <NavLink key={href + label} to={href} onClick={close}>{label}</NavLink>)}
        <NavLink to="/hiring/positions" onClick={close}>Careers</NavLink>
        <div className="mobile-account-links">
          {authenticated ? <><Link to="/auth/dashboard" onClick={close}>Dashboard</Link><button onClick={logout}>Log out</button></> : <><Link to="/login" onClick={close}>Log in</Link><Link to="/signup" onClick={close}>Create account</Link></>}
        </div>
      </div>
      <div className="nav-actions">
        {authenticated ? <><Link className="text-link" to="/auth/dashboard">Dashboard</Link><button className="button button-secondary compact" onClick={logout}>Log out</button></> : <Link className="text-link" to="/login">Log in</Link>}
        <Link className="button button-primary compact" to="/contact/sales">Talk to our team <ArrowRight size={16} /></Link>
      </div>
      <button className="menu-button" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </nav>
  </header>
}

export default Navbar
