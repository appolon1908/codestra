import { Link } from "react-router";

const Footer = () => (
  <footer className="orbit-site-footer" data-orbit-component="footer">
    <div className="orbit-footer-inner">
      <div className="orbit-footer-grid">
        <section aria-labelledby="orbit-footer-company">
          <h2 className="orbit-footer-heading" id="orbit-footer-company">
            Codestra
          </h2>
          <p className="orbit-footer-copy">
            Reliable digital products, automation, communications, and business systems.
          </p>
          <a className="orbit-footer-link" href="mailto:support@codestra.co">
            support@codestra.co
          </a>
        </section>

        <nav aria-label="Company">
          <h2 className="orbit-footer-heading">Company</h2>
          <div className="orbit-footer-links">
            <Link className="orbit-footer-link" to="/about">About</Link>
            <Link className="orbit-footer-link" to="/case-studies">Case studies</Link>
            <Link className="orbit-footer-link" to="/contact">Contact</Link>
          </div>
        </nav>

        <nav aria-label="Services">
          <h2 className="orbit-footer-heading">Services</h2>
          <div className="orbit-footer-links">
            <Link className="orbit-footer-link" to="/services">Software</Link>
            <Link className="orbit-footer-link" to="/services">Automation</Link>
            <Link className="orbit-footer-link" to="/services">Communications</Link>
          </div>
        </nav>

        <nav aria-label="Legal">
          <h2 className="orbit-footer-heading">Legal</h2>
          <div className="orbit-footer-links">
            <Link className="orbit-footer-link" to="/privacy">Privacy</Link>
            <Link className="orbit-footer-link" to="/contact/support">Support</Link>
          </div>
        </nav>
      </div>

      <div className="orbit-footer-meta">
        <span>© {new Date().getUTCFullYear()} Codestra.co</span>
        <span>Powered by Codestra.co</span>
      </div>
    </div>
  </footer>
);

export default Footer;
