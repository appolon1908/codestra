// import React, { useRef, useState } from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';

// // Import Swiper styles
// import 'swiper/css';
// import 'swiper/css/pagination';
// import { Pagination } from 'swiper/modules';

import work from '../../assets/works (1).png'
import worka from '../../assets/works (2).png'
import workb from '../../assets/works (3).png'
import workc from '../../assets/works (4).png'

// const Products = () => {
//   return (
//     <div>
//         <Swiper
//         slidesPerView={3}
//         spaceBetween={30}
//         pagination={{
//           clickable: true,
//         }}
//         modules={[Pagination]}
//         className="mySwiper"
//       >
//         <SwiperSlide>
//           <div>
//             <div className='w-full'>
//               <img src={work} alt="" className='w-full'/>
//             </div>
//           </div>
//         </SwiperSlide>

//         <SwiperSlide>
//           <div>
//             <div className='w-full'>
//               <img src={worka} alt="" className='w-full'/>
//             </div>
//           </div>
//         </SwiperSlide>

//         <SwiperSlide>
//           <div>
//             <div className='w-full'>
//               <img src={workb} alt="" className='w-full'/>
//             </div>
//           </div>
//         </SwiperSlide>

//         <SwiperSlide>
//           <div>
//             <div className='w-full'>
//               <img src={workc} alt="" className='w-full'/>
//             </div>
//           </div>
//         </SwiperSlide>

//         <SwiperSlide>
//           <div>
//             <div className='w-full'>
//               <img src={work} alt="" />
//             </div>
//           </div>
//         </SwiperSlide>

//       </Swiper>
//     </div>
//   )
// }

// export default Products



// import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../Components/ui/carousel"

const Products = () => {
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
              <div className='pt-3 text-xs text-left'>
                  <h2 className='text-sm'>Trading Platform Development</h2>
                  <p className=''>We build custom software solutions of any complexity for startups and enterprises.</p>
                  
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
              <div className='pt-3 text-xs text-left'>
                  <h2 className='text-sm'>Trading Platform Development</h2>
                  <p className=''>We build custom software solutions of any complexity for startups and enterprises.</p>
                  
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
              <div className='pt-3 text-xs text-left'>
                  <h2 className='text-sm'>Trading Platform Development</h2>
                  <p className=''>We build custom software solutions of any complexity for startups and enterprises.</p>
                  
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
              <div className='pt-3 text-xs text-left'>
                  <h2 className='text-sm'>Trading Platform Development</h2>
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


export default Products