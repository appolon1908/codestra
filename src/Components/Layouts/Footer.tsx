import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const Footer = () => <footer className="site-footer">
  <div className="page-wrap footer-grid">
    <div className="footer-brand"><img src={logo} alt="Codestra" /><p>Strategy, software, and automation—designed as one connected operation.</p></div>
    <div><h2>Explore</h2><Link to="/services">Services</Link><Link to="/case-studies">Case studies</Link><Link to="/electronic-billing">Electronic billing</Link><Link to="/insights">Insights</Link></div>
    <div><h2>Connect</h2><Link to="/contact/sales">Talk to sales</Link><Link to="/contact/support">Get support</Link><Link to="/hiring/positions">Careers</Link><a href="mailto:support@codestra.com">Email us</a></div>
    <div><h2>Offices</h2><p>Santo Domingo, Dominican Republic</p><p>Cypress, Texas, USA</p><a href="tel:+18097347580">+1 809 734 7580</a></div>
  </div>
  <div className="page-wrap footer-bottom"><span>© {new Date().getFullYear()} Codestra SRL</span><Link to="/privacy">Privacy</Link><span>Built with care in every line of code.</span></div>
</footer>

export default Footer
