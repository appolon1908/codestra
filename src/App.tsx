import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AboutUs from './Pages/About/AboutUs'
import ElectronicBillingForm from './Pages/BillingForm/ElectronicBillingForm'
import CaseStudies from './Pages/CaseStudies/CaseStudies'
import ContactSales from './Pages/Contact/ContactSales'
import ContactSupport from './Pages/Contact/ContactSupport'
import ContactUs from './Pages/Contact/ContactUs'
import HomeDash from './Pages/Dashboard/HomeDash'
import ElectronicBilling from './Pages/ElectronicBilling/ElectronicBilling'
import HiringPosition from './Pages/Hiring/HiringPosition'
import Home from './Pages/Home/Home'
import Insights from './Pages/Insights/Insights'
import Login from './Pages/Login/Login'
import NotFound from './Pages/NotFound'
import Privacy from './Pages/Privacy/Privacy'
import Services from './Pages/Services/Services'
import Signup from './Pages/Signup/Signup'
import SiteLayout from './Components/Layouts/SiteLayout'
import AuthProvider from './Providers/AuthProvider'
import QueryProvider from './Providers/QueryProvider'

const App = () => <QueryProvider><BrowserRouter><Routes>
  <Route element={<SiteLayout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<AboutUs />} />
    <Route path="services" element={<Services />} />
    <Route path="case-studies" element={<CaseStudies />} />
    <Route path="contact" element={<ContactUs />} />
    <Route path="contact/sales" element={<ContactSales />} />
    <Route path="contact/support" element={<ContactSupport />} />
    <Route path="electronic-billing" element={<ElectronicBilling />} />
    <Route path="electronic-billing/form" element={<ElectronicBillingForm />} />
    <Route path="hiring/positions" element={<HiringPosition />} />
    <Route path="insights" element={<Insights />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="auth/dashboard" element={<AuthProvider element={<HomeDash />} />} />
    <Route path="*" element={<NotFound />} />
  </Route>
  <Route path="login" element={<Login />} />
  <Route path="signup" element={<Signup />} />
</Routes></BrowserRouter></QueryProvider>

export default App
