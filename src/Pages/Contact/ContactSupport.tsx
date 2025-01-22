import Navbar from '../../Components/Layouts/Navbar'
import Footer from '../../Components/Layouts/Footer'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { Button3 } from '../../Components/components/Button'
import { Link } from 'react-router-dom'

const ContactSupport = () => {
  return (

    <>
        <Navbar />
        <div className='lg:px-[25rem] px-5 lg:pt-[10rem] pt-[8rem] '>
            <div className='grid grid-cols-2 gap-20'>
                <div className='space-y-10'>

                    <div>
                        <h2 className="lg:text-4xl text-2xl">Contact Support</h2>

                        <div className="py-8 space-y-4">
                            <p className="flex items-center gap-2"><IoCheckmarkCircle className="text-xl"/> Request a demo</p>
                            <p className="flex items-center gap-2"><IoCheckmarkCircle className="text-xl"/> Learn which plan is right for your team</p>
                            <p className="flex items-center gap-2"><IoCheckmarkCircle className="text-xl"/> Get onboarding help</p>
                        </div>
                    </div>

                    <p className='text-center text-[#FFD700] cursor-pointer flex  gap-2 text-sm '>
                        <IoCheckmarkCircle className='text-xl'/>All systems operational
                    </p>

                    <div className='text-sm space-y-2'>
                        <p>Questions about our plans, pricing, or request a demo?</p>
                        <Link to={'/contact/sales'}>
                            <p className="flex items-center gap-3 cursor-pointer mt-3 text-white hover:text-neutral-200">Talk to sales <MdKeyboardArrowRight /></p>
                        </Link>
                    </div>

                    <div className='text-sm space-y-2'>
                        <p>Get an overview of Linear's features, integrations, and how to use them.</p>
                        <p className="flex items-center gap-3 cursor-pointer">Visit Docs <MdKeyboardArrowRight /></p>
                    </div>
                </div>

                <div className='flex flex-col gap-3 justify-center items-center bg-[#161718] border border-[#232425] text-sm p-10 rounded-xl'>
                    <h2>Log in to your Codestra account so we can help you faster:</h2>
                    <Link to={'/login'}>
                        <Button3 text='Log in'/>
                    </Link>
                    <p>or email us at info@codestra.co</p>
                </div>
            </div>
        </div>
        <Footer />
    </>
  )
}

export default ContactSupport