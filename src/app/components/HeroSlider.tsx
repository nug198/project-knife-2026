'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const heroSlides = [
  {
    id: 1,
    title: 'The Place That Everything Begins',
    desc: 'Step into the world of handcrafted mastery — where every design, every curve, and every edge is born with purpose and passion.',
    image: '/hero-img.jpg',
  },
  {
    id: 2,
    title: 'Forged with Fire and Soul',
    desc: 'Each blade is a story of heat, precision, and patience — crafted for those who value timeless art.',
    image: '/hero-img2.jpg',
  },
  {
    id: 3,
    title: 'Tradition Meets Innovation',
    desc: 'Blending ancient craftsmanship with modern aesthetics, we forge more than just tools — we shape legacy.',
    image: '/hero-img3.jpg',
  },
]

export default function HeroSlider() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted)
    return (
      <section className="flex items-center justify-center h-[80vh] bg-zinc-800 text-white">
        Loading...
      </section>
    )

  return (
    <section className="relative w-full h-[80vh]">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        loop
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        className="h-full"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority
                sizes="100vw"
                className="object-cover brightness-75"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-zinc-100 text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]"
                >
                  {slide.desc}
                </motion.p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Pagination custom (Tailwind applied by Swiper) */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.6);
          width: 12px;
          height: 12px;
          transition: all 0.3s ease;
          margin: 0 6px !important;
        }
        .swiper-pagination-bullet-active {
          background-color: white;
          width: 32px;
          border-radius: 6px;
        }
      `}</style>
    </section>
  )
}
