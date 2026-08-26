import { lazy, Suspense, type PropsWithChildren } from 'react'
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
const Industries = lazy(() => import('./Pages/Industries/Industries'))
const Privacy = lazy(() => import('./Pages/Privacy/Privacy'))
const NotFound = lazy(() => import('./Pages/NotFound'))

const MarketingRoute = ({ children }: PropsWithChildren) => (
  <div className="marketing-route">{children}</div>
)

const App = () => (
  <QueryProvider>
    <BrowserRouter>
      <RouteMeta />
      <Suspense
        fallback={(
          <div className="route-loader route-loader--corporate" role="status" aria-label="Loading page">
            <span />
          </div>
        )}
      >
        <Routes>
          <Route path="/" element={<MarketingRoute><Home /></MarketingRoute>} />
          <Route path="/login" element={<MarketingRoute><Login /></MarketingRoute>} />
          <Route path="/signup" element={<MarketingRoute><Signup /></MarketingRoute>} />
          <Route path="/about" element={<MarketingRoute><AboutUs /></MarketingRoute>} />
          <Route path="/case-studies" element={<MarketingRoute><CaseStudies /></MarketingRoute>} />
          <Route path="/contact" element={<MarketingRoute><ContactUs /></MarketingRoute>} />
          <Route path="/contact/sales" element={<MarketingRoute><ContactSales /></MarketingRoute>} />
          <Route path="/contact/support" element={<MarketingRoute><ContactSupport /></MarketingRoute>} />
          <Route path="/electronic-billing" element={<MarketingRoute><ElectronicBilling /></MarketingRoute>} />
          <Route path="/electronic-billing/form" element={<MarketingRoute><ElectronicBillingForm /></MarketingRoute>} />
          <Route path="/hiring/positions" element={<MarketingRoute><HiringPosition /></MarketingRoute>} />
          <Route path="/services" element={<MarketingRoute><Services /></MarketingRoute>} />
          <Route path="/industries" element={<MarketingRoute><Industries /></MarketingRoute>} />
          <Route path="/privacy" element={<MarketingRoute><Privacy /></MarketingRoute>} />
          <Route path="/auth/*" element={<AuthProvider element={<AllRoutes />} />} />
          <Route path="*" element={<MarketingRoute><NotFound /></MarketingRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryProvider>
)

export default App
