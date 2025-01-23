import React from 'react'
import Navbar from '../../Components/Layouts/Navbar'
import Footer from '../../Components/Layouts/Footer'
import { Button2 } from '../../Components/components/Button'

const ElectronicBilling = () => {
  return (
    <div>
        <Navbar />
        <div className=''>
            <div className='myBg lg:px-[25rem] px-3 pt-[10rem] flex gap-[7rem]'>
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
            </div>
        </div>
        <Footer />
    </div>
  )
}

export default ElectronicBilling