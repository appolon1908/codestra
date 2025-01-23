import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

import work from '../../assets/works (1).png'
import worka from '../../assets/works (2).png'
import workb from '../../assets/works (3).png'
import workc from '../../assets/works (4).png'

const Products = () => {
  return (
    <div>
        <Swiper
        slidesPerView={3}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        <SwiperSlide>
          <div>
            <div className='w-full'>
              <img src={work} alt="" className='w-full'/>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <div className='w-full'>
              <img src={worka} alt="" className='w-full'/>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <div className='w-full'>
              <img src={workb} alt="" className='w-full'/>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <div className='w-full'>
              <img src={workc} alt="" className='w-full'/>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <div className='w-full'>
              <img src={work} alt="" />
            </div>
          </div>
        </SwiperSlide>

      </Swiper>
    </div>
  )
}

export default Products