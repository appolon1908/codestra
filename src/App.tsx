import { featureRoutes } from "./features/FeatureRoutes";
import AuthProvider from "./Providers/AuthProvider";
import { SessionProvider } from "./Providers/SessionProvider";
import ChatWidgetBoundary from "./Components/ChatWidgetBoundary";
import { lazy, Suspense, useEffect } from "react";
import QueryProvider from "./Providers/QueryProvider";
import { BrowserRouter, Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";

import AOS from "aos";
import "aos/dist/aos.css";
import { LocaleBoundary, LocalizedRedirect } from "./i18n/LocaleBoundary";

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
function App() {
  const { t } = useTranslation("common");
  useEffect(() => { AOS.init(); }, []);
  return (
    <>
      <QueryProvider>
        <BrowserRouter>
          <ChatWidgetBoundary><SessionProvider><Suspense
            fallback={
              <div className="min-h-screen bg-[#080808]" aria-label={t("loading")} />
            }
          >
            <Routes>
              {featureRoutes.map(({path, element}) => <Route key={path} path={path} element={element} />)}
              <Route path="/services/:slug" element={<LandingPage kind="service" />} />
              <Route path="/industries/:slug" element={<LandingPage kind="industry" />} />
              <Route path="/solutions" element={<LandingIndex kind="service" />} />
              <Route path="/auth/*" element={<AuthProvider element={<AllRoutes />} />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/sms" element={<LegalPage kind="sms" />} />
              <Route path="/sms-terms" element={<LegalPage kind="smsTerms" />} />
              <Route path="/contact-information" element={<LegalPage kind="contactInformation" />} />
              <Route path="/:locale" element={<LocaleBoundary />}>
                <Route index element={<Home />} />
                <Route path="systems" element={<ModernHome />} />
                <Route path="solutions" element={<LandingIndex kind="service" />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="case-studies" element={<CaseStudies />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="contact/sales" element={<ContactSales />} />
                <Route path="contact/support" element={<ContactSupport />} />
                <Route path="electronic-billing" element={<ElectronicBilling />} />
                <Route path="electronic-billing/form" element={<ElectronicBillingForm />} />
                <Route path="hiring/positions" element={<HiringPosition />} />
                <Route path="services" element={<Services />} />
                <Route path="services/software-development" element={<ServiceDetailPage kind="software-development" />} />
                <Route path="services/ai-automation" element={<ServiceDetailPage kind="ai-automation" />} />
                <Route path="services/odoo-crm" element={<ServiceDetailPage kind="odoo-crm" />} />
                <Route path="services/contact-center" element={<ServiceDetailPage kind="contact-center" />} />
                <Route path="how-it-works" element={<HowItWorksPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="accessibility" element={<AccessibilityPage />} />
                <Route path="company-profile" element={<CorporateProfilePage />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="cookies" element={<CookiePolicyPage />} />
                <Route path="cookie-preferences" element={<CookiePreferencesPage />} />
                <Route path="privacy-choices" element={<PrivacyChoicesPage />} />
                <Route path="communications-preferences" element={<CommunicationsPreferencesPage />} />
                <Route path="ai-receptionist" element={<AIReceptionist />} />
                <Route path="pricing" element={<AIReceptionist />} />
                <Route path="book-demo" element={<BookDemoPage />} />
                <Route path="request-pricing" element={<RequestPricingPage />} />
                <Route path="industries" element={<IndustriesDirectory />} />
                <Route path="industries/:industrySlug" element={<IndustryPage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="terms" element={<Terms />} />
                <Route path="sms" element={<LegalPage kind="sms" />} />
                <Route path="sms-terms" element={<LegalPage kind="smsTerms" />} />
                <Route path="contact-information" element={<LegalPage kind="contactInformation" />} />
                <Route path="auth/*" element={<AuthProvider element={<AllRoutes />} />} />
                <Route path="thank-you" element={<ThankYouPage />} />
                <Route path="marketplace/*" element={<PlatformHub area="marketplace" />} />
                <Route path="sales/*" element={<AuthProvider element={<PlatformHub area="sales" />} />} />
                <Route path="portal/*" element={<AuthProvider element={<PlatformHub area="customer" />} />} />
                <Route path="partners/*" element={<PlatformHub area="partner" />} />
                <Route path="developers/*" element={<PlatformHub area="developer" />} />
                <Route path="documentation/*" element={<PlatformHub area="documentation" />} />
                <Route path="academy/*" element={<PlatformHub area="academy" />} />
                <Route path="support/*" element={<PlatformHub area="support" />} />
                <Route path="status" element={<PlatformHub area="status" />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<LocalizedRedirect />} />
            </Routes>
          </Suspense></SessionProvider></ChatWidgetBoundary>
        </BrowserRouter>
      </QueryProvider>
    </>
  );
}

export default App;
