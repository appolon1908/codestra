import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AOS from "aos";
import "aos/dist/aos.css";
import AuthProvider from "./Providers/AuthProvider";
import { SessionProvider } from "./Providers/SessionProvider";

const Home = lazy(() => import("./Pages/Home/Home"));
const Login = lazy(() => import("./Pages/Login/Login"));
const Signup = lazy(() => import("./Pages/Signup/Signup"));
const AboutUs = lazy(() => import("./Pages/About/AboutUs"));
const CaseStudies = lazy(() => import("./Pages/CaseStudies/CaseStudies"));
const ContactUs = lazy(() => import("./Pages/Contact/ContactUs"));
const ContactSales = lazy(() => import("./Pages/Contact/ContactSales"));
const ContactSupport = lazy(() => import("./Pages/Contact/ContactSupport"));
const ElectronicBilling = lazy(() => import("./Pages/ElectronicBilling/ElectronicBilling"));
const ElectronicBillingForm = lazy(() => import("./Pages/BillingForm/ElectronicBillingForm"));
const HiringPosition = lazy(() => import("./Pages/Hiring/HiringPosition"));
const Services = lazy(() => import("./Pages/Services/Services"));
const Privacy = lazy(() => import("./Pages/Privacy/Privacy"));
const HomeDash = lazy(() => import("./Pages/Dashboard/HomeDash"));
const SignedOut = lazy(() => import("./Pages/SignedOut"));
const NotFound = lazy(() => import("./Pages/NotFound"));

const queryClient = new QueryClient();

const RouteLoading = () => (
  <main className="orbit-state-page" id="main-content" aria-live="polite">
    <div className="orbit-loading-indicator" aria-hidden="true" />
    <p>Loading page.</p>
  </main>
);

function App() {
  useEffect(() => {
    if (typeof window.matchMedia !== "function" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      AOS.init({ once: true, duration: 600 });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signed-out" element={<SignedOut />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/contact/sales" element={<ContactSales />} />
              <Route path="/contact/support" element={<ContactSupport />} />
              <Route path="/electronic-billing" element={<ElectronicBilling />} />
              <Route path="/electronic-billing/form" element={<ElectronicBillingForm />} />
              <Route path="/hiring/positions" element={<HiringPosition />} />
              <Route path="/services" element={<Services />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route
                path="/auth/dashboard"
                element={<AuthProvider element={<HomeDash />} />}
              />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;
