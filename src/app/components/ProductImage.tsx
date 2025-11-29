'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export default function ProductImage({ 
  src, 
  alt, 
  className = '', 
  fill = true, 
  sizes,
  priority = false 
}: ProductImageProps) {
  const [error, setError] = useState(false);

  // PERBAIKAN: Tentukan gambar yang akan ditampilkan dengan fallback yang konsisten
  const imageSrc = !src || error ? '/images/placeholder-product.jpg' : src;

  // Jika menggunakan fill
  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => setError(true)}
      />
    );
  }

  // Jika tidak menggunakan fill (fallback)
  return (
    <div className="relative w-full h-full">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => setError(true)}
      />
    </div>
  );
}