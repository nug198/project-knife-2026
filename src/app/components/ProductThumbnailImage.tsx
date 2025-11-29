'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProductThumbnailImage({ 
  src, 
  alt, 
  className = '' 
}: ProductThumbnailImageProps) {
  // PERBAIKAN: Inisialisasi dengan fallback yang benar
  const [imgSrc, setImgSrc] = useState(src || '/images/placeholder-product.jpg');

  const handleError = () => {
    setImgSrc('/images/placeholder-product.jpg');
  };

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={handleError}
        sizes="(max-width: 768px) 25vw, 10vw"
      />
    </div>
  );
}