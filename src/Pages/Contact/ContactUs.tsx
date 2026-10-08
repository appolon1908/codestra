import { LuMessageCircle } from 'react-icons/lu';
import Navbar from '../../Components/Layouts/Navbar'
import { Button3 } from '../../Components/components/Button'
import { GrMail } from "react-icons/gr";
import { MdKeyboardArrowRight } from "react-icons/md";
import Footer from '../../Components/Layouts/Footer';
import { Link } from 'react-router';


const ContactUs = () => {
  return (
    <div>
        <Navbar />
        <div className='2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem] text-center'>
            <h2 className='lg:text-4xl text-2xl font-semibold pb-4'>How we can help?</h2>
            <p className='lg:text-base text-sm text-[#B4B5B5]'>
                Get in touch with our sales and support 
                 teams for demos, <br className='hidded lg:block'/> onboarding support, or product questions
            </p>

            <div  className='grid lg:grid-cols-2 grid-cols-1 lg:gap-16 gap-5 text-left pt-20 '>
                <div data-aos="fade-up" data-aos-duration="500" className='bg-[#151517] lg:p-10 p-5 rounded-2xl border border-[#1f1f22] '>
                    <h2 className='text-2xl flex items-center gap-2'><GrMail />Sales</h2>
                    <p className='text-sm py-4 text-[#B4B5B5]'>
                        Contact our sales team for information on plans, 
                        pricing, enterprise agreements, or to request a demo.
                    </p>
                    <Link to={'/contact/sales'}>
                        <Button3 text='Talk to sales'/>
                    </Link>
                </div>

                <div data-aos="fade-up" data-aos-duration="500" className='bg-[#151517] lg:p-10 p-5 rounded-2xl border border-[#1f1f22] '>
                    <h2 className='text-2xl flex items-center gap-2'><LuMessageCircle  />Support</h2>
                    <p className='text-sm py-4 text-[#B4B5B5] w-[60%]'>
                        Reach out with product inquiries, report issues, or share your feedback.
                    </p>
                    <Link to={'/contact/support'}>
                        <Button3 text='Talk to Support'/>
                    </Link>
                </div>
            </div>

            <div data-aos="fade-up" data-aos-duration="500" className='text-sm grid lg:grid-cols-2 grid-cols-1 text-left lg:gap-14 gap-10 lg:justify-center lg:m-auto lg:mt-[5rem] mt-[5rem] px-[2rem]'>
                <div>
                    <h2 className='text-lg'>Join the community</h2>
                    <p className='text-sm py-4 text-[#B4B5B5] lg:w-[60%] w-full'>
                        Contact our team to learn about available Codestra resources and support.
                    </p>
                    <a className='underline' href='mailto:support@codestra.co'>Contact Codestra support</a>
                </div>

                <div>
                    <h2 className='text-lg'>General communication</h2>
                    <p className='text-sm py-4 text-[#B4B5B5] lg:w-[60%] w-full'>
                        For any additional questions, feel free to contact us by email.
                    </p>
                    <p className='flex items-center gap-2'><GrMail /> info@codestra.co</p>
                </div>

                <div>
                    <h2 className='text-lg'>Documentation</h2>
                    <p className='text-xs py-4 text-[#B4B5B5] lg:w-[60%] w-full'>
                        Explore Codestra's features, integrations, and learn how to make the most of them.
                    </p>
                    <a href='/api/docs/' className='flex items-center gap-2 hover:text-[#FFD700]'>Codestra Docs <MdKeyboardArrowRight /></a>
                </div>

                <div>
                    <h2 className='text-lg'>Developers</h2>
                    <p className='text-xs py-4 text-[#B4B5B5] w-[70%]'>
                        Learn how to use our tools to extend functionality in digital product development.
                    </p>
                    <a href='/api/schema/' className='flex items-center gap-2 hover:text-[#FFD700]'>Codestra API Schema <MdKeyboardArrowRight /></a>
                </div>
            </div>

            <p className='text-center text-[#FFD700] cursor-pointer pt-[5rem] flex items-center gap-2 justify-center m-auto text-sm '>
                Contact support for current service availability
            </p>
        </div>
        <Footer />
    </div>
  )
}

export default ContactUs
