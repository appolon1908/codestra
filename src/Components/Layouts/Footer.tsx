import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  fetchOrbitFooter,
  type OrbitFooterResource,
  type OrbitFooterVariant,
  type OrbitSocialNetwork,
} from "../../lib/orbitFooter";

const socialGlyph: Record<OrbitSocialNetwork, string> = {
  linkedin: "in",
  facebook: "f",
  instagram: "ig",
  x: "x",
  youtube: "yt",
  github: "gh",
  tiktok: "tt",
  threads: "@",
};

const socialLabel: Record<OrbitSocialNetwork, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  youtube: "YouTube",
  github: "GitHub",
  tiktok: "TikTok",
  threads: "Threads",
};

interface FooterProps {
  variant?: OrbitFooterVariant;
}

const Footer = ({ variant = "full" }: FooterProps) => {
  const [resource, setResource] = useState<OrbitFooterResource | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchOrbitFooter("codestra", controller.signal)
      .then(setResource)
      .catch(() => setResource(null));
    return () => controller.abort();
  }, []);

  const publishedLinks = resource?.published ? resource.links : [];
  const publishedSocial =
    resource?.published && variant !== "legal-only" ? resource.social : [];

  return (
    <footer
      className="orbit-site-footer"
      data-orbit-component="footer"
      data-footer-resource="footer_codestra_global"
      data-social-links-from-api="true"
      data-variant={variant}
    >
      <div className="orbit-footer-inner">
        {variant !== "legal-only" && (
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
                {publishedLinks.map((item) => {
                  const label = item.label ?? item.resolvedLabel ?? item.labelKey;
                  return (
                    <a className="orbit-footer-link" href={item.href} key={`${item.href}:${label}`}>
                      {label}
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>
        )}

        {publishedSocial.length > 0 && (
          <nav className="orbit-social-links" aria-label="Social media">
            {publishedSocial.map((item) => (
              <a
                aria-label={item.label ?? socialLabel[item.network]}
                className="orbit-social-link"
                data-network={item.network}
                href={item.url}
                key={item.network}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span aria-hidden="true" className="orbit-social-icon">
                  {socialGlyph[item.network]}
                </span>
              </a>
            ))}
          </nav>
        )}

        <div className="orbit-footer-meta">
          <span>© {new Date().getUTCFullYear()} Codestra.co</span>
          <span>{resource?.attribution ?? "Powered by Codestra.co"}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
