import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer__cta shell">
      <div>
        <p className="eyebrow">Built for real operations</p>
        <h2>Build the intelligent system your business has been missing.</h2>
      </div>
      <Link className="button button--primary button--lg" to="/contact/sales">
        Start a project <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </div>

    <div className="site-footer__grid shell">
      <div className="site-footer__brand">
        <Link className="brand brand--footer" to="/" aria-label="Codestra home">
          <span className="brand__mark" aria-hidden="true">C</span>
          <span className="brand__copy">
            <strong>Codestra</strong>
            <small>AI · Automation · Software</small>
          </span>
        </Link>
        <p>
          Codestra designs and engineers AI systems, automation, custom software and secure integrations for organizations modernizing how work gets done.
        </p>
        <a href="mailto:sales@codestra.co">sales@codestra.co</a>
        <a href="mailto:support@codestra.co">support@codestra.co</a>
      </div>

      <div>
        <h3>Solutions</h3>
        <Link to="/services">AI development</Link>
        <Link to="/services">Business automation</Link>
        <Link to="/services">Custom software</Link>
        <Link to="/services">API integrations</Link>
        <Link to="/electronic-billing">Electronic billing</Link>
      </div>

      <div>
        <h3>Company</h3>
        <Link to="/about">About</Link>
        <Link to="/industries">Industries</Link>
        <Link to="/case-studies">Case studies</Link>
        <Link to="/hiring/positions">Careers</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/privacy">Privacy</Link>
      </div>

      <div className="site-footer__offices">
        <h3>Offices</h3>
        <address>
          <strong>Santo Domingo</strong>
          Condominio Progreso Business Center<br />
          Av. Lope de Vega 13, Santo Domingo 10130<br />
          <a href="tel:+18097347580">+1 809-734-7580</a>
        </address>
        <address>
          <strong>Texas</strong>
          20634 Longenbaugh Rd<br />
          Cypress, TX 77433<br />
          <a href="tel:+13465446979">+1 346-544-6979</a>
        </address>
      </div>
    </div>

    <div className="site-footer__bottom shell">
      <p>© {new Date().getFullYear()} Codestra SRL. All rights reserved.</p>
      <p>Dominican Republic · United States · Remote delivery</p>
    </div>
  </footer>
)

export default Footer
