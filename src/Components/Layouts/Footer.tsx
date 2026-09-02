import { Link } from "react-router";
import { SITE } from "@/config/site";

const year = new Date().getFullYear();

const Footer = () => (
  <footer className="hz-site-footer">
    <div className="hz-container">
      <div className="hz-site-footer__grid">
        <section className="hz-site-footer__intro" aria-labelledby="footer-brand">
          <p className="hz-eyebrow">Codestra product network</p>
          <h2 id="footer-brand" className="hz-site-footer__title">
            One operating standard across every Codestra product.
          </h2>
          <p>
            Software, communications, automation, customer operations and digital products built on a shared,
            accessible experience system.
          </p>
          <div className="hz-domain-list" aria-label="Codestra platform domains">
            <a className="hz-domain-chip" href={SITE.domains.public}>codestra.co</a>
            <a className="hz-domain-chip" href={SITE.domains.identity}>auth.codestra.co</a>
            <a className="hz-domain-chip" href={SITE.domains.api}>api.codestra.co</a>
            <a className="hz-domain-chip" href={SITE.domains.social}>social.codestra.co</a>
          </div>
        </section>

        <nav aria-label="Footer services">
          <h3 className="hz-site-footer__heading">Services</h3>
          <ul className="hz-site-footer__links">
            <li><Link className="hz-site-footer__link" to="/services">Software development</Link></li>
            <li><Link className="hz-site-footer__link" to="/services">AI and automation</Link></li>
            <li><Link className="hz-site-footer__link" to="/services">Product design</Link></li>
            <li><Link className="hz-site-footer__link" to="/contact/sales">Consultation</Link></li>
          </ul>
        </nav>

        <nav aria-label="Codestra products">
          <h3 className="hz-site-footer__heading">Products</h3>
          <ul className="hz-site-footer__links">
            {SITE.productNetwork.map((product) => (
              <li key={product.href}>
                <a className="hz-site-footer__link" href={product.href}>{product.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer company links">
          <h3 className="hz-site-footer__heading">Company</h3>
          <ul className="hz-site-footer__links">
            <li><Link className="hz-site-footer__link" to="/about">About Codestra</Link></li>
            <li><Link className="hz-site-footer__link" to="/case-studies">Case studies</Link></li>
            <li><Link className="hz-site-footer__link" to="/hiring/positions">Careers</Link></li>
            <li><Link className="hz-site-footer__link" to="/contact">Contact</Link></li>
          </ul>
        </nav>
      </div>

      <div className="hz-site-footer__bottom">
        <p>© {year} {SITE.legalName}. All rights reserved.</p>
        <div className="hz-footer-legal">
          <Link className="hz-site-footer__link" to="/privacy">Privacy</Link>
          <a className="hz-site-footer__link" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
