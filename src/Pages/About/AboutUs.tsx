import Navbar from '../../Components/Layouts/Navbar'
import heroImage from '../../assets/bga.png'
import aboutImage from '../../assets/aboutpic.png'
import { Button1, Button3 } from '../../Components/components/Button'
import { investorData } from '../../Components/MockData'
import { useState } from 'react'
import { IoMdCall } from "react-icons/io";
import { FaCalendarDays } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import investor from '../../assets/investors.png'
import investora from '../../assets/investors1.png'
import investlogo from '../../assets/investlogo.png'
import investlogoa from '../../assets/investlogoa.png'
import Footer from '../../Components/Layouts/Footer'
import useEmployee from '../../hooks/queries/useEmployee'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from 'react-router-dom'
import React from 'react'


interface Employee {
    id: number;
    team: string;
    profile_picture: string | null;
    image?: string;
    first_name: string;
    last_name: string;
    position: string;
    phone: string;
    socials: { name: string; link: string }[];
  }
  
const AboutUs = () => {

    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const {data, isLoading} = useEmployee()

    const employeeData = data?.data?.results as Employee | []

    console.log('This is Mutate', employeeData);
    


    const groupedData = Array.isArray(employeeData)
    ? employeeData.reduce((acc: { [key: string]: Employee[] }, item: Employee) => {
        if (!acc[item.team]) {
            acc[item.team] = [];
        }
        acc[item.team].push(item);
        return acc;
        }, {})
    : {};


  return (
    <>
        <Navbar />
        <div className='px-5'>
            <div className='lg:pt-[10rem] pt-[8rem] overflow-hidden'>
                <h2 className='text-center lg:text-4xl text-2xl lg:leading-[3rem] lg:pb-10 pb-5'>
                    Empowering Businesses with Innovative Digital 
                    <br className='hidden lg:block'/> Solutions and Intelligent Automation
                </h2>
                <div className='lg:w-[70%] w-[150%] flex m-auto'>
                    <img src={heroImage} className='w-full' alt="" />
                </div>
            </div>

            <div className='lg:px-[25rem]'>

                <div className='grid lg:grid-cols-2 grid-cols-1 lg:gap-20 gap-5 lg:pt-[10rem] pt-[5rem]'>
                    <h2 className='lg:text-3xl text-xl'>
                        We create innovative digital solutions and automation tools for businesses that value quality and growth
                    </h2>

                    <div className='space-y-5 text-sm leading-relaxed text-justify text-[#B4B5B5]'>
                        <p>
                            Digital solutions used to be captivating, but over time, 
                            their magic faded, replaced by inefficient tools and processes 
                            that slow teams down and hinder great work. Frustrated with the 
                            status quo, we decided to build something better—solutions that 
                            teams would actually enjoy using.
                        </p>

                        <p>
                            We named it Codestra to signify development and progress. 
                            What started as a simple solution has evolved into a powerful 
                            platform for creating and automating business processes, 
                            streamlining workflows, and helping teams work more efficiently. 
                        </p>

                        <p>
                            We don’t think of Codestra as just a "tool," but as a "way" to build business. 
                            Today, thousands of teams worldwide—from startups to large companies—use our 
                            solutions to optimize their processes. We help them focus on what matters most: 
                            creating products and services that inspire and drive growth.
                        </p>
                    </div>
                </div>

                <div className='grid lg:grid-cols-2 grid-cols-1 lg:gap-20 gap-5 lg:pt-[10rem] pt-[5rem]'>
                    <div className='space-y-6'>
                        <h2 className='lg:text-3xl text-xl'>
                            We place great importance on the quality of our work.
                        </h2>

                        <p className='text-sm text-[#B4B5B5] text-justify'>
                        Codestra has always been a fully remote company. Today, our small 
                        but strong team is distributed across North and Latin America. What 
                        unites us is relentless focus, fast execution, and our passion for 
                        digital craftsmanship. We are all creators at heart and place great 
                        importance on the quality of our work, paying attention to every detail.
                        </p>

                        <Button3 text='We`re hiring'/>
                    </div>

                    <div className='w-full'>
                        <img src={aboutImage} className='w-full' alt="" />
                    </div>
                </div>  

                {isLoading ? 
                    <div className='flex justify-center items-center z-30 pt-[5rem]'>
                        <span className="loading loading-spinner loading-md text-white"></span>
                    </div>

                    : 
                    <div className="lg:pt-[10rem] pt-[5rem] lg:px-0 px-5">
                        {employeeData && (
                            <>
                            {Object.entries(groupedData!).map(([category, items]) => (
                                <div key={category}>
                                <h2 className="lg:text-2xl lg:text-left text-2xl">{category}</h2>
                                <div className="w-full grid lg:grid-cols-5 grid-cols-1 gap-8 pt-5 pb-[5rem] lg:px-[3rem] px-0">
                                    {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative"
                                        onMouseEnter={() => setHoveredId(item.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        <div className="flex items-center gap-3 lg:px-0 px-5 cursor-pointer">
                                        {item.profile_picture ? (
                                            <img className="w-5 h-5" src={item.image || "/placeholder.svg"} alt={item.first_name} />
                                        ) : (
                                            <p className="bg-neutral-800 text-sm font-semibold rounded-full flex h-9 w-9 justify-center items-center text-white">
                                            {item.first_name.slice(0, 1)}
                                            {item.last_name.slice(0, 1)}
                                            </p>
                                        )}
                                        <h3 className="text-sm">
                                            {item.first_name} {item.last_name}
                                        </h3>
                                        </div>

                                        <div
                                        className={`absolute top-full left-0 right-0 m-auto flex lg:justify-center transform lg:translate-x-0 cursor-pointer lg:w-[18rem] mt-2 border border-neutral-800 bg-neutral-900 rounded-md shadow-lg z-10 transition-all duration-300 ease-in-out ${
                                            hoveredId === item.id ? "opacity-100 visible" : "opacity-0 invisible"
                                        }`}
                                        >
                                        <div className="p-4">
                                            <div className="flex items-center justify-center m-auto gap-4 w-full">
                                            <div className="flex items-center gap-3">
                                                {item.profile_picture ? (
                                                <img className="w-5 h-5" src={item.image || "/placeholder.svg"} alt={item.first_name} />
                                                ) : (
                                                <p className="bg-white text-sm font-semibold rounded-full flex h-9 w-9 justify-center items-center text-black">
                                                    {item.first_name.slice(0, 1)}
                                                    {item.last_name.slice(0, 1)}
                                                </p>
                                                )}
                                                <div>
                                                <h3 className="text-sm">
                                                    {item.first_name} {item.last_name}
                                                </h3>
                                                <p className="text-xs text-[#B4B5B5] text-justify">{item.position}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-auto">
                                                {item.socials.map((social, socialIndex) => (
                                                <React.Fragment key={socialIndex}>
                                                    {social.name === "Facebook" && (
                                                    <Link to={social.link}>
                                                        <p className="rounded-full bg-neutral-800 hover:bg-neutral-700 p-2 text-sm text-neutral-300 transition-colors duration-200">
                                                        <FaFacebook />
                                                        </p>
                                                    </Link>
                                                    )}
                                                    {social.name === "Twitter" && (
                                                    <Link to={social.link}>
                                                        <p className="rounded-full bg-neutral-800 hover:bg-neutral-700 p-2 text-sm text-neutral-300 transition-colors duration-200">
                                                        <FaTwitter />
                                                        </p>
                                                    </Link>
                                                    )}
                                                    {social.name === "Instagram" && (
                                                    <Link to={social.link}>
                                                        <p className="rounded-full bg-neutral-800 hover:bg-neutral-700 p-2 text-sm text-neutral-300 transition-colors duration-200">
                                                        <FaInstagram />
                                                        </p>
                                                    </Link>
                                                    )}

                                                    {social.name === "Linkedin" && (
                                                    <Link to={social.link}>
                                                        <p className="rounded-full bg-neutral-800 hover:bg-neutral-700 p-2 text-sm text-neutral-300 transition-colors duration-200">
                                                        <FaLinkedin />
                                                        </p>
                                                    </Link>
                                                    )}
                                                </React.Fragment>
                                                ))}
                                            </div>
                                            </div>

                                            <div className="pt-5 flex items-center">
                                            <p className="flex items-center gap-2 text-xs">
                                                <IoMdCall className="text-lg" />
                                                {item.phone}
                                            </p>
                                            <p className="flex items-center gap-2 text-lg ml-auto">
                                                <IoLogoWhatsapp className="text-xl hover:text-neutral-200 transition-colors duration-200" />
                                                <FaCalendarDays className="hover:text-neutral-200 transition-colors duration-200" />
                                            </p>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                </div>
                            ))}
                            </>
                        )}
                    </div>
                }

                <div className='lg:pt-[10rem] pt-[5rem]'>
                    <p className='text-xs pb-2 lg:mb-8 mb-5 border-b border-[#242424]'>Investors</p>
                    
                    <div className='flex lg:flex-row flex-col lg:gap-[10rem] gap-5'>
                        <div>
                            <h2 className='lg:text-3xl text-xl'>We place great importance on the quality of our work</h2>
                            <p className='pt-5 text-[#B4B5B5]'>
                                We are proud to work with some of the top investors in the industry. 
                                Our backers include leading venture firms and exceptional founders 
                                and product creators from around the world.
                            </p>
                        </div>

                        <div className='flex  gap-5 lg:w-[70%] w-full lg:ml-auto'>
                            <div className=''>
                                <img src={investor} alt=""  className='w-full'/>
                                <h2 className='text-base pt-4'>Phillip Jortiny</h2>
                                <p className='text-xs py-1'>Founder and CEO</p>
                                <img src={investlogo} alt=""  className='w-25 pt-3'/>
                            </div>

                            <div className=''>
                                <img src={investora} alt=""  className='w-full'/>
                                <h2 className='text-base pt-4'>Micheal Loaren</h2>
                                <p className='text-xs py-1'>Partner</p>
                                <img src={investlogoa} alt=""  className='w-25 pt-3'/>
                            </div>
                        </div>

                    </div>

                    <div className='grid lg:grid-cols-6 lg:gap-6 gap-3 grid-cols-2 text-sm items-center mt-20'>
                        {investorData.map((investor)=>(
                            <div className='lg:w-full w-fit'>
                                <h2>{investor.name}</h2>
                                <p className='text-xs text-[#B4B5B5] pt-2'>{investor.position}</p>
                            </div>
                        ))}
                    </div>
                </div>


                <div className='lg:pt-[10rem] pt-[5rem]'>
                    <p className='text-xs pb-2 lg:mb-8 mb-5 border-b border-[#242424]'>News</p>
                    
                    <div className=''>

                        <div className='flex text-sm items-center justify-between p-5 rounded-md hover:bg-neutral-900 cursor-pointer'>
                            <h2>Title of the news</h2>
                            <p className='text-sm text-[#B4B5B5]'>A little bit of information</p>
                            <p className='text-sm'>website.com</p>
                        </div>

                        <div className='flex text-sm items-center justify-between p-5 rounded-md hover:bg-neutral-900 cursor-pointer mt-10'>
                            <h2>Title of the news</h2>
                            <p className='text-sm text-[#B4B5B5]'>A little bit of information</p>
                            <p className='text-sm'>website.com</p>
                        </div>

                        <div className='flex text-sm items-center justify-between p-5 rounded-md hover:bg-neutral-900 cursor-pointer mt-10'>
                            <h2>Title of the news</h2>
                            <p className='text-sm text-[#B4B5B5]'>A little bit of information</p>
                            <p className='text-sm'>website.com</p>
                        </div>
                    </div>
                </div>

                <div className='lg:pt-[10rem] pt-[5rem]'>
                    <p className='text-xs pb-2 lg:mb-8 mb-5 border-b border-[#242424]'>Vision</p>

                    <div className='flex justify-center text-sm gap-20 '>
                        <div>
                            <h2 className=''>Enabling success</h2>
                            <p className='text-sm pt-5 text-[#B4B5B5]'>
                                Codestra nurtures long-term partnerships that result in
                                meaningful digital experiences and take our clients to the
                                next level.
                            </p>
                        </div>

                        <div>
                            <h2 className=''>Turning ideas into reality</h2>
                            <p className='text-sm pt-5 text-[#B4B5B5]'>
                                Our design and development solutions fulfill the vision of
                                brands that meet their goals and adapt to future challenges.
                            </p>
                        </div>
                    </div>
                    
                    <div className='flex gap-5 text-sm justify-center m-auto pt-16 items-center'>
                        <h2>Still not sure? Get to know us better.</h2>
                        <Button1 text='Our Works'/>
                    </div>

                </div>
            </div>



        </div>
        <Footer />
    </>
  )
}

export default AboutUs