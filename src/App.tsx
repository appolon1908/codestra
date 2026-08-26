import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import AuthProvider from './Providers/AuthProvider'
import QueryProvider from './Providers/QueryProvider'
import RouteMeta from './Components/SEO/RouteMeta'

const AboutUs = lazy(() => import('./Pages/About/AboutUs'))
const ContactSales = lazy(() => import('./Pages/Contact/ContactSales'))
const ContactSupport = lazy(() => import('./Pages/Contact/ContactSupport'))
const ContactUs = lazy(() => import('./Pages/Contact/ContactUs'))
const Home = lazy(() => import('./Pages/Home/Home'))
const Login = lazy(() => import('./Pages/Login/Login'))
const Signup = lazy(() => import('./Pages/Signup/Signup'))
const AllRoutes = lazy(() => import('./Routes/AllRoutes'))
const ElectronicBilling = lazy(() => import('./Pages/ElectronicBilling/ElectronicBilling'))
const ElectronicBillingForm = lazy(() => import('./Pages/BillingForm/ElectronicBillingForm'))
const HiringPosition = lazy(() => import('./Pages/Hiring/HiringPosition'))
const CaseStudies = lazy(() => import('./Pages/CaseStudies/CaseStudies'))
const Services = lazy(() => import('./Pages/Services/Services'))
const Privacy = lazy(() => import('./Pages/Privacy/Privacy'))
const NotFound = lazy(() => import('./Pages/NotFound'))
const LandingPage = lazy(() => import('./Pages/Landing/LandingPage'))
const LandingIndexPage = lazy(() => import('./Pages/Landing/LandingIndexPage'))

const App = () => (
  <QueryProvider>
    <BrowserRouter>
      <RouteMeta />
      <Suspense fallback={<div className="route-loader" role="status" aria-label="Loading page"><span /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/contact/sales" element={<ContactSales />} />
          <Route path="/contact/support" element={<ContactSupport />} />
          <Route path="/electronic-billing" element={<ElectronicBilling />} />
          <Route path="/electronic-billing/form" element={<ElectronicBillingForm />} />
          <Route path="/hiring/positions" element={<HiringPosition />} />
          <Route path="/services" element={<Services />} />
          <Route path="/ai-services" element={<LandingIndexPage kind="service" />} />
          <Route path="/ai-services/:slug" element={<LandingPage kind="service" />} />
          <Route path="/industries" element={<LandingIndexPage kind="industry" />} />
          <Route path="/industries/:slug" element={<LandingPage kind="industry" />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/auth/*" element={<AuthProvider element={<AllRoutes />} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryProvider>
)

export default App
