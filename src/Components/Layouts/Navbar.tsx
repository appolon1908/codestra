import { useState } from "react"
import { Button1, Button2 } from "../components/Button"
import { Link } from "react-router-dom"
import { RiMenu3Line } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const toggleMenu = () => setIsOpen(!isOpen)
  return (
    <div className="relative justify-center flex lg:pt-10 pt-3">
        <div className="flex items-center justify-between text-xs fixed 2xl:w-[60%] xl:w-[70%] lg:w-[60%] w-[95%] rounded-lg z-50 p-2 px-5 backdrop-filter backdrop-blur-3xl bg-opacity-40 bg-[#121212] border border-[#1b1b1b]">
            <h2>Logo</h2>

            <ul className="lg:flex hidden items-center gap-10 ">
                <Link to={'/'}>
                    <li>Home</li>
                </Link>

                <Link to={'/about'}>
                    <li>About</li>
                </Link>


                <Link to={'/'}>
                    <li>Services</li>
                </Link>

                <Link to={'/'}>
                    <li>Case Studies</li>
                </Link>

                <Link to={'/contact'}>
                    <li>Contact us</li>
                </Link>
            </ul>

            <div className="flex items-center gap-5">
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

        </div>
        
        {isOpen && 
            <ul className="lg:hidden fixed rounded-lg text-lg top-20 right-0 left-0 flex m-auto p-5 flex-col gap-6 h-[80vh] w-[90%] z-30 backdrop-filter backdrop-blur-3xl bg-opacity-40 bg-[#121212] border border-[#1b1b1b]">
                    <Link to={'/'}>
                        <li>Home</li>
                    </Link>

                    <Link to={'/about'}>
                        <li>About</li>
                    </Link>


                    <Link to={'/'}>
                        <li>Services</li>
                    </Link>

                    <Link to={'/'}>
                        <li>Case Studies</li>
                    </Link>

                    <Link to={'/'}>
                        <li>Contact us</li>
                    </Link>
            </ul>
        }
    </div>
  )
}

export default Navbar