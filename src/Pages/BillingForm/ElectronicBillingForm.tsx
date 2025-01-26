
import Navbar from '../../Components/Layouts/Navbar'
import Footer from '../../Components/Layouts/Footer'
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useState } from 'react';
import { Button2, Button2b } from '../../Components/components/Button';
import useTask from '../../hooks/mutations/useTask';
import { useForm } from 'react-hook-form';
import { SuccessModal2 } from '../../Components/components/Modals';


type TaskProps = {
    address_reference:string
    visiting_hours:string
    representation_rnc:string
    name_of_representative:string
    representative_phone:string
    representative_cell_phone:string
    representative_email:string
    operation_carried_out_in_premise:string
    street_of_warehouse:string
    store_or_warehouse_number:string
    province_of_warehouse:string
    warehouse_reference:string
    local_administration:string
    warehouse_sector:string
    tax_payer_rnc:string
    name_of_tax_payer:string
    trade_name:string
    tax_payer_telephone:string
    tax_payer_cell_phone:string
    tax_payer_email:string
    tax_payer_number:string
    tax_payer_sector:string
    tax_payer_province:string
}
const ElectronicBillingForm = () => {

    const [position, setPosition] = useState(1)
    
    const handlePrevious = () => {
        if (position > 1) {
            setPosition(position - 1)
        }
    }

    const handleNext = () => {
        if (position === 1) {
            setPosition(position + 1)
        }
    }
    

    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

    const {mutate, isPending} = useTask()

    const {
        register,
        handleSubmit,
        formState: { isValid },
    } = useForm<TaskProps>({mode: 'all'})

    const onSubmit = (data:TaskProps) => {
        mutate(data, {
            onSuccess: (details) => {
                console.log('Task created successfully', details)
                setIsOpen(true)
            },
            onError: (error) => {
                console.error('Error creating task', error)
            }
        })
    }


    

  return (
    <>
        <Navbar />
        <div className='2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[6rem]'>
            <h2>Form Title</h2>
            <p className='text-sm pt-2'>Taxpayer Registration Application</p>

            <div className='py-4 border-y text-xs border-neutral-800 lg:mt-10 mt-7'>

                <form action="" onSubmit={handleSubmit(onSubmit)}>
                    {position === 1 && 
                        <div>
                            
                            <div className="flex flex-col gap-2 ">
                                <label className="text-sm text-white">Taxpayer's RNC</label>
                                <input 
                                    type="text"
                                    placeholder="Input field for RNC"
                                    className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                    {...register('tax_payer_rnc', {required: true})}
                                />
                            </div>

                            <div className='grid lg:grid-cols-2 grid-cols-2 lg:gap-6 gap-4 lg:mt-10 mt-8'>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-white">Name of Taxpayer</label>
                        
                                    <input 
                                        type="text"
                                        placeholder="Taxpayer Name"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('name_of_tax_payer', {required: true})}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-white">Trade Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Business name input field"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('trade_name', {required: true})}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-white">Taxpayer's Telephone</label>
                                    <input 
                                        type="phone"
                                        placeholder="Input field for phone number"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('tax_payer_telephone', {required: true})}
                                    />
                                </div>


                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-white">Taxpayer's Cell Phone</label>
                                    <input 
                                        type="phone"
                                        placeholder="Input field for cell phone number"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('tax_payer_cell_phone', {required: true})}
                                    />
                                </div>


                                <div className="flex flex-col gap-2 ">
                                    <label className="text-sm text-white">Taxpayer's Email</label>
                                    <input 
                                        type="email"
                                        placeholder="Email input field"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('tax_payer_email', {required: true})}
                                    />
                                </div>
                            </div>
                            
                            <div className='mt-10'>
                                <h2 className='text-neutral-400 '>Taxpayer's Address</h2>
                                
                                <div className='grid lg:grid-cols-3 grid-cols-1 gap-6 pt-5'>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-white">Address</label>
                                        <input 
                                            type="text"
                                            placeholder="Input field for number"
                                            className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                            {...register('address_reference', {required: true})}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-white">Visiting Hours</label>
                                        <input 
                                            type="number"
                                            placeholder="Input field for sector"
                                            className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                            {...register('visiting_hours', {required: true})}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-white">Province</label>
                                        <input 
                                            type="text"
                                            placeholder="Dropdown or input field for province"
                                            className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                            {...register('tax_payer_province', {required: true})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    {position === 2 && 
                        <div>
                            <h2 className='text-neutral-400 '>Legal Representative</h2>

                            <div className='grid lg:grid-cols-2 grid-cols-1 gap-6 mt-10'>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-white">Representative's RNC</label>
                        
                                    <input 
                                        type="text"
                                        placeholder="Input field for RNC"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('representation_rnc', {required: true})}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-white">Name of Representative/Applicant</label>
                                    <input 
                                        type="text"
                                        placeholder="Input field for name"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('name_of_representative', {required: true})}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-white">Representative Phone</label>
                                    <input 
                                        type="phone"
                                        placeholder="Input field for phone number"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('representative_phone', {required: true})}
                                    />
                                </div>


                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-white">Representative's cell phone</label>
                                    <input 
                                        type="phone"
                                        placeholder="Input field for cell phone number"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('representative_cell_phone', {required: true})}
                                    />
                                </div>


                                <div className="flex flex-col gap-2 ">
                                    <label className="text-sm text-white">Representative's Email</label>
                                    <input 
                                        type="email"
                                        placeholder="Email input field"
                                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                        {...register('representative_email', {required: true})}
                                    />
                                </div>
                            </div>
                            
                            <div className='mt-10'>

                                <div className="flex flex-col gap-2 ">
                                    <label className="text-sm text-white">Carry out operations in a premises or warehouse at another address</label>
                                    <div className='relative'>
                                        <select
                                        //  className="border-2 border-neutral-400 lg:w-[50%] w-full rounded-lg p-3 text-white bg-[#18181a]"
                                        className="appearance-none bg-[#18181a] outline-none focus:border-2 focus:border-gray-600 w-full text-white p-3 rounded-md cursor-pointer"
                                            defaultValue=""
                                        {...register('operation_carried_out_in_premise', {required: true})}
                                        >
                                            <option value="" disabled>Drop-down with Yes/No options</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                            
                                        </select>
                                        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                

                                <div className='mt-10'>
                                    <h2>Store or Warehouse Data (If Applicable)</h2>
                                    <div className='grid lg:grid-cols-3 grid-cols-2 gap-6 pt-5'>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white">Street of the Local or Warehouse</label>
                                            <input 
                                                type="number"
                                                placeholder="Street input field"
                                                className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                                {...register('street_of_warehouse', {required: true})}

                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white">Store or Warehouse Number</label>
                                            <input 
                                                type="text"
                                                placeholder="Input field for number"
                                                className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                                {...register('store_or_warehouse_number', {required: true})}

                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white">Local or Warehouse Sector</label>
                                            <input 
                                                type="text"
                                                placeholder="Input field for sector"
                                                className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                                {...register('warehouse_sector', {required: true})}

                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white">Province of the Local or Warehouse</label>
                                            <input 
                                                type="text"
                                                placeholder="Dropdown or input field for province"
                                                className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                                {...register('province_of_warehouse', {required: true})}

                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white">Local or Warehouse Reference</label>
                                            <input 
                                                type="text"
                                                placeholder="Input field for address reference"
                                                className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                                {...register('warehouse_reference', {required: true})}

                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white">Local Administration</label>
                                            <input 
                                                type="text"
                                                placeholder="Input field for administration related details"
                                                className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                                                {...register('local_administration', {required: true})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <div className='flex ml-auto gap-4 justify-start mt-10'>

                        {position === 1 ? 
                            <p className='text-xs p-6 py-2.5 rounded-lg bg-white text-black cursor-pointer' onClick={handleNext}>Next</p>
                        :
                            <div>
                                {!isValid ? 
                                    <div className='flex gap-4'>
                                        <p className='text-xs p-6 py-2.5 rounded-lg bg-white text-black cursor-pointer' onClick={handlePrevious}>Back</p>
                                        <Button2 text='Submit Data'/>
                                    </div>
                                    :
                                    <div className='flex gap-4'>
                                        <p className='text-xs p-6 py-2.5 rounded-lg bg-white text-black cursor-pointer' onClick={handlePrevious}>Back</p>
                                        <Button2b text='Submit Data' isPending={isPending}/>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                </form>
            </div>

            <div className='mt-10'>
                <div className='flex justify-center text-sm gap-10 items-center m-auto'>
                    <p onClick={handlePrevious} className={`${position === 1 && 'bg-neutral-800'} flex justify-center p-2.5 cursor-pointer rounded-full items-center border border-neutral-700`}><HiChevronLeft className='text-xl'/></p>
                    <p onClick={handlePrevious} className='cursor-pointer'>1</p>
                    <p onClick={handleNext} className='cursor-pointer'>2</p> 
                    <p onClick={handleNext} className={`${position === 2 && 'bg-neutral-800'} flex justify-center p-2.5 cursor-pointer rounded-full items-center border border-neutral-700`}><HiChevronRight className='text-xl'/></p>
                </div>
            </div>
        </div>

        {isOpen &&
            <SuccessModal2 isOpen={isOpen} openModal={openModal} closeModal={closeModal}/>
        }
        <Footer />
    </>
  )
}

export default ElectronicBillingForm