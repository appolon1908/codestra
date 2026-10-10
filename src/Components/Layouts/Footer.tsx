import logo from "../../assets/logo.png";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../i18n/LanguageSelector";
import LocalizedLink from "../../i18n/LocalizedLink";
import { businessProfile, formatMainOffice } from "../../config/businessProfile";

const serviceLinks = [
  "softwareDevelopment", "mobileDevelopment", "aiDevelopment", "softwareConsulting", "uiUx", "webDesign", "branding",
];
const industryLinks = [
  ["finance", "financial-services-ai"], ["healthcare", "healthcare-ai"], ["gaming", "gaming-entertainment-ai"], ["realEstate", "real-estate-ai"], ["education", "education-ai"], ["web3", "industries"],
];

const Footer = () => {
  const { t } = useTranslation(["common", "navigation", "legal"]);
  return (
  <footer className="site-footer corporate-footer">
    <LocalizedLink className="button button--primary button--lg" to="/contact/sales">{t("navigation:servicesMenu.consultation")}</LocalizedLink>
    <div>
      <h2 className="text-base corporate-text-ink font-bold">{t("common:office")}</h2>
      <div className="text-xs">
        <div className="pb-3 pt-3 border-b corporate-border-line">
          <p className="font-semibold corporate-text-ink">{businessProfile.affiliate.name}</p>
          <p>Dominican Republic office</p>
        </div>
        <div className="pb-3 pt-3 border-b corporate-border-line">
          <p className="font-semibold corporate-text-ink">{businessProfile.legalOperator.name}</p>
          <p>{formatMainOffice()}</p>
        </div>
        <div className="pb-3 pt-3">
          <a
            className="corporate-hover-text-accent inline-flex min-h-6 items-center"
            href={`mailto:${businessProfile.supportEmail}`}
          >
            {businessProfile.supportEmail}
          </a>
          <LocalizedLink to="/" className="block pt-4" aria-label={t("common:codestraHome")}>
            <img src={logo} alt="Codestra" className="w-24" />
          </LocalizedLink>
          <div className="pt-5">
            <p className="pb-3">{t("common:footer.craftsmanship")}</p>
            <p>{t("common:footer.reliableProducts")}</p>
          </div>
        </div>
      </div>
    </div>
    <div className="flex lg:flex-row flex-col lg:gap-28 gap-8 corporate-text-ink">
      <ul className="space-y-5 text-sm lg:border-none border-t lg:pt-0 pt-5 corporate-border-line min-w-0">
        <li className="text-base font-bold">{t("common:services")}</li>
        {serviceLinks.map((item) => (
          <li key={item}>
            <LocalizedLink className="corporate-hover-text-accent" to="/services">
              {t(`common:footer.services.${item}`)}
            </LocalizedLink>
          </li>
        ))}
      </ul>
      <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 corporate-border-line min-w-0">
        <li className="text-base font-bold">{t("common:industries")}</li>
        {industryLinks.map(([item, path]) => (
          <li key={item} className="min-w-0">
            <LocalizedLink className="inline-block max-w-full whitespace-normal break-words corporate-hover-text-accent" to={path === "industries" ? "/industries" : `/industries/${path}`}>
              {t(`common:footer.industries.${item}`)}
            </LocalizedLink>
          </li>
        ))}
      </ul>
      <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 corporate-border-line">
        <li className="text-base font-bold">{t("common:company")}</li>
        <li>
          <LocalizedLink className="corporate-hover-text-accent" to="/about">
            {t("navigation:about")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="corporate-hover-text-accent" to="/contact">
            {t("navigation:contact")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="corporate-hover-text-accent" to="/case-studies">
            {t("common:footer.ourWork")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="corporate-hover-text-accent" to="/privacy">
            {t("legal:privacy")}
          </LocalizedLink>
        </li>
        <li><LocalizedLink className="corporate-hover-text-accent" to="/cookies">Cookie Policy</LocalizedLink></li>
        <li><LocalizedLink className="corporate-hover-text-accent" to="/cookie-preferences">Cookie Preferences</LocalizedLink></li>
        <li><LocalizedLink className="corporate-hover-text-accent" to="/privacy-choices">Privacy Choices</LocalizedLink></li>
        <li><LocalizedLink className="corporate-hover-text-accent" to="/communications-preferences">Communications Preferences</LocalizedLink></li>
        <li>
          <LocalizedLink className="corporate-hover-text-accent" to="/terms">
            {t("legal:terms")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="corporate-hover-text-accent" to="/security">
            {t("legal:security")}
          </LocalizedLink>
        </li>
        <li><LocalizedLink className="corporate-hover-text-accent" to="/support">Support</LocalizedLink></li>
        <li><LocalizedLink className="corporate-hover-text-accent" to="/accessibility">Accessibility</LocalizedLink></li>
        <li><LocalizedLink className="corporate-hover-text-accent" to="/company-profile">Company profile</LocalizedLink></li>
        <li>
          <LocalizedLink
            className="corporate-hover-text-accent"
            to="/ai-receptionist#integrations"
          >
            {t("navigation:integrations")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="corporate-hover-text-accent" to="/pricing">
            {t("navigation:pricing")}
          </LocalizedLink>
        </li>
        <li>
          <a
            className="corporate-hover-text-accent"
            href="https://www.linkedin.com/company/codestra"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <LanguageSelector id="footer-language" />
          <LocalizedLink to="/sms">SMS Updates</LocalizedLink> · <LocalizedLink to="/sms-terms">SMS Terms</LocalizedLink> · <LocalizedLink to="/contact-information">Business Contact</LocalizedLink>
        </li>
        <li className="text-xs corporate-text-muted">
          {t("common:copyright", { year: new Date().getFullYear() })}
        </li>
      </ul>
    </div>
  </footer>
  );
};

export default Footer;
