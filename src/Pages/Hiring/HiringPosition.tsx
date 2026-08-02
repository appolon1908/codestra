import { Button1 } from "@/Components/components/Button";
import Footer from "@/Components/Layouts/Footer"
import Navbar from "@/Components/Layouts/Navbar"
import { IoMdCheckmarkCircle } from "react-icons/io";
import { Link } from "react-router";

const HiringPosition = () => {
  return (
    <>
        <Navbar />
        <div className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem] text-center">
            <h2 className="lg:text-3xl text-2xl pb-3">We are hiring</h2>
            <p>Join over professional team</p>

            <div className="text-left mt-10 grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-8 lg:text-sm text-xs">
                <div className='bg-[#151517] p-10 rounded-2xl border border-neutral-800'>
                    <h2 className="text-lg">Python Developer</h2>
                    <ul className="pt-4 space-y-4">
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>2-3 years of experience</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>experience with Django, Flask, or FastAPI</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>hands-on experience with SQL and NoSQL databases</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>Understanding of OOP and SOLID principles</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>confident use of Git for collaborative development.</li>
                    </ul>

                    <div className="mt-5">
                        <Link to="/contact"><Button1 text="Apply Now"/></Link>
                    </div>
                </div>

                <div className='bg-[#151517] p-10 rounded-2xl border border-neutral-800'>
                    <h2 className="text-lg">UI/UX Designer</h2>
                    <ul className="pt-4 space-y-4">
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>2-3 years of experience</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>experience with Django, Flask, or FastAPI</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>hands-on experience with SQL and NoSQL databases</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>Understanding of OOP and SOLID principles</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>confident use of Git for collaborative development.</li>
                    </ul>

                    <div className="mt-5">
                        <Link to="/contact"><Button1 text="Apply Now"/></Link>
                    </div>
                </div>


                <div className='bg-[#151517] p-10 rounded-2xl border border-neutral-800'>
                    <h2 className="text-lg">DevOps</h2>
                    <ul className="pt-4 space-y-4">
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>2-3 years of experience</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>experience with Django, Flask, or FastAPI</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>hands-on experience with SQL and NoSQL databases</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>Understanding of OOP and SOLID principles</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>confident use of Git for collaborative development.</li>
                    </ul>

                    <div className="mt-5">
                        <Link to="/contact"><Button1 text="Apply Now"/></Link>
                    </div>
                </div>


                <div className='bg-[#151517] p-10 rounded-2xl border border-neutral-800'>
                    <h2 className="text-lg">React Developer</h2>
                    <ul className="pt-4 space-y-4">
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>2-3 years of experience</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>experience with Django, Flask, or FastAPI</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>hands-on experience with SQL and NoSQL databases</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>Understanding of OOP and SOLID principles</li>
                        <li className="flex items-center gap-2"><IoMdCheckmarkCircle className="text-lg"/>confident use of Git for collaborative development.</li>
                    </ul>

                    <div className="mt-5">
                        <Link to="/contact"><Button1 text="Apply Now"/></Link>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </>
  )
}

export default HiringPosition
