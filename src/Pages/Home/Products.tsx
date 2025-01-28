
import useTestimonials from '../../hooks/queries/useTestimonials'
import work from '../../assets/works (1).png'
import worka from '../../assets/works (2).png'
import workb from '../../assets/works (3).png'
import workc from '../../assets/works (4).png'

import { FaStar } from "react-icons/fa";


import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../Components/ui/carousel"


export const Products = () => {
  return (
    <Carousel
      opts={{
        align: "center",
      }}
      className="w-full"
    >
      <CarouselContent>
          <CarouselItem  className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 rounded-xl">
              <div className='rounded-xl'>
                <div className='w-full lg:h-[18rem] bg-neutral-900 border border-neutral-800 p-3 rounded-2xl'>
                  <img src={worka} alt="" className='rounded-2xl w-full h-full object-cover'/>
                </div>
              </div>
              <div className='pt-3 text-xs text-left bg-neutral-900 p-3 rounded-xl mt-4 border border-neutral-800'>
                  <h2 className='text-base pb-3'>Web Design</h2>
                  <p className=''>We craft scalable iOS and Android applications optimized for high performance.</p>
                </div>
            </div>
          </CarouselItem>

          <CarouselItem  className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 rounded-xl">
              <div className='rounded-xl'>
                <div className='w-full lg:h-[18rem] bg-neutral-900 border border-neutral-800 p-3 rounded-2xl'>
                  <img src={workb} alt="" className='rounded-2xl w-full h-full object-cover'/>
                </div>
              </div>
              <div className='pt-3 text-xs text-left bg-neutral-900 p-3 rounded-xl mt-4 border border-neutral-800'>
                  <h2 className='text-base pb-3'>Custom Development</h2>
                  <p className=''>Our functional web solutions cover a diverse spectrum of needs in various niches.</p>
                </div>
            </div>
          </CarouselItem>


          <CarouselItem  className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 rounded-xl">
              <div className='rounded-xl'>
                <div className='w-full lg:h-[18rem] bg-neutral-900 border border-neutral-800 p-3 rounded-2xl'>
                  <img src={workc} alt="" className='rounded-2xl w-full h-full object-cover'/>
                </div>
              </div>
              <div className='pt-3 text-xs text-left bg-neutral-900 p-3 rounded-xl mt-4 border border-neutral-800'>
                  <h2 className='text-base pb-3'>Fintech Solutions</h2>
                  <p className=''>Our functional web solutions cover a diverse spectrum of needs in various niches.</p>
                </div>
            </div>
          </CarouselItem>


          <CarouselItem  className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 rounded-xl">
              <div className='rounded-xl'>
                <div className='w-full lg:h-[18rem] bg-neutral-900 border border-neutral-800 p-3 rounded-2xl'>
                  <img src={work} alt="" className='rounded-2xl w-full h-full object-cover'/>
                </div>
              </div>
              <div className='pt-3 text-xs text-left bg-neutral-900 p-3 rounded-xl mt-4 border border-neutral-800'>
                  <h2 className='text-base pb-3'>Trading Platform Development</h2>
                  <p className=''>We build custom software solutions of any complexity for startups and enterprises.</p>
                </div>
            </div>
          </CarouselItem>

      </CarouselContent>
      <CarouselPrevious className='bg-neutral-50 text-black'/>
      <CarouselNext className='bg-neutral-50 text-black'/>
    </Carousel>
  )
}



interface TestimonialsProps {
  full_name: string;
  image: string;
  message: string;
  rating: string;
  role: string;

}
export const Testimonies = () => {

  const {data} = useTestimonials()
  const myTestimonials = data?.data as TestimonialsProps[] || []
  console.log('This is console', myTestimonials);
  


  return (
    <Carousel
      opts={{
        align: "center",
      }}
      className="w-full"
    >
      <CarouselContent>
          {myTestimonials.map((myData) =>(

            <CarouselItem  className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 rounded-xl">
                <div className='w-full bg-neutral-950 border border-neutral-800 p-10 rounded-2xl'>
                  <div className='w-24 h-24 rounded-full bg-neutral-700 justify-center flex m-auto'>
                    <img src={myData.image} alt="" className='rounded-full w-full h-full object-cover'/>
                  </div>
                  <div className='text-center mt-3 space-y-4'>
                    <h2 className='text-base text-white'>{myData.full_name}</h2>
                    <p className='text-sm text-white'>
                      {Number(myData.rating) === 5 && <div className='flex gap-2 m-auto justify-center'><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>}
                      {Number(myData.rating) >= 4 && Number(myData.rating) <= 4.9 &&  <div className='flex gap-2 m-auto justify-center'><FaStar /><FaStar /><FaStar /><FaStar /></div>}
                      {Number(myData.rating) >= 3 && Number(myData.rating) <= 3.9 &&  <div className='flex gap-2 m-auto justify-center'><FaStar /><FaStar /><FaStar /></div>}
                    </p>
                    <p className='text-sm text-white'>{myData.message}</p>
                    <p className='text-sm text-white'>{myData.role}</p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevious className='bg-neutral-50 text-black'/>
      <CarouselNext className='bg-neutral-50 text-black'/>
    </Carousel>
  )
}

