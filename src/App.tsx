import { featureRoutes } from "./features/FeatureRoutes";
import AuthProvider from "./Providers/AuthProvider";
import { SessionProvider } from "./Providers/SessionProvider";
import ChatWidgetBoundary from "./Components/ChatWidgetBoundary";
import { lazy, Suspense, useEffect, type PropsWithChildren } from "react";
import QueryProvider from "./Providers/QueryProvider";
import { BrowserRouter, Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";

import AOS from "aos";
import "aos/dist/aos.css";
import { LocaleBoundary, LocalizedRedirect } from "./i18n/LocaleBoundary";

const ConnectedHome = lazy(() => import("./Pages/Home/ConnectedHome"));
const ModernHome = lazy(() => import("./Pages/Home/ModernHome"));
const LandingPage = lazy(() => import("./Pages/Landing/LandingPage"));
const LandingIndex = lazy(() => import("./Pages/Landing/LandingIndex"));
const AboutUs = lazy(() => import("./Pages/About/AboutUs"));
const ContactSales = lazy(() => import("./Pages/Contact/ContactSales"));
const ContactSupport = lazy(() => import("./Pages/Contact/ContactSupport"));
const ContactUs = lazy(() => import("./Pages/Contact/ContactUs"));
const Home = lazy(() => import("./Pages/Home/Home"));
const Login = lazy(() => import("./Pages/Login/Login"));
const Signup = lazy(() => import("./Pages/Signup/Signup"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const ElectronicBilling = lazy(
  () => import("./Pages/ElectronicBilling/ElectronicBilling"),
);
const ElectronicBillingForm = lazy(
  () => import("./Pages/BillingForm/ElectronicBillingForm"),
);
const HiringPosition = lazy(() => import("./Pages/Hiring/HiringPosition"));
const CaseStudies = lazy(() => import("./Pages/CaseStudies/CaseStudies"));
const Services = lazy(() => import("./Pages/Services/Services"));
const Privacy = lazy(() => import("./Pages/Privacy/Privacy"));
const AIReceptionist = lazy(
  () => import("./Pages/AIReceptionist/AIReceptionist"),
);
const BookDemoPage = lazy(() =>
  import("./Pages/AIReceptionist/ConversionPages").then((module) => ({
    default: module.BookDemoPage,
  })),
);
const SecurityPage = lazy(() =>
  import("./Pages/AIReceptionist/ConversionPages").then((module) => ({
    default: module.SecurityPage,
  })),
);
const ThankYouPage = lazy(() =>
  import("./Pages/AIReceptionist/ConversionPages").then((module) => ({
    default: module.ThankYouPage,
  })),
);
const RequestPricingPage = lazy(() =>
  import("./Pages/AIReceptionist/ConversionPages").then((module) => ({ default: module.RequestPricingPage })),
);
const IndustriesDirectory = lazy(() =>
  import("./Pages/Industries/IndustryPlatform").then((module) => ({ default: module.IndustriesDirectory })),
);
const IndustryPage = lazy(() =>
  import("./Pages/Industries/IndustryPlatform").then((module) => ({ default: module.IndustryPage })),
);
const ServiceDetailPage = lazy(() => import("./Pages/Corporate/CorporatePages").then((module) => ({ default: module.ServiceDetailPage })));
const HowItWorksPage = lazy(() => import("./Pages/Corporate/CorporatePages").then((module) => ({ default: module.HowItWorksPage })));
const SupportPage = lazy(() => import("./Pages/Corporate/CorporatePages").then((module) => ({ default: module.SupportPage })));
const AccessibilityPage = lazy(() => import("./Pages/Corporate/CorporatePages").then((module) => ({ default: module.AccessibilityPage })));
const CorporateProfilePage = lazy(() => import("./Pages/Corporate/CorporatePages").then((module) => ({ default: module.CorporateProfilePage })));
const CookiePolicyPage = lazy(() => import("./Pages/Privacy/PrivacyControls").then((module) => ({ default: module.CookiePolicyPage })));
const CookiePreferencesPage = lazy(() => import("./Pages/Privacy/PrivacyControls").then((module) => ({ default: module.CookiePreferencesPage })));
const PrivacyChoicesPage = lazy(() => import("./Pages/Privacy/PrivacyControls").then((module) => ({ default: module.PrivacyChoicesPage })));
const CommunicationsPreferencesPage = lazy(() => import("./Pages/Privacy/PrivacyControls").then((module) => ({ default: module.CommunicationsPreferencesPage })));
const PlatformHub = lazy(() => import("./Pages/Platform/PlatformHub"));

const AllRoutes = lazy(() => import("./Routes/AllRoutes"));
const LegalPage = lazy(() => import("./Pages/Legal/LegalPage"));
const Terms = lazy(() => import("./Pages/Terms/Terms"));
const MarketingRoute = ({ children }: PropsWithChildren) => (
  <div className="marketing-route">{children}</div>
);

function App() {
  const { t } = useTranslation("common");
  useEffect(() => { AOS.init(); }, []);
  return (
    <>
      <QueryProvider>
        <BrowserRouter>
          <ChatWidgetBoundary><SessionProvider><Suspense
            fallback={
              <div className="route-loader route-loader--corporate" aria-label={t("loading")} />
            }
          >
            <Routes>
              {featureRoutes.map(({path, element}) => <Route key={path} path={path} element={<MarketingRoute>{element}</MarketingRoute>} />)}
              <Route path="/services/:slug" element={<MarketingRoute><LandingPage kind="service" /></MarketingRoute>} />
              <Route path="/industries/:slug" element={<MarketingRoute><LandingPage kind="industry" /></MarketingRoute>} />
              <Route path="/solutions" element={<MarketingRoute><LandingIndex kind="service" /></MarketingRoute>} />
              <Route path="/auth/*" element={<AuthProvider element={<AllRoutes />} />} />
              <Route path="/privacy" element={<MarketingRoute><Privacy /></MarketingRoute>} />
              <Route path="/terms" element={<MarketingRoute><Terms /></MarketingRoute>} />
              <Route path="/sms" element={<MarketingRoute><LegalPage kind="sms" /></MarketingRoute>} />
              <Route path="/sms-terms" element={<MarketingRoute><LegalPage kind="smsTerms" /></MarketingRoute>} />
              <Route path="/contact-information" element={<MarketingRoute><LegalPage kind="contactInformation" /></MarketingRoute>} />
              <Route path="/:locale" element={<MarketingRoute><LocaleBoundary /></MarketingRoute>}>
                {featureRoutes.map(({path, element}) => <Route key={path} path={path.replace(/^\//, "")} element={<MarketingRoute>{element}</MarketingRoute>} />)}
                <Route index element={<MarketingRoute><Home /></MarketingRoute>} />
                <Route path="connected-systems" element={<MarketingRoute><ConnectedHome /></MarketingRoute>} />
                <Route path="systems" element={<MarketingRoute><ModernHome /></MarketingRoute>} />
                <Route path="solutions" element={<MarketingRoute><LandingIndex kind="service" /></MarketingRoute>} />
                <Route path="login" element={<MarketingRoute><Login /></MarketingRoute>} />
                <Route path="signup" element={<MarketingRoute><Signup /></MarketingRoute>} />
                <Route path="about" element={<MarketingRoute><AboutUs /></MarketingRoute>} />
                <Route path="case-studies" element={<MarketingRoute><CaseStudies /></MarketingRoute>} />
                <Route path="contact" element={<MarketingRoute><ContactUs /></MarketingRoute>} />
                <Route path="contact/sales" element={<MarketingRoute><ContactSales /></MarketingRoute>} />
                <Route path="contact/support" element={<MarketingRoute><ContactSupport /></MarketingRoute>} />
                <Route path="electronic-billing" element={<MarketingRoute><ElectronicBilling /></MarketingRoute>} />
                <Route path="electronic-billing/form" element={<MarketingRoute><ElectronicBillingForm /></MarketingRoute>} />
                <Route path="hiring/positions" element={<MarketingRoute><HiringPosition /></MarketingRoute>} />
                <Route path="services" element={<MarketingRoute><Services /></MarketingRoute>} />
                <Route path="services/software-development" element={<MarketingRoute><ServiceDetailPage kind="software-development" /></MarketingRoute>} />
                <Route path="services/ai-automation" element={<MarketingRoute><ServiceDetailPage kind="ai-automation" /></MarketingRoute>} />
                <Route path="services/odoo-crm" element={<MarketingRoute><ServiceDetailPage kind="odoo-crm" /></MarketingRoute>} />
                <Route path="services/contact-center" element={<MarketingRoute><ServiceDetailPage kind="contact-center" /></MarketingRoute>} />
                <Route path="how-it-works" element={<MarketingRoute><HowItWorksPage /></MarketingRoute>} />
                <Route path="support" element={<MarketingRoute><SupportPage /></MarketingRoute>} />
                <Route path="accessibility" element={<MarketingRoute><AccessibilityPage /></MarketingRoute>} />
                <Route path="company-profile" element={<MarketingRoute><CorporateProfilePage /></MarketingRoute>} />
                <Route path="privacy" element={<MarketingRoute><Privacy /></MarketingRoute>} />
                <Route path="cookies" element={<MarketingRoute><CookiePolicyPage /></MarketingRoute>} />
                <Route path="cookie-preferences" element={<MarketingRoute><CookiePreferencesPage /></MarketingRoute>} />
                <Route path="privacy-choices" element={<MarketingRoute><PrivacyChoicesPage /></MarketingRoute>} />
                <Route path="communications-preferences" element={<MarketingRoute><CommunicationsPreferencesPage /></MarketingRoute>} />
                <Route path="ai-receptionist" element={<MarketingRoute><AIReceptionist /></MarketingRoute>} />
                <Route path="pricing" element={<MarketingRoute><AIReceptionist /></MarketingRoute>} />
                <Route path="book-demo" element={<MarketingRoute><BookDemoPage /></MarketingRoute>} />
                <Route path="request-pricing" element={<MarketingRoute><RequestPricingPage /></MarketingRoute>} />
                <Route path="industries" element={<MarketingRoute><IndustriesDirectory /></MarketingRoute>} />
                <Route path="industries/:industrySlug" element={<MarketingRoute><IndustryPage /></MarketingRoute>} />
                <Route path="security" element={<MarketingRoute><SecurityPage /></MarketingRoute>} />
                <Route path="terms" element={<MarketingRoute><Terms /></MarketingRoute>} />
                <Route path="sms" element={<MarketingRoute><LegalPage kind="sms" /></MarketingRoute>} />
                <Route path="sms-terms" element={<MarketingRoute><LegalPage kind="smsTerms" /></MarketingRoute>} />
                <Route path="contact-information" element={<MarketingRoute><LegalPage kind="contactInformation" /></MarketingRoute>} />
                <Route path="auth/*" element={<AuthProvider element={<AllRoutes />} />} />
                <Route path="thank-you" element={<MarketingRoute><ThankYouPage /></MarketingRoute>} />
                <Route path="marketplace/*" element={<MarketingRoute><PlatformHub area="marketplace" /></MarketingRoute>} />
                <Route path="sales/*" element={<AuthProvider element={<PlatformHub area="sales" />} />} />
                <Route path="portal/*" element={<AuthProvider element={<PlatformHub area="customer" />} />} />
                <Route path="partners/*" element={<MarketingRoute><PlatformHub area="partner" /></MarketingRoute>} />
                <Route path="developers/*" element={<MarketingRoute><PlatformHub area="developer" /></MarketingRoute>} />
                <Route path="documentation/*" element={<MarketingRoute><PlatformHub area="documentation" /></MarketingRoute>} />
                <Route path="academy/*" element={<MarketingRoute><PlatformHub area="academy" /></MarketingRoute>} />
                <Route path="support/*" element={<MarketingRoute><PlatformHub area="support" /></MarketingRoute>} />
                <Route path="status" element={<MarketingRoute><PlatformHub area="status" /></MarketingRoute>} />
                <Route path="*" element={<MarketingRoute><NotFound /></MarketingRoute>} />
              </Route>
              <Route path="*" element={<MarketingRoute><LocalizedRedirect /></MarketingRoute>} />
            </Routes>
          </Suspense></SessionProvider></ChatWidgetBoundary>
        </BrowserRouter>
      </QueryProvider>
    </>
  );
}

export default App;
