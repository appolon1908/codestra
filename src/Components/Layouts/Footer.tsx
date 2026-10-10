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
  <footer data-corporate-action="button--primary" className="site-footer flex lg:flex-row flex-col lg:gap-14 gap-8 text-sm 2xl: xl: lg: px-8 corporate-color border-t corporate-color lg:py-20 pt-10 pb-10 lg:mt-[10rem] mt-[5rem] justify-between overflow-hidden">
    <div>
      <h2 className="text-base corporate-color font-bold">{t("common:office")}</h2>
      <div className="text-xs">
        <div className="pb-3 pt-3 border-b corporate-color">
          <p className="font-semibold corporate-color">{businessProfile.affiliate.name}</p>
          <p>Dominican Republic office</p>
        </div>
        <div className="pb-3 pt-3 border-b corporate-color">
          <p className="font-semibold corporate-color">{businessProfile.legalOperator.name}</p>
          <p>{formatMainOffice()}</p>
        </div>
        <div className="pb-3 pt-3">
          <a
            className="hover:corporate-color inline-flex min-h-6 items-center"
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
    <div className="flex lg:flex-row flex-col lg:gap-28 gap-8 corporate-color">
      <ul className="space-y-5 text-sm lg:border-none border-t lg:pt-0 pt-5 corporate-color min-w-0">
        <li className="text-base font-bold">{t("common:services")}</li>
        {serviceLinks.map((item) => (
          <li key={item}>
            <LocalizedLink className="hover:corporate-color" to="/services">
              {t(`common:footer.services.${item}`)}
            </LocalizedLink>
          </li>
        ))}
      </ul>
      <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 corporate-color min-w-0">
        <li className="text-base font-bold">{t("common:industries")}</li>
        {industryLinks.map(([item, path]) => (
          <li key={item} className="min-w-0">
            <LocalizedLink className="inline-block max-w-full whitespace-normal break-words hover:corporate-color" to={path === "industries" ? "/industries" : `/industries/${path}`}>
              {t(`common:footer.industries.${item}`)}
            </LocalizedLink>
          </li>
        ))}
      </ul>
      <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 corporate-color">
        <li className="text-base font-bold">{t("common:company")}</li>
        <li>
          <LocalizedLink className="hover:corporate-color" to="/about">
            {t("navigation:about")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:corporate-color" to="/contact">
            {t("navigation:contact")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:corporate-color" to="/case-studies">
            {t("common:footer.ourWork")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:corporate-color" to="/privacy">
            {t("legal:privacy")}
          </LocalizedLink>
        </li>
        <li><LocalizedLink className="hover:corporate-color" to="/cookies">Cookie Policy</LocalizedLink></li>
        <li><LocalizedLink className="hover:corporate-color" to="/cookie-preferences">Cookie Preferences</LocalizedLink></li>
        <li><LocalizedLink className="hover:corporate-color" to="/privacy-choices">Privacy Choices</LocalizedLink></li>
        <li><LocalizedLink className="hover:corporate-color" to="/communications-preferences">Communications Preferences</LocalizedLink></li>
        <li>
          <LocalizedLink className="hover:corporate-color" to="/terms">
            {t("legal:terms")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:corporate-color" to="/security">
            {t("legal:security")}
          </LocalizedLink>
        </li>
        <li><LocalizedLink className="hover:corporate-color" to="/support">Support</LocalizedLink></li>
        <li><LocalizedLink className="hover:corporate-color" to="/accessibility">Accessibility</LocalizedLink></li>
        <li><LocalizedLink className="hover:corporate-color" to="/company-profile">Company profile</LocalizedLink></li>
        <li>
          <LocalizedLink
            className="hover:corporate-color"
            to="/ai-receptionist#integrations"
          >
            {t("navigation:integrations")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:corporate-color" to="/pricing">
            {t("navigation:pricing")}
          </LocalizedLink>
        </li>
        <li>
          <a
            className="hover:corporate-color"
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
        <li className="text-xs corporate-color">
          {t("common:copyright", { year: new Date().getFullYear() })}
        </li>
      </ul>
    </div>
  </footer>
  );
};

export default Footer;
