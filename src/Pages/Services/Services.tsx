import {Button2 } from "@/Components/components/Button"
import Footer from "@/Components/Layouts/Footer"
import Navbar from "@/Components/Layouts/Navbar"

const Services = () => {
  return (
    <div>
        <Navbar />
        <div>
            <div className='myBg2 2xl:px-[25rem] lg:!h-[65vh] !h-[45vh] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[11rem] pt-[8rem]'>
                <div className="2xl:w-[60%] xl:w-[70%] lg:w-[80%] w-full font-semibold space-y-6">
                    <h2 className="2xl:text-4xl xl:text-3xl lg:text-3xl text-xl lg:pb-5 pb-0 !leading-normal">Empower Your Workflow with Smarter AI Agents, Automate, Optimize, Achieve</h2>
                    <p className="lg:text-lg text-sm">Smart AI agents designed to automate tasks, optimize workflows, and save you time</p>
                    <Button2 text="Lets Build Together"/>
                </div>
                
            </div>

            <div className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5">
                <h2 className="text-2xl pb-3">Unlock the Power of AI Automation Agents for Your Business</h2>

                <p>
                    At Codestra, we specialize in AI automation agents designed to revolutionize the way your business operates. 
                    With AI-powered solutions, we help you automate routine tasks, streamline workflows, and boost efficiency—ultimately 
                    saving time and reducing costs. Our intelligent agents learn from every interaction, providing smarter solutions to 
                    help your business thrive in a competitive landscape.</p>
            </div>
        </div>
        <Footer />
    </div>
  )
}

export default Services