'use client'

import { useState } from 'react'
import Image from 'next/image'

interface HeroImageProps {
  src: string
  alt: string
}

export default function HeroImage({ src, alt }: HeroImageProps) {
  const [imgError, setImgError] = useState(false)
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc('/images/placeholder-hero.jpg')
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority
      sizes="100vw"
      className="object-cover brightness-90"
      onError={handleError}
    />
  )
}