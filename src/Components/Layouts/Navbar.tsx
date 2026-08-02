import { useState } from "react"
import { Button1, Button2 } from "../components/Button"
import { Link, useNavigate } from "react-router-dom"
import { clearAccessToken, hasUsableAccessToken } from "@/lib/auth"
import { RiMenu3Line } from "react-icons/ri";
import { IoIosArrowUp, IoMdClose } from "react-icons/io";
import logo from '../../assets/logo.png'
// import useLogo from "../../hooks/queries/useLogo";
import { IoIosArrowDown } from "react-icons/io";
import { FaBrain } from "react-icons/fa";
import { TbMessage2Filled } from "react-icons/tb";
import { TbBrandCake } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { IoLogoAppleAr } from "react-icons/io5";
import { LiaReact } from "react-icons/lia";
import { IoLogoPython } from "react-icons/io5";
import { TbBrandSocketIo } from "react-icons/tb";






const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const toggleMenu = () => setIsOpen(!isOpen)

    const navigate = useNavigate()
    const isAuthenticated = hasUsableAccessToken()
    const handleLogout = () =>{
        clearAccessToken()
        navigate('/', { replace: true })
    }


    const [showServices, setShowServices] = useState(false)
    const [showServices2, setShowServices2] = useState(false)

    // const {data, isLoading} = useLogo()

    // const logoData = data

    

  return (
    <div className="relative justify-center flex lg:pt-10 pt-3">
        <div className="flex items-center justify-between text-xs fixed 2xl:w-[60%] xl:w-[80%] lg:w-[80%] w-[95%] rounded-lg z-50 p-2 px-5 backdrop-filter backdrop-blur-3xl bg-opacity-40 bg-[#121212] border border-[#1b1b1b]">
            
            <div className="lg:w-32 w-20">
                <img src={logo} alt="" />
            </div>

            <ul className="lg:flex hidden items-center gap-7 ">
                <Link to={'/'}>
                    <li>Home</li>
                </Link>

                <Link to={'/about'}>
                    <li>About</li>
                </Link>  

                <div className="relative">
                    <button type="button" aria-expanded={showServices} className="flex items-center gap-2" onClick={()=>setShowServices(!showServices)}>Services
                        {showServices === false ? <IoIosArrowDown /> : <IoIosArrowUp />}</button>
                    {showServices && 
                        <ul className="absolute bg-neutral-900 border border-neutral-800 top-10 p-3 rounded-lg w-[15rem] space-y-1">
                            <Link to={'/services'}>
                                <li className="cursor-pointer hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-3 flex items-center gap-2"><FaBrain />AI Automation</li>
                            </Link>

                            <Link to='/contact/sales'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-3 flex items-center gap-2"><TbMessage2Filled />Consultation</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-3 flex items-center gap-2"><TbBrandCake />Brand Development</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-3 flex items-center gap-2"><IoLogoBuffer />Logo Development</li></Link>
                            <Link to='/about'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-3 flex items-center gap-2"><IoLogoAppleAr />Codestra SRL</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-3 flex items-center gap-2"><LiaReact />React JS</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-3 flex items-center gap-2"><IoLogoPython />Python</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-3 flex items-center gap-2"><TbBrandSocketIo />Real Time Data Sync</li></Link>
                        </ul>
                    }
                </div>

                <Link to={'/case-studies'}>
                    <li>Case Studies</li>
                </Link>

                <Link to={'/contact'}>
                    <li>Contact us</li>
                </Link>

                <Link to={'/'}>
                    <li>Join The Team</li>
                </Link> 
            </ul>
            
            {isAuthenticated ? 

                <div className="flex items-center gap-3">
                    <Link to={'/auth/dashboard'}>
                        <Button1 text="Dashboard" />
                    </Link> 

                    <Button2 text="Log out" onClick={handleLogout}/>

                    <div onClick={toggleMenu} className="text-lg lg:hidden block">
                        {!isOpen ? 
                            <p><RiMenu3Line /></p> :
                            <p><IoMdClose /></p> 
                        }
                    </div>
                </div>
                : 

                <div className="flex items-center gap-3">
                    <Link to={'/login'}>
                        <Button1 text="Log in" />
                    </Link>

                    <Link to={'/signup'}>
                        <Button2 text="Sign up" />
                    </Link>
                    <div onClick={toggleMenu} className="text-lg lg:hidden block">
                        {!isOpen ? 
                            <p><RiMenu3Line /></p> :
                            <p><IoMdClose /></p> 
                        }
                    </div>
                </div>
            }

        </div>
        
        {isOpen && 
            <ul className="lg:hidden fixed rounded-lg text-lg top-20 right-0 left-0 flex m-auto p-5 flex-col gap-12 h-[80vh] w-[90%] z-30 backdrop-filter backdrop-blur-3xl bg-opacity-40 bg-[#121212] border border-[#1b1b1b]">
                    <Link to={'/'}>
                        <li>Home</li>
                    </Link>

                    <Link to={'/about'}>
                        <li>About</li>
                    </Link>


                    {/* <Link to={'/services'}>
                        <li>Services</li>
                    </Link> */}

                    <div className="relative">
                    <button type="button" aria-expanded={showServices2} className="flex items-center gap-2" onClick={()=>setShowServices2(!showServices2)}>Services
                        {showServices2 === false ? <IoIosArrowDown /> : <IoIosArrowUp />}</button>
                    {showServices2 && 
                        <ul className="absolute bg-neutral-900 border backdrop-blur-3xl bg-opacity-100 text-sm border-neutral-800 top-10 p-5 rounded-lg w-full space-y-1">
                            <Link to={'/services'}>
                                <li className="cursor-pointer hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-6 flex items-center gap-2"><FaBrain />AI Automation</li>
                            </Link>

                            <Link to='/contact/sales'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-6 flex items-center gap-2"><TbMessage2Filled />Consultation</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-6 flex items-center gap-2"><TbBrandCake />Brand Development</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-6 flex items-center gap-2"><IoLogoBuffer />Logo Development</li></Link>
                            <Link to='/about'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-6 flex items-center gap-2"><IoLogoAppleAr />Codestra SRL</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-6 flex items-center gap-2"><LiaReact />React JS</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-6 flex items-center gap-2"><IoLogoPython />Python</li></Link>
                            <Link to='/services'><li className="hover:bg-[#FFD700] hover:text-black rounded-full p-3 px-6 flex items-center gap-2"><TbBrandSocketIo />Real Time Data Sync</li></Link>
                        </ul>
                    }
                </div>

                    <Link to={'/case-studies'}>
                        <li>Case Studies</li>
                    </Link>

                    <Link to={'/contact'}>
                        <li>Contact us</li>
                    </Link>
            </ul>
        }
    </div>
  )
}

export default Navbar
