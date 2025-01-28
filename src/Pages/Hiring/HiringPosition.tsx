import Footer from "@/Components/Layouts/Footer"
import Navbar from "@/Components/Layouts/Navbar"

const HiringPosition = () => {
  return (
    <>
        <Navbar />
        <div>
            <h2>We are hiring</h2>
            <p>Join over professional team</p>

            <div>
                <div className='bg-[#151517]'>
                    <h2>Python Developer</h2>
                    <ul>
                        <li>2-3 years of experience</li>
                        <li>experience with Django, Flask, or FastAPI</li>
                        <li>hands-on experience with SQL and NoSQL databases</li>
                        <li>Understanding of OOP and SOLID principles</li>
                        <li>confident use of Git for collaborative development.</li>
                    </ul>
                </div>
            </div>
        </div>
        <Footer />
    </>
  )
}

export default HiringPosition