import Navbar from '../../Components/Layouts/Navbar'
import image from '../../assets/Rectangle.png'
import { GoArrowRight } from "react-icons/go";

import companyOne from '../../assets/companies (1).png'
import companyTwo from '../../assets/companies (2).png'
import companyThree from '../../assets/companies (3).png'
import companyFour from '../../assets/companies (4).png'
import companyFive from '../../assets/companies (5).png'
import companySix from '../../assets/Group 79.png'

import productOne from '../../assets/product (3).png'
import productTwo from '../../assets/product (2).png'
import productThree from '../../assets/product (1).png'

import ai from '../../assets/ai.png'
import ai2 from '../../assets/ai2.png'

import uidesign from '../../assets/uidesign.png'

import { MdChevronRight } from "react-icons/md";
import { RiFileList2Fill } from "react-icons/ri";

import { TbMinusVertical } from "react-icons/tb";
import { frontendData, texts } from '../../Components/MockData';

import { MdNetworkWifi2Bar } from "react-icons/md";
import { IoLogoBuffer } from "react-icons/io";
import { BsSuitDiamondFill } from "react-icons/bs";
import { SiSimpleanalytics } from "react-icons/si";
import { useEffect, useState } from 'react';
import Footer from '../../Components/Layouts/Footer';


const Home = () => {
  
    const [displayText, setDisplayText] = useState<string>('');
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
    const [charIndex, setCharIndex] = useState<number>(0);
  
    useEffect(() => {
      if (charIndex < texts[currentTextIndex].length) {
        const typingTimeout = setTimeout(() => {
          setDisplayText((prev) => prev + texts[currentTextIndex][charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 100);
        return () => clearTimeout(typingTimeout);
      } else {
        const pauseTimeout = setTimeout(() => {
          setDisplayText('');
          setCharIndex(0);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }, 2000); // Pause before switching to the next text
        return () => clearTimeout(pauseTimeout);
      }
    }, [charIndex, currentTextIndex]);


    const [isHovered, setIsHovered] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
  
    useEffect(() => {
      if (isHovered) {
        const interval = setInterval(() => {
          setPosition({
            x: Math.sin(Date.now() / 1000) * 20,
            y: Math.cos(Date.now() / 800) * 20,
          })
        }, 1000 / 90) // 60 FPS
  
        return () => clearInterval(interval)
      }
    }, [isHovered])

  return (
    <>
      <Navbar />
      <div className='px-5 lg:pt-[10rem] pt-[7rem] text-center'>
        <div className='text-center space-y-5' data-aos="fade-up" data-aos-duration="700">
          <h2 className='lg:text-4xl text-3xl font-semibold'>{displayText} <span className="animate-blink">|</span> </h2>
          <p className='lg:text-base text-base'>Development used to be magical—an art that  inspired innovation 
            <br className='hidden lg:block'/> and transformed ideas into reality.
          </p>
          <button className='py-2.5 px-5 m-auto justify-center flex items-center gap-3 text-xs rounded-md text-black bg-white'>
            Get in touch <GoArrowRight className='text-xl'/>
          </button>
        </div>
        <div className='myDivImage lg:w-[80%] cursor-pointer w-[100%] mt-10 flex justify-center m-auto overflow-hidden'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: isHovered ? `translate(${position.x}px, ${position.y}px)` : "none",
          }}
          >
          <img src={image}
           className={`
            transition-all duration-300 ease-in-out w-full
            ${isHovered ? "scale-110 shadow-lg" : ""}
          `}  alt="" />


        </div>

        <div className='lg:px-[25rem] px-3'>
          <div className='space-y-6 text-center lg:pt-[10rem] pt-[5rem]'>
            <h2 className='text-base'>Meet some of our 100+ Customers</h2>

            <div>
              <div data-aos="fade-up" data-aos-duration="700" className='flex justify-center lg:gap-10 gap-4'>
                <img src={companyFour} alt="" className='lg:w-36 w-24 eachImage' />
                <img src={companyTwo} alt="" className='lg:w-36 w-24 eachImage' />
                <img src={companyThree} alt="" className='lg:w-36 w-24 eachImage' />
              </div>

              <div data-aos="fade-up" data-aos-duration="500" className='flex m-auto justify-center lg:gap-10 gap-4 pt-6'>
                <img src={companyOne} alt="" className='lg:w-36 w-24 eachImage' />
                <img src={companyFive} alt="" className='lg:w-36 w-24 eachImage' />
                <img src={companySix} alt="" className='lg:w-36 w-24 eachImage' />
              </div>
            </div>
          </div>

          <div className='text-center lg:pt-[10rem] pt-[5rem]'>
            <div data-aos="fade-up" data-aos-duration="500">
              <h2 className='lg:text-3xl text-3xl font-semibold'>Made for modern product teams</h2>
              <p className='text-base pt-3'>From next-gen startups to established enterprises</p>
            </div>

            <div className="text-left flex lg:flex-row flex-col gap-10 mt-10">
              <div
                data-aos="fade-up"
                data-aos-duration="700"
                className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl cursor-pointer hover:bg-neutral-950 eachImage"
              >
                <img src={productOne} alt="" className="w-full" />
                <div className="flex items-center mt-4">
                  <h3 className="text-white font-semibold text-lg">Frontend & Backend Dev</h3>
                  <p className="border-2 border-neutral-600 rounded-full p-2 cursor-pointer ml-auto text-xl">
                    <MdChevronRight />
                  </p>
                </div>
              </div>

              <div
                data-aos="fade-up"
                data-aos-duration="700"
                className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl cursor-pointer hover:bg-neutral-950 eachImage"
              >
                <img src={productTwo} alt="" className="w-full" />
                <div className="flex items-center mt-4">
                  <h3 className="text-white font-semibold text-lg">Design System</h3>
                  <p className="border-2 border-neutral-600 rounded-full p-2 cursor-pointer ml-auto text-xl">
                    <MdChevronRight />
                  </p>
                </div>
              </div>

              <div
                data-aos="fade-up"
                data-aos-duration="500"
                className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl cursor-pointer hover:bg-neutral-950 eachImage"
              >
                <img src={productThree} alt="" className="w-full" />
                <div className="flex items-center mt-4">
                  <h3 className="text-white font-semibold text-lg">Social Media Marketing</h3>
                  <p className="border-2 border-neutral-600 rounded-full p-2 cursor-pointer ml-auto text-xl">
                    <MdChevronRight />
                  </p>
                </div>
              </div>
            </div>

          </div>


          <div className='text-center lg:pt-[10rem] pt-[5rem]'>
            <div data-aos="fade-up" data-aos-duration="500">
              <h2 className='lg:text-3xl text-3xl font-semibold'>Our development services</h2>
              <p className='lg:w-[60%] w-full m-auto text-base pt-3'>
                  We provide comprehensive web development services using advanced backend 
                and frontend frameworks to deliver scalable, secure, and high-performance web solutions
              </p>
            </div>

            <div className='my-14 flex lg:flex-row flex-col lg:gap-10 gap-5 text-left border-t border-neutral-800 '>
              <div data-aos="fade-up" data-aos-duration="500" className='lg:border-r border-neutral-800 lg:px-5 py-7'>
                <h2 className='text-2xl '>Backend Development Frameworks:</h2>
                <p className='text-sm pt-3'>
                  Backend Development Frameworks:
                  We build reliable and scalable solutions using modern 
                  frameworks, ensuring high performance and data security
                </p>

                <div className='space-y-5 bg-neutral-90 border border-neutral-800 mt-8 text-[12px] lg:p-5 p-3 rounded-3xl'>
                  <p className='bg-neutral-900 eachImagea cursor-pointer hover:bg-neutral-800 transition-all ease-in-out delay-75 rounded-xl p-2'>
                    <span className='text-white flex items-center gap-2 pb-2'><RiFileList2Fill className='text-base'/> Node.js and Django</span> (kightweight, efficient for scalable apps, python-based, perfect for secure applications)
                  </p>

                  <p className='bg-neutral-900 eachImagea cursor-pointer hover:bg-neutral-800 transition-all ease-in-out delay-75 rounded-xl p-2'>
                    <span className='text-white flex items-center gap-2 pb-2 text-sm'><RiFileList2Fill className='text-base'/> Flask and Ruby on Rails</span> (python micro-framework for small to medium apps, ruby-based, focuses on rapid development)
                  </p>

                  <p className='bg-neutral-900 eachImagea cursor-pointer hover:bg-neutral-800 transition-all ease-in-out delay-75 rounded-xl p-2'>
                    <span className='text-white flex items-center gap-2 pb-2 text-sm'><RiFileList2Fill className='text-base'/> Spring Boot and Express.js</span> (Java-based, enterprise-level development, simplifies node.js for APIs and web apps)
                  </p>

                  <p className='bg-neutral-900 eachImagea cursor-pointer hover:bg-neutral-800 transition-all ease-in-out delay-75 rounded-xl p-2'>
                    <span className='text-white flex items-center gap-2 pb-2 text-sm'><RiFileList2Fill className='text-base'/> Laravel and ASP.NET</span> (PHP framework for complex backend systems, Microsoft’s framework for robust solutions)
                  </p>

                  <p className='bg-neutral-900 eachImagea cursor-pointer hover:bg-neutral-800 transition-all ease-in-out delay-75 rounded-xl p-2'>
                    <span className='text-white flex items-center gap-2 pb-2 text-sm'><RiFileList2Fill className='text-base'/> Koa.js and FastAPI</span> (lightweight and modern node.js framework, modern python framework for APIs)
                  </p>

                </div>
              </div>

              <div className='lg:pt-10' data-aos="fade-up" data-aos-duration="500">
                <h2 className='text-2xl'>Backend Development Frameworks:</h2>
                <p className='text-sm  pt-3'>
                  Backend Development Frameworks:
                  We build reliable and scalable solutions using modern 
                  frameworks, ensuring high performance and data security
                </p>

                <div className='mt-8 grid lg:grid-cols-2 grid-cols-1 gap-5 text-sm'>
                  {frontendData.map((frontdata)=>(
                    <div className='flex bg-neutral-900 hover:bg-neutral-800 eachImage rounded-xl lg:p-2 p-4 cursor-pointer'>
                      <p><TbMinusVertical className={frontdata.name !== 'Next.js' ? 'text-2xl text-white' : 'text-2xl text-[#FFD700]'}/></p>
                      <div>
                        <h2 className='text-base'>{frontdata.name}</h2>
                        <p className='text-[13px] pt-2'>{frontdata.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='lg:pt-[8rem] pt-[3rem]'>
            <div data-aos="fade-up" data-aos-duration="500">
              <h2 className='lg:text-3xl text-2xl font-semibold'>
                Comprehensive UI/UX Solutions with <br className='lg:block hidden'/> 
                Leading Design Systems
              </h2>
              <p className='lg:w-[60%] w-full m-auto text-sm pt-3'>
                We design interfaces using advanced design systems and frameworks 
                such as Material Design, Ant Design, Carbon Design System, Fluent Design 
                System, Bootstrap Studio, and Foundation by Zurb to create user-friendly, 
                stylish, and functional solutions for any project
              </p>
            </div>
            
            <div className='w-[100%] eachImage cursor-pointer mt-10' data-aos="fade-up" data-aos-duration="500">
              <img src={uidesign} alt="" className='w-full'/>
            </div>
          </div>


          <div className='lg:pt-[8rem] pt-[5rem]'>
            <div data-aos="fade-up" data-aos-duration="700">
              <h2 className='lg:text-3xl text-2xl font-semibold'>Social Media Marketing</h2>
              <p className='lg:w-[60%] w-full m-auto text-sm text-[#B4B5B5] pt-3'>
                We create creative and strategically crafted visual solutions that 
                effectively engage the audience and strengthen the brand's presence on social media
              </p>
            </div>

            <div className='grid lg:grid-cols-4 grid-cols-2 gap-6 text-left text-xs pt-10'>
              <div data-aos="fade-up" data-aos-duration="700" className='bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-base flex items-center gap-2'><MdNetworkWifi2Bar className='text-xl'/>Hootsuite</h2>
                <p className='pt-2'>Schedule and manage posts across platforms.</p>
              </div>

              <div data-aos="fade-up" data-aos-duration="700" className='bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-base flex items-center gap-2'><IoLogoBuffer className='text-xl'/>Buffer</h2>
                <p className='pt-2'>Plan, collaborate, and publish posts.</p>
              </div>

              <div data-aos="fade-up" data-aos-duration="700" className='bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-base flex items-center gap-2'><BsSuitDiamondFill className='text-xl'/>Sprout Social</h2>
                <p className='pt-2'>Plan, collaborate, and publish posts.</p>
              </div>

              <div data-aos="fade-up" data-aos-duration="700" className='bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-base flex items-center gap-2'><SiSimpleanalytics className='text-xl'/>Canva</h2>
                <p className='pt-2'>Create designs for posts and banners.</p>
              </div>

              <div data-aos="fade-up" data-aos-duration="700" className='bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-base flex items-center gap-2'><MdNetworkWifi2Bar className='text-xl'/>Loomly</h2>
                <p className='pt-2'>Content calendar and approval workflows.</p>
              </div>

              <div data-aos="fade-up" data-aos-duration="700" className='bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-base flex items-center gap-2'><MdNetworkWifi2Bar className='text-xl'/>Loomly</h2>
                <p className='pt-2'>Social media management and CRM integration. </p>
              </div>

              <div data-aos="fade-up" data-aos-duration="700" className='bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-base flex items-center gap-2'><MdNetworkWifi2Bar className='text-xl'/>Loomly</h2>
                <p className='pt-2'>Content calendar and approval workflows.</p>
              </div>

              <div data-aos="fade-up" data-aos-duration="700" className='bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-base flex items-center gap-2'><MdNetworkWifi2Bar className='text-xl'/>Loomly</h2>
                <p className='pt-2'>Content calendar and approval workflows.</p>
              </div>
            </div>
          </div>


          <div className='lg:pt-[10rem] pt-[5rem] grid lg:grid-cols-2 grid-cols-1 lg:gap-20 gap-20'>

            <div className='text-left flex flex-col gap-4' data-aos="fade-up" data-aos-duration="700">
              <div className='eachImage hover:bg-neutral-900 lg:p-5 p-3 cursor-pointer rounded-xl'>
                <h2 className='text-2xl font-semibold'>AI Bots & Scrapers</h2>
                <p className='text-sm pt-5'>
                  We develop intelligent AI bots and efficient web scrapers 
                  using advanced frameworks and tools to automate interactions and data collection
                </p>
              </div>
              <div className='w-full eachImage'>
                <img src={ai} alt="" className='w-full'/>
              </div>
            </div>
            
            <div className='text-left flex lg:flex-col flex-col-reverse gap-4' data-aos="fade-up" data-aos-duration="700">
              <div className='w-[60%] flex m-auto eachImage'>
                <img src={ai2} alt="" className='w-full'/>
              </div>
              <div className='eachImage hover:bg-neutral-900 lg:p-5 p-3 cursor-pointer rounded-xl'>
                  <h2 className='text-2xl font-semibold'>CRM Development</h2>
                  <p className='text-sm pt-5'>
                    We implement open-source CRM solutions and custom CRM development with features like lead management, 
                    marketing automation, customer support, sales dashboards, and integration with third-party tools
                  </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Home