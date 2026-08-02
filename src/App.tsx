import { lazy, Suspense } from 'react'
import AuthProvider from './Providers/AuthProvider'
import QueryProvider from './Providers/QueryProvider'
import { BrowserRouter, Routes, Route } from 'react-router'

import AOS from 'aos';
import 'aos/dist/aos.css';

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

AOS.init();
function App() {

  return (
    <>
    <QueryProvider> 
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-[#080808]" aria-label="Loading" />}>
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
              <Route path="/privacy" element={<Privacy />} />
              
              <Route path="/*" element={<AuthProvider element={
                <div>
                  <AllRoutes />
                </div>
              }/>} />
            </Routes>
            </Suspense>
          </BrowserRouter>
      </QueryProvider>
    </>
  )
}

export default App
