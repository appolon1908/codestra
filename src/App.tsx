import { lazy, Suspense } from "react";
import QueryProvider from "./Providers/QueryProvider";
import { BrowserRouter, Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";

import AOS from "aos";
import "aos/dist/aos.css";
import { LocaleBoundary, LocalizedRedirect } from "./i18n/LocaleBoundary";

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
const TermsPage = lazy(() =>
  import("./Pages/AIReceptionist/ConversionPages").then((module) => ({
    default: module.TermsPage,
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

AOS.init();
function App() {
  const { t } = useTranslation("common");
  return (
    <>
      <QueryProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#080808]" aria-label={t("loading")} />
            }
          >
            <Routes>
              <Route path="/:locale" element={<LocaleBoundary />}>
                <Route index element={<Home />} />
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
                <Route path="terms" element={<TermsPage />} />
                <Route path="thank-you" element={<ThankYouPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<LocalizedRedirect />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryProvider>
    </>
  );
}

export default App;
