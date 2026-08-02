import { CaseModal, FaqModal } from '@/Components/components/Modals';
import Footer from '@/Components/Layouts/Footer'
import Navbar from '@/Components/Layouts/Navbar'
import { caseStudies, faqData, tabs } from '@/Components/MockData'
import { useState } from 'react';
import { CiCirclePlus } from "react-icons/ci";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaDoorClosed } from "react-icons/fa6";
import { FaLightbulb } from "react-icons/fa6";
import { GoArrowRight } from "react-icons/go";
import { HiSquare3Stack3D } from "react-icons/hi2";
import { FaShapes } from "react-icons/fa6";
import { Button1, Button2 } from '@/Components/components/Button';
import { Link } from 'react-router-dom';



interface FAQProps{
    id: number; 
    question: string; 
    answer: string; 
}

interface CaseProps {
    id: number;
    name : string
    bio: string
    description : string
    image: string
    information : {
        name: string

    }[]
}
const CaseStudies = () => {
    const [selectedFAQ, setSelectedFAQ] = useState<FAQProps>()
    const [selectedCase, setSelectedCase] = useState<CaseProps>()
    const [isOpen, setIsOpen] = useState(false)
    const [isOpen2, setIsOpen2] = useState(false)

    const [activeTab, setActiveTab] = useState<number>();

  return (
    <div>
        <Navbar />
        <div className='2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem]'>
            <div className='text-center' data-aos="fade-up" data-aos-duration="500">
                <h2 className='text-4xl pb-3'>Case Studies</h2>
                <p>
                    Discover how we bring digital products to life <br className='lg:block hidden'/> 
                    through innovative solutions
                </p>
            </div>

            <div className='grid lg:grid-cols-2 grid-cols-1 gap-10 pt-10 cursor-pointer'>
                {caseStudies.map((data, index)=>(
                    <div key={index} data-aos="fade-up" data-aos-duration="500" onClick={()=>{setSelectedCase(data); setIsOpen2(true)}} className='bg-black border border-neutral-800 lg:p-10 p-5 rounded-2xl'>
                        <div>
                            <img src={data?.image} alt="" className='w-full'/>
                        </div>

                        <div className='flex items-center lg:gap-10 gap-3'>
                            <div>
                                <h2 className='text-base'>{data?.name}</h2>
                                <p className='text-xs pt-2'>{data?.description}</p>
                            </div>
                            <p className='text-3xl ml-auto'><CiCirclePlus /></p>
                        </div>
                    </div>
                ))}
            </div>

            <CaseModal isOpen={isOpen2} >
                <div className='relative'>
                    <p className='absolute top-5 right-5 text-white text-3xl cursor-pointer' onClick={()=>setIsOpen2(false)}><IoIosCloseCircleOutline /></p>
                    <div className='pt-10 lg:w-[100%] w-[97%]'>
                        <div className='w-full flex m-auto justify-center aspect-video'>
                            <img src={selectedCase?.image} className='w-[80%]' alt="" />
                        </div>

                        <div className='border-t pt-5 mt-5 p-5 text-base border-neutral-800'>
                            <h2 className='pb-3 text-3xl'>{selectedCase?.name}</h2>
                            <h2 className='text-xs leading-normal'>{selectedCase?.description}</h2>

                            <div className='pt-3 mt-3 border-t border-neutral-800 '>
                                <h2 className=''>Information</h2>
                                <div className='flex flex-col gap-5 pt-2 text-xs'>
                                {selectedCase?.information.map((item, index)=>(
                                        <p key={index}>{item?.name}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CaseModal>


            <div data-aos="fade-up" data-aos-duration="500" className='flex flex-wrap gap-7 justify-between lg:pt-[8rem] pt-[5rem]'>
                <div className='text-center '>
                    <h2 className='text-2xl'>80+</h2>
                    <p className='text-xs'>International Client</p>
                </div>

                <div className='text-center '>
                    <h2 className='text-2xl'>100+</h2>
                    <p className='text-xs'>Projects Delivered</p>
                </div>

                <div className='text-center '>
                    <h2 className='text-2xl'>75+</h2>
                    <p className='text-xs'>In-house employees</p>
                </div>

                <div className='text-center '>
                    <h2 className='text-2xl'>93+</h2>
                    <p className='text-xs'>Senior & Middle Expert</p>
                </div>
            </div>

            <div className='lg:pt-[8rem] pt-[5rem]'>
                <h2 className='lg:text-3xl text-2xl font-semibold'>FAQs About Codestra  <br className='lg:block hidden'/> and Their Development Services</h2>


                <div data-aos="fade-up" data-aos-duration="500" className='grid lg:grid-cols-3 grid-cols-1 gap-5 pt-10'>
                    {faqData.map((data, index)=>(
                        <div key={index} onClick={()=>{setSelectedFAQ(data); setIsOpen(true)}} className='bg-neutral-950 flex gap-8 cursor-pointer border border-neutral-800 p-5 rounded-xl'>
                            <h2 className='text-base'>{data?.question}</h2>
                            <p className='text-3xl ml-auto'><CiCirclePlus /></p>
                        </div>
                    ))}
                </div>

                <FaqModal isOpen={isOpen} >
                    <div className='relative'>
                        <p className='absolute top-[-10px] right-0 text-white text-3xl cursor-pointer' onClick={()=>setIsOpen(false)}><IoIosCloseCircleOutline /></p>
                        <div className='pt-10 lg:w-[100%] w-[97%]'>
                            <h2 className='pb-3 border-b text-base border-neutral-800'>{selectedFAQ?.question}</h2>
                            <h2 className='pt-5 text-sm leading-normal'>{selectedFAQ?.answer}</h2>
                        </div>
                    </div>
                </FaqModal>
            </div>

            <div className='text-sm space-y-3 pt-[5rem]' data-aos="fade-up" data-aos-duration="500">
                <p>Note: These are general FAQs. For the most accurate and up-to-date information, I recommend visiting the official Codestra website or contacting them directly.</p>
                <p>Disclaimer: This information is for general knowledge and informational purposes only. It does not constitute financial, investment, or professional advice.</p>
                <div className='pt-5 space-y-3'>
                    <h2 className='lg:text-3xl text-2xl'>Exceptional UI/UX Design for Unforgettable Experiences</h2>
                    <p className='text-sm text-left leading-normal'>
                        We specialize in crafting exceptional user experiences through meticulous UI/UX design. 
                        Our work is grounded in robust design systems, ensuring consistency, scalability, 
                        and maintainability across all platforms. All our projects are meticulously designed in Figma, 
                        the industry-leading design platform, enabling seamless collaboration and efficient workflows. 
                        We curate a global team of top-tier UI/UX designers, each bringing unique expertise and a passion 
                        for crafting unforgettable user experiences. Your project will be overseen by a dedicated personal designer 
                        throughout its lifecycle, ensuring seamless communication and a consistent vision."
                    </p>
                </div>
            </div>
            
            <div className='lg:pt-[5rem] pt-[3rem] lg:mt-[5rem] mt-[3rem] border-t border-neutral-800'>
                <h2 className='text-center' data-aos="fade-up" data-aos-duration="500">Empowering ambitious product teams of all sizes.</h2>

                <div data-aos="fade-up" data-aos-duration="500" className='lg:flex grid grid-cols-3 flex-wrap rounded-lg items-center bg-neutral-900 p-2 lg:px-4 lg:rounded-full border border-neutral-800 lg:w-full w-[90%] m-auto gap-6 lg:text-sm text-xs justify-center mt-10'>
                    {tabs.map((tab, index)=>(
                        <button 
                            key={index} 
                            onClick={() => setActiveTab(index)}
                            className={`${activeTab === index && 'bg-neutral-800'} p-2 px-4 rounded-full`}
                        >{tab?.name}</button>
                    ))}
                </div>

                <div className='lg:text-sm text-xs flex flex-col gap-10 pt-16'>
                    <ul data-aos="fade-up" data-aos-duration="500" className='grid grid-cols-3 gap-2 border-b border-neutral-800 pb-5'>
                        <li className='cursor-pointer flex items-center gap-3'><FaDoorClosed />Tradx.io</li>
                        <li className='cursor-pointer'>Fintech</li>
                        <li className='cursor-pointer flex items-center gap-3 ml-auto'>Visit Site <GoArrowRight /></li>
                    </ul>

                    <ul data-aos="fade-up" data-aos-duration="500" className='grid grid-cols-3 gap-2 border-b border-neutral-800 pb-5'>
                        <li className='cursor-pointer flex items-center gap-3'><FaLightbulb />Nativo English</li>
                        <li className='cursor-pointer'>SaaS</li>
                        <li className='cursor-pointer flex items-center gap-3 ml-auto'>Visit Site <GoArrowRight /></li>
                    </ul>

                    <ul data-aos="fade-up" data-aos-duration="500" className='grid grid-cols-3 gap-2 border-b border-neutral-800 pb-5'>
                        <li className='cursor-pointer flex items-center gap-3'><FaShapes />Moneybee loan</li>
                        <li className='cursor-pointer'>Crypto</li>
                        <li className='cursor-pointer flex items-center gap-3 ml-auto'>Visit Site <GoArrowRight /></li>
                    </ul>

                    <ul data-aos="fade-up" data-aos-duration="500" className='grid grid-cols-3 gap-2 border-b border-neutral-800 pb-5'>
                        <li className='cursor-pointer flex items-center gap-3'><HiSquare3Stack3D />The Contact Center</li>
                        <li className='cursor-pointer'>Edtech</li>
                        <li className='cursor-pointer flex items-center gap-3 ml-auto'>Visit Site <GoArrowRight /></li>
                    </ul>
                </div>

                <div  className='flex lg:flex-row flex-col gap-5 justify-between pt-14' data-aos="fade-up" data-aos-duration="500">
                    <h2 className='lg:text-3xl text-2xl'>
                        Plan the present. 
                        <br /> Build the future
                    </h2>
                    <div className='flex items-center gap-5'>
                        <Link to='/signup'><Button2 text='Get Started'/></Link>
                        <Link to='/contact/sales'><Button1 text='Talk to Sales'/></Link>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
  )
}

export default CaseStudies
