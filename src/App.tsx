import AboutUs from './Pages/About/AboutUs'
import ContactSales from './Pages/Contact/ContactSales'
import ContactSupport from './Pages/Contact/ContactSupport'
import ContactUs from './Pages/Contact/ContactUs'
import Home from './Pages/Home/Home'
import Login from './Pages/Login/Login'
import Signup from './Pages/Signup/Signup'
import AuthProvider from './Providers/AuthProvider'
import QueryProvider from './Providers/QueryProvider'
import AllRoutes from './Routes/AllRoutes'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AOS from 'aos';
import 'aos/dist/aos.css';
import ElectronicBilling from './Pages/ElectronicBilling/ElectronicBilling'
import ElectronicBillingForm from './Pages/BillingForm/ElectronicBillingForm'
import HiringPosition from './Pages/Hiring/HiringPosition'

AOS.init();
function App() {

  return (
    <>
    <QueryProvider> 
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/contact/sales" element={<ContactSales />} />
              <Route path="/contact/support" element={<ContactSupport />} />
              <Route path="/electronic-billing" element={<ElectronicBilling />} />
              <Route path="/electronic-billing/form" element={<ElectronicBillingForm />} />
              <Route path="/hiring/positions" element={<HiringPosition />} />
              
              <Route path="/*" element={<AuthProvider element={
                <div>
                  <AllRoutes />
                </div>
              }/>} />
            </Routes>
          </BrowserRouter>
      </QueryProvider>
    </>
  )
}

export default App
