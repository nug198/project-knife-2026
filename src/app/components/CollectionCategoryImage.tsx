'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CollectionCategoryImageProps {
  src?: string // Diubah dari string | undefined menjadi hanya string | undefined
  alt: string
}

export default function CollectionCategoryImage({ src, alt }: CollectionCategoryImageProps) {
  const [imgError, setImgError] = useState(false)
  const [imgSrc, setImgSrc] = useState(src || '/images/placeholder-product.jpg')

  const handleError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc('/images/placeholder-product.jpg')
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-110"
      sizes="(max-width: 768px) 50vw, 25vw"
      onError={handleError}
      priority={false} // PERBAIKAN: Tambahkan priority untuk optimisasi
    />
  )
}