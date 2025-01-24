import Navbar from '../../Components/Layouts/Navbar'
import Footer from '../../Components/Layouts/Footer'
import { Button1, Button2, Button3 } from '../../Components/components/Button'
import { RiFolderTransferLine } from "react-icons/ri";
import { BsStack } from "react-icons/bs";
import { BiMoneyWithdraw } from "react-icons/bi";
import { IoIosWallet } from "react-icons/io";
import formImage from '../../assets/form.png'
import benefitImage from '../../assets/benefit.png'
import { benefitsData, faqData } from '../../Components/MockData';
import { TbMinusVertical } from 'react-icons/tb';
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { GoPlusCircle } from "react-icons/go";
import { useState } from 'react';
import { AiOutlineMinusCircle } from 'react-icons/ai';


const ElectronicBilling = () => {

    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const handleToggle = (index: number) => {
      setOpenIndex(openIndex === index ? null : index)
    }


  return (
    <div>
        <Navbar />
        <div className='lg:px-[25rem] px-3 pt-[10rem]'>
            <div className='myBg  flex gap-[7rem]'>
                <div className='space-y-3 w-full'>
                    <h2 className='text-4xl text-[#FFD700]'>Electronic Billing</h2>
                    <p className='text-lg '>Modernize and streamline billing processes and comply with Law 32-23 of the DGII</p>
                    <Button2 text='Contact US'/>
                </div>

                <form className="space-y-6 p-8 rounded-3xl w-full bg-neutral-900 border border-neutral-800 h-fit">
                    <div className="space-y-4">

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-white">Full Name</label>
                            <input 
                                type="text"
                                placeholder="Kelvin Smith"
                                className="bg-[#262729] text-sm border-0 text-white p-3 rounded-lg"
                                required
                            />
                        </div>


                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-white">Email</label>
                            <input 
                                type="email"
                                placeholder="kelvinsmith@gmail.com"
                                className="bg-[#262729] text-sm border-0 text-white p-3 rounded-lg"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-white">Phone</label>
                            <input
                                type='phone'
                                placeholder="(000) 000 0000"
                                className="bg-[#262729] text-sm border-0 text-white p-3 rounded-lg w-full"
                                required
                            />
                        </div>

                        <div className='text-sm'>

                            <h2>Use ERP</h2>
                            <div className='flex items-center gap-3 pt-3'>
                                <div className='flex items-center gap-2'>
                                    <input type="radio" name="radio-1" className="radio w-6 h-6" defaultChecked />
                                    <p>Yes</p>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <input type="radio" name="radio-1" className="radio w-6 h-6" />
                                    <p>No</p>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 mt-5'>
                                <input type="radio" name="radio-1" className="radio w-6 h-6" defaultChecked />
                                <p>I agree to be contacted by Codestra Dominican Republic.</p>
                            </div>
                        </div>

                        <div className='flex justify-end ml-auto'>
                            <Button2 text='Send Message'/>
                        </div>
                    </div>
                </form>
            </div>

            <div className=''>
                <h2 className='text-center text-3xl'>Craftsmanship in Every Line of Code</h2>
                <div className='pt-14'>
                    <h2 className='text-[#FFD700] text-4xl pb-3'>What is Billing</h2>
                    <p>
                        In the Dominican Republic, the Electronic Invoicing Law (Law No. 32-23) 
                        offers tax incentives to <br /> encourage early adoption of electronic 
                        invoicing (e-CF) during the voluntary period
                    </p>
                </div>

                <div className='grid grid-cols-2 gap-10 mt-10 border-y border-neutral-700  text-center'>
                    <div className='text-sm border-r border-neutral-700 space-y-5 py-10'>
                        <h2 className='text-lg pb-3'>Contributor Category</h2>
                        <p>Large micro, small and medium-sized enterprises</p>
                        <p>Medium taxpayers</p>
                        <p>Small taxpayers</p>
                        <p>Micro and unclassified enterprises</p>
                    </div>

                    <div className='text-sm space-y-5 py-10'>
                        <h2 className='text-lg pb-3'>Maximum Tax Credit (DOP)</h2>
                        <p>300, 000</p>
                        <p>200, 000</p>
                        <p>75, 000</p>
                        <p>25, 000</p>
                    </div>
                </div>

                <div className='grid grid-cols-2 items-start gap-10 mt-10 '>
                    <div className='bg-gradient-to-l from-black to-neutral-900 border-2 text-sm space-y-4 border-neutral-800 p-10 rounded-3xl'>
                        <h2>
                            Use of Tax Credit  . These tax credits can 
                            be applied within the same fiscal year against:
                        </h2>
                        <p className='flex gap-2'><RiFolderTransferLine className='text-2xl'/>Operations related to the Tax on Transfers of Industrialized Goods and Services (ITBIS)</p>
                        <p className='flex gap-2'><BsStack className='text-base'/>Advance payments of income tax</p>
                        <p className='flex gap-2'><BiMoneyWithdraw className='text-lg'/>Income tax</p>
                        <p className='flex gap-2'><IoIosWallet className='text-lg'/>Asset tax</p>
                    </div>

                    <div className='relative text-xs'>
                        <div className='bg-neutral-900 border-2 space-y-4 border-neutral-800 p-5 rounded-3xl'>
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

                        <div className='bg-neutral-900 absolute z-20 left-14 top-[120px] bg-opacity-80  border-2 space-y-4 border-neutral-800 p-5 rounded-3xl'>
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

                <div className='flex relative justify-center m-auto'>
                    <div className='w-full'>
                        <img src={formImage} alt="" className='w-full'/>
                    </div>

                    <div className='absolute bottom-24 bg-neutral-900 rounded-3xl p-5 bg-opacity-90 border-2 border-neutral-900'>
                        <div className='border-2 border-neutral-800 rounded-2xl border-dashed p-5'>
                            <h2>Bring out the Electronic Billing form</h2>
                            <div className='flex items-center gap-3 pt-3 m-auto justify-center'>
                                <Button1 text='Form'/>
                                <Button2 text='Form2'/>
                            </div>
                        </div>
                    </div>
                </div>


                <div className='lg:pt-[10rem] pt-[5rem]'>
                    <h2 className='text-3xl text-[#FFD700]'>Benefits</h2>

                    <div className='grid grid-cols-2 gap-10 mt-8'>
                        <div className='grid lg:grid-cols-2 grid-cols-1 gap-5 text-sm'>
                            {benefitsData.map((frontdata)=>(
                            <div className='flex bg-neutral-900 hover:bg-neutral-800 eachImage rounded-xl lg:p-2 p-4 cursor-pointer'>
                                <p><TbMinusVertical className={frontdata.id !== 1 ? 'text-2xl text-white' : 'text-2xl text-[#FFD700]'}/></p>
                                <div>
                                <h2 className='text-sm'>{frontdata.name}</h2>
                                <p className='text-[13px] pt-2'>{frontdata.description}</p>
                                </div>
                            </div>
                            ))}
                        </div>

                        <div className='w-full'>
                            <img src={benefitImage} alt="" className='w-full'/>
                        </div>
                    </div>
                </div>

                <div className='lg:pt-[10rem] pt-[5rem]'>
                    <h2 className='text-3xl text-[#FFD700]'>Plans and Prices</h2>
                    <p>* Prices exempt from ITBIS</p>

                    <div className='grid grid-cols-2 px-0 gap-10 mt-10 text-sm'>
                        <div className='bg-neutral-900 border-2 border-neutral-800  rounded-3xl'>
                            <div className=''>
                                <h2 className='text-xl px-10 py-10  border-b border-neutral-800'>For ERP Business Management</h2>
                                <p className='border-b px-10 py-10  border-neutral-800'>RD13,800 - Implementation</p>
                            </div>
                            <ul className='space-y-6 p-10'>
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

                        <div className='bg-neutral-900 border-2 border-neutral-800  rounded-3xl'>
                            <div className=''>
                                <h2 className='text-xl p-10  border-b border-neutral-800'>For standalone ERPs</h2>
                                <p className='border-b p-10  border-neutral-800'>RD68,500 - Implementation</p>
                            </div>
                            <ul className='space-y-6 p-10'>
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
                        <h2 className='text-3xl text-[#FFD700]'>Frequently Asked Questions</h2>
                        <p>We are here to help you </p>

                        {/* <div className='grid grid-cols-4 gap-4 mt-10'>
                            {faqData.map((faq, index)=>(
                                <div key={index} onClick={()=>handleSelectFAQ(faq.answer)} className='bg-neutral-900 p-6 rounded-xl border border-neutral-800 cursor-pointer'>
                                    <div className='flex text-sm gap-4'>
                                        <h2>{faq.question}</h2>
                                        <GoPlusCircle className='ml-auto text-3xl'/>
                                    </div>
                                </div>
                            ))}
                        </div> */}

                        <div className="flex flex-col gap-4 mt-10">
                            {faqData.map((faq, index) => (
                                <>
                                    <div key={index} className="bg-[#151517] rounded-xl border border-[#262629] overflow-hidden">
                                        <div onClick={() => handleToggle(index)} className="p-6 cursor-pointer">
                                            <div className="flex items-center text-sm gap-4">
                                            <h2 className="flex-grow">{faq.question}</h2>
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
                                            <p className="p-6 pt-0 text-sm text-neutral-400">{faq.answer}</p>
                                        </div>
                                    </div>

                            </>
                        ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <Footer />
    </div>
  )
}

export default ElectronicBilling