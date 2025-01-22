import { LuMessageCircle } from 'react-icons/lu';
import Navbar from '../../Components/Layouts/Navbar'
import { Button3 } from '../../Components/components/Button'
import { GrMail } from "react-icons/gr";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoCheckmarkCircle } from "react-icons/io5";
import Footer from '../../Components/Layouts/Footer';
import { Link } from 'react-router-dom';


const ContactUs = () => {
  return (
    <div>
        <Navbar />
        <div className='lg:px-[25rem] px-5 lg:pt-[10rem] pt-[8rem] text-center'>
            <h2 className='lg:text-4xl text-2xl font-semibold pb-4'>How we can help?</h2>
            <p className='text-base text-[#B4B5B5]'>
                Get in touch with our sales and support 
                 teams for demos, <br className='hidded lg:block'/> onboarding support, or product questions
            </p>

            <div className='grid grid-cols-2 gap-16 text-left pt-20 '>
                <div className='bg-[#151517] p-10 rounded-2xl border border-[#1f1f22] '>
                    <h2 className='text-2xl flex items-center gap-2'><GrMail />Sales</h2>
                    <p className='text-sm py-4 text-[#B4B5B5]'>
                        Contact our sales team for information on plans, 
                        pricing, enterprise agreements, or to request a demo.
                    </p>
                    <Link to={'/contact/sales'}>
                        <Button3 text='Talk to sales'/>
                    </Link>
                </div>

                <div className='bg-[#151517] p-10 rounded-2xl border border-[#1f1f22] '>
                    <h2 className='text-2xl flex items-center gap-2'><LuMessageCircle  />Support</h2>
                    <p className='text-sm py-4 text-[#B4B5B5] w-[60%]'>
                        Reach out with product inquiries, report issues, or share your feedback.
                    </p>
                    <Link to={'/contact/support'}>
                        <Button3 text='Talk to Support'/>
                    </Link>
                </div>
            </div>

            <div className='text-sm grid grid-cols-2 text-left gap-14 justify-center m-auto mt-[5rem] px-[2rem]'>
                <div>
                    <h2 className='text-lg'>Join the community</h2>
                    <p className='text-sm py-4 text-[#B4B5B5] w-[60%]'>
                        Join over 10,000 Codestra users in our Slack community to share insights, ask questions, and explore best practices.
                    </p>
                    <p className='flex items-center gap-2'>Join Slack <MdKeyboardArrowRight  /></p>
                </div>

                <div>
                    <h2 className='text-lg'>General communication</h2>
                    <p className='text-sm py-4 text-[#B4B5B5] w-[60%]'>
                        For any additional questions, feel free to contact us by email.
                    </p>
                    <p className='flex items-center gap-2'><GrMail /> info@codestra.co</p>
                </div>

                <div>
                    <h2 className='text-lg'>Documentation</h2>
                    <p className='text-xs py-4 text-[#B4B5B5] w-[60%]'>
                        Explore Codestra's features, integrations, and learn how to make the most of them.
                    </p>
                    <p className='flex items-center gap-2'>Codestra Docs <MdKeyboardArrowRight  /></p>
                </div>

                <div>
                    <h2 className='text-lg'>Developers</h2>
                    <p className='text-xs py-4 text-[#B4B5B5] w-[70%]'>
                        Learn how to use our tools to extend functionality in digital product development.
                    </p>
                    <p className='flex items-center gap-2'>Codestra API <MdKeyboardArrowRight  /></p>
                </div>
            </div>

            <p className='text-center text-[#FFD700] cursor-pointer pt-[5rem] flex items-center gap-2 justify-center m-auto text-sm '>
                <IoCheckmarkCircle className='text-xl'/>All systems operational
            </p>
        </div>
        <Footer />
    </div>
  )
}

export default ContactUs