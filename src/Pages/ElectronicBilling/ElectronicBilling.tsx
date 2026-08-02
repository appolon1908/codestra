import Navbar from '../../Components/Layouts/Navbar'
import Footer from '../../Components/Layouts/Footer'
import { Button2, Button3 } from '../../Components/components/Button'
import { RiFolderTransferLine } from "react-icons/ri";
import { BsStack } from "react-icons/bs";
import { BiMoneyWithdraw } from "react-icons/bi";
import { IoIosWallet } from "react-icons/io";
import formImage from '../../assets/form.png'
import benefitImage from '../../assets/benefit.png'
import { benefitsData } from '../../Components/MockData';
import { TbMinusVertical } from 'react-icons/tb';
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { GoPlusCircle } from "react-icons/go";
import { useState } from 'react';
import { AiOutlineMinusCircle } from 'react-icons/ai';
import useFAQ from '../../hooks/queries/useFAQ';
import Loading from '../../Components/components/Loading';


interface FAQ{
    question: string;
    answer: string;
}
const ElectronicBilling = () => {

    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const handleToggle = (index: number) => {
      setOpenIndex(openIndex === index ? null : index)
    }


    const {data, isLoading} = useFAQ()
    const faqData = data?.data as FAQ[] || []

  return (
    <div>
        <Navbar />
        <div className='2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem]'>
            <div className='myBg lg:h-[80vh] h-[100vh] flex lg:flex-row flex-col 2xl:gap-[5rem] xl:gap-[5rem] lg:gap-[4rem] gap-6'>
                <div className='space-y-3 w-full' data-aos="fade-up" data-aos-duration="500">
                    <h2 className='text-3xl text-[#FFD700]'>Electronic Billing</h2>
                    <p className='text-base '>Modernize and streamline billing processes and comply with Law 32-23 of the DGII</p>
                    <Button2 text='Contact US'/>
                </div>

                <form data-aos="fade-up" data-aos-duration="500" className="space-y-6 p-5 rounded-3xl w-full bg-neutral-900 border border-neutral-800 h-fit">
                    <div className="space-y-4">

                        <div className="flex flex-col gap-2">
                            <label className="lg:text-sm text-xs text-white">Full Name</label>
                            <input 
                                type="text"
                                placeholder="Kelvin Smith"
                                className="bg-[#262729] 2xl:text-xs xl:text-xs lg:text-xs text-xs border-0 text-white p-3 rounded-lg"
                                required
                            />
                        </div>


                        <div className="flex flex-col gap-2">
                            <label className="lg:lg:text-sm text-xs text-white">Email</label>
                            <input 
                                type="email"
                                placeholder="kelvinsmith@gmail.com"
                                className="bg-[#262729] 2xl:text-xs xl:text-xs lg:text-xs text-xs border-0 text-white p-3 rounded-lg"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="lg:text-sm text-xs text-white">Phone</label>
                            <input
                                type='phone'
                                placeholder="(000) 000 0000"
                                className="bg-[#262729] 2xl:text-xs xl:text-xs lg:text-xs text-xs border-0 text-white p-3 rounded-lg w-full"
                                required
                            />
                        </div>

                        <div className='lg:text-sm text-xs'>

                            <h2>Use ERP</h2>
                            <div className='flex items-center gap-3 pt-3'>
                                <div className='flex items-center gap-2'>
                                    <input type="radio" name="radio-1" className="radio w-5 h-5" defaultChecked />
                                    <p>Yes</p>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <input type="radio" name="radio-1" className="radio w-5 h-5" />
                                    <p>No</p>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 mt-5'>
                                <input type="radio" name="radio-1" className="radio w-5 h-5" defaultChecked />
                                <p>I agree to be contacted by Codestra Dominican Republic.</p>
                            </div>
                        </div>

                        <div className='flex lg:justify-end lg:ml-auto'>
                            <Button2 text='Send Message'/>
                        </div>
                    </div>
                </form>
            </div>

            <div className='lg:pt-0 pt-[8rem] text-sm'>
                <h2 className='text-center text-2xl '>Craftsmanship in Every Line of Code</h2>
                <div className='pt-14' data-aos="fade-up" data-aos-duration="500">
                    <h2 className='text-[#FFD700] lg:text-3xl text-2xl pb-3'>What is Billing</h2>
                    <p>
                        In the Dominican Republic, the Electronic Invoicing Law (Law No. 32-23) 
                        offers tax incentives to <br /> encourage early adoption of electronic 
                        invoicing (e-CF) during the voluntary period
                    </p>
                </div>

                <div className='grid lg:grid-cols-2 grid-cols-1 lg:gap-10  mt-10 border-y border-neutral-700  text-center'>
                    <div data-aos="fade-up" data-aos-duration="500" className='lg:text-sm text-xs lg:border-r border-neutral-700 space-y-5 py-10'>
                        <h2 className='text-lg pb-3'>Contributor Category</h2>
                        <p>Large micro, small and medium-sized enterprises</p>
                        <p>Medium taxpayers</p>
                        <p>Small taxpayers</p>
                        <p>Micro and unclassified enterprises</p>
                    </div>

                    <div data-aos="fade-up" data-aos-duration="500" className='lg:text-sm text-xs space-y-5 lg:border-none border-t border-neutral-700 py-10'>
                        <h2 className='text-lg pb-3'>Maximum Tax Credit (DOP)</h2>
                        <p>300, 000</p>
                        <p>200, 000</p>
                        <p>75, 000</p>
                        <p>25, 000</p>
                    </div>
                </div>

                <div className='grid lg:grid-cols-2 grid-cols-1 items-start gap-10 mt-10 '>
                    <div className='bg-gradient-to-l from-black to-neutral-900 border-2 lg:text-sm text-xs space-y-4 border-neutral-800 lg:p-10 p-5 rounded-3xl'>
                        <h2>
                            Use of Tax Credit  . These tax credits can 
                            be applied within the same fiscal year against:
                        </h2>
                        <p className='flex gap-2'><RiFolderTransferLine className='text-2xl'/>Operations related to the Tax on Transfers of Industrialized Goods and Services (ITBIS)</p>
                        <p className='flex gap-2'><BsStack className='text-base'/>Advance payments of income tax</p>
                        <p className='flex gap-2'><BiMoneyWithdraw className='text-lg'/>Income tax</p>
                        <p className='flex gap-2'><IoIosWallet className='text-lg'/>Asset tax</p>
                    </div>

                    <div className='lg:relative text-xs'>
                        <div data-aos="fade-up" data-aos-duration="500" className='bg-neutral-900 border-2 space-y-4 border-neutral-800 p-5 rounded-3xl'>
                            <h2 className='text-lg'>
                                Requeirements
                            </h2>
                            <p>
                                Additionally, suppliers of goods or services that 
                                invoice the Dominican government using an electronic 
                                fiscal invoice (e-CF) will be exempt from the 5% tax 
                                withholding on payments received.
                            </p>
                        </div>

                        <div data-aos="fade-up" data-aos-duration="500" className='bg-neutral-900 lg:absolute z-20 lg:mt-0 mt-5 left-14 top-[120px] lg:bg-opacity-80  border-2 space-y-4 border-neutral-800 p-5 rounded-3xl'>
                            <h2 className='text-lg'>
                                Requeirements
                            </h2>
                            <p className=''>
                                Additionally, suppliers of goods or services that 
                                invoice the Dominican government using an electronic 
                                fiscal invoice (e-CF) will be exempt from the 5% tax 
                                withholding on payments received.
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flex relative justify-center m-auto lg:mt-0 mt-[5rem]'> 
                    <div className='w-full'>
                        <img src={formImage} alt="" className='w-full'/>
                    </div>

                    <div data-aos="fade-up" data-aos-duration="500" className='absolute bottom-0 bg-neutral-900 rounded-3xl lg:p-5 p-3 bg-opacity-90 border-2 border-neutral-900'>
                        <div className='border-2 border-neutral-800 rounded-2xl border-dashed lg:p-5 p-3'>
                            <h2 className='lg:text-sm text-xs'>Bring out the Electronic Billing form</h2>
                            <div className='flex items-center gap-3 pt-3 m-auto justify-center'>
                                <Link to={'/electronic-billing/form'}>
                                    <Button2 text='Billing Form'/>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>


                <div className='lg:pt-[10rem] pt-[5rem]'>
                    <h2 className='lg:text-3xl text-2xl text-[#FFD700]'>Benefits</h2>

                    <div className='grid lg:grid-cols-2 grid-cols-1 lg:gap-10 gap-5 lg:mt-8 mt-5'>
                        <div data-aos="fade-up" data-aos-duration="700" className='grid lg:grid-cols-2 grid-cols-1 gap-5 lg:text-sm text-xs'>
                            {benefitsData.map((frontdata)=>(
                            <div className='flex bg-neutral-900 hover:bg-neutral-800 eachImage rounded-xl lg:p-2 p-4 cursor-pointer'>
                                <p><TbMinusVertical className={frontdata.id !== 1 ? 'text-2xl text-white' : 'text-2xl text-[#FFD700]'}/></p>
                                <div>
                                <h2 className='lg:text-sm text-xs'>{frontdata.name}</h2>
                                <p className='text-[13px] pt-2'>{frontdata.description}</p>
                                </div>
                            </div>
                            ))}
                        </div>

                        <div data-aos="fade-up" data-aos-duration="500" className='w-full'>
                            <img src={benefitImage} alt="" className='w-full'/>
                        </div>
                    </div>
                </div>

                <div className='lg:pt-[10rem] pt-[5rem]'>
                    <h2 className='lg:text-3xl text-2xl pb-3 text-[#FFD700]'>Plans and Prices</h2>
                    <p>* Prices exempt from ITBIS</p>

                    <div className='grid lg:grid-cols-2 grid-cols-1 px-0 lg:gap-10 gap-5 lg:mt-10 mt-5 lg:text-sm text-xs'>
                        <div data-aos="fade-up" data-aos-duration="500" className='bg-neutral-900 border-2 border-neutral-800  rounded-3xl'>
                            <div className=''>
                                <h2 className='xl:text-xl text-lg lg:p-10 p-5  border-b border-neutral-800'>For ERP Business Management</h2>
                                <p className='border-b lg:p-10 p-5  border-neutral-800'>RD13,800 - Implementation</p>
                            </div>
                            <ul className='space-y-6 lg:p-10 p-5'>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>Up to 1,000 transactions RD$210</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 1,001 to 5,000 transactions RD$545</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 5,001 to 10,000 transactions RD$915</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 10,001 to 25,000 transactions RD$1,840</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 25,001 to 50,000 transactions RD$2,775</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 50,001 to 100,000 transactions RD$3,860</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 50,001 to 100,000 transactions RD$3,860</li>
                            </ul>

                            <div className='p-10 pt-0'>
                                <Button3 text='Request'/>
                            </div>
                        </div>

                        <div data-aos="fade-up" data-aos-duration="500" className='bg-neutral-900 border-2 border-neutral-800  rounded-3xl'>
                            <div className=''>
                                <h2 className='xl:text-xl text-lg lg:p-10  p-5 border-b border-neutral-800'>For standalone ERPs</h2>
                                <p className='border-b lg:p-10  p-5 border-neutral-800'>RD68,500 - Implementation</p>
                            </div>
                            <ul className='space-y-6 lg:p-10 p-5'>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>Up to 1,000 transactions RD$830</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 1,001 to 5,000 transactions RD$2,180</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 5,001 to 10,000 transactions RD$3,650</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 10,001 to 25,000 transactions RD$7,350</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 25,001 to 50,000 transactions RD$11,100</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 50,001 to 100,000 transactions RD$15,425</li>
                                <li className='flex gap-2'><IoCheckmarkCircleSharp className='text-lg'/>From 50,001 to 100,000 transactions RD$3,860</li>
                            </ul>

                            <div className='p-10 pt-0'>
                                <Button3 text='Request'/>
                            </div>
                        </div>

                    </div>

                    <div className='flex flex-col text-center pt-10 justify-center m-auto '>
                        <h2>Learn more details about Claro Cloud Electronic Billing</h2>

                        <div className='flex m-auto mt-4'>
                            <Link to={'/contact'}>
                                <Button2 text='Contact Us'/>
                            </Link>
                        </div>
                    </div>

                    <div className='mt-10'>
                        <h2 className='lg:text-3xl text-2xl pb-3 text-[#FFD700]'>Frequently Asked Questions</h2>
                        <p>We are here to help you </p>
                        
                        {isLoading ? 
                        <Loading /> :
                        
                        <div  className="flex flex-col gap-4 lg:mt-10 mt-5">
                            {faqData?.map((faq, index) => (
                                <>
                                    <div data-aos="fade-up" data-aos-duration="500" key={index} className="bg-[#151517] rounded-xl border border-[#262629] overflow-hidden">
                                        <div onClick={() => handleToggle(index)} className="p-6 cursor-pointer">
                                            <div className="flex items-center lg:text-sm text-xs gap-4">
                                            <h2 className="flex-grow">{faq?.question}</h2>
                                            {openIndex === index ? (
                                                <AiOutlineMinusCircle className="text-xl flex-shrink-0" />
                                            ) : (
                                                <GoPlusCircle className="text-xl flex-shrink-0" />
                                            )}
                                            </div>
                                        </div>
                                    
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            openIndex === index ? "max-h-40" : "max-h-0"
                                            }`}
                                        >
                                            <p className="p-6 pt-0 lg:text-sm text-xs text-neutral-400">{faq?.answer}</p>
                                        </div>
                                    </div>
                                </>
                            ))}
                        </div>
                        }
                    </div>
                </div>

            </div>
        </div>
        <Footer />
    </div>
  )
}

export default ElectronicBilling
