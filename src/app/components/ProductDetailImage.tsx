'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductDetailImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

export default function ProductDetailImage({ 
  src, 
  alt, 
  className = '', 
  fill = true, 
  priority = false 
}: ProductDetailImageProps) {
  // PERBAIKAN: Gunakan placeholder yang konsisten
  const [imgSrc, setImgSrc] = useState(src || '/images/placeholder-product.jpg');

  const handleError = () => {
    setImgSrc('/images/placeholder-product.jpg');
  };

  return (
    <div className={className}>
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        className="object-cover"
        priority={priority}
        onError={handleError}
        sizes={fill ? "(max-width: 768px) 100vw, 50vw" : undefined}
      />
    </div>
  );
}