import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer__cta shell">
      <div><p className="eyebrow">Build what comes next</p><h2>Turn one high-value workflow into a working AI system.</h2></div>
      <Link className="button button--gold" to="/contact/sales">Start a conversation <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>

    <div className="site-footer__grid shell">
      <div className="site-footer__brand">
        <Link className="brand brand--footer" to="/" aria-label="Codestra home"><span className="brand__mark" aria-hidden="true">C</span><span className="brand__copy"><strong>Codestra</strong><small>Craftsmanship in every line of code.</small></span></Link>
        <p>AI development, business automation and reliable software engineering for companies ready to modernize how work gets done.</p>
        <a href="mailto:sales@codestra.co">sales@codestra.co</a>
        <a href="mailto:support@codestra.co">support@codestra.co</a>
      </div>

      <div>
        <h3>Services</h3>
        <Link to="/ai-services/ai-agent-development">AI agents</Link>
        <Link to="/ai-services/ai-workflow-automation">AI automation</Link>
        <Link to="/ai-services/custom-software-development">Custom software</Link>
        <Link to="/ai-services/api-development-integration">API integration</Link>
        <Link to="/ai-services/odoo-ai-integration">Odoo AI</Link>
        <Link to="/ai-services">All services</Link>
      </div>

      <div>
        <h3>Industries</h3>
        <Link to="/industries/healthcare">Healthcare</Link>
        <Link to="/industries/financial-services">Financial services</Link>
        <Link to="/industries/logistics-transportation">Logistics</Link>
        <Link to="/industries/call-centers-bpo">Call centers</Link>
        <Link to="/industries/retail-ecommerce">Retail</Link>
        <Link to="/industries">All industries</Link>
      </div>

      <div className="site-footer__offices">
        <h3>Company & offices</h3>
        <Link to="/about">About</Link><Link to="/case-studies">Case studies</Link><Link to="/hiring/positions">Careers</Link><Link to="/privacy">Privacy</Link>
        <address><strong>Santo Domingo</strong>Condominio Progreso Business Center<br />Av. Lope de Vega 13, Santo Domingo 10130<br /><a href="tel:+18097347580">+1 809-734-7580</a></address>
        <address><strong>Texas</strong>20634 Longenbaugh Rd<br />Cypress, TX 77433<br /><a href="tel:+13465446979">+1 346-544-6979</a></address>
      </div>
    </div>

    <div className="site-footer__bottom shell"><p>© {new Date().getFullYear()} Codestra SRL. All rights reserved.</p><p>Dominican Republic · United States · Remote delivery</p></div>
  </footer>
)

export default Footer
