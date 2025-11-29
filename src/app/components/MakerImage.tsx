'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MakerImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export default function MakerImage({ 
  src, 
  alt, 
  className = '', 
  fill = true, 
  priority = false,
  sizes 
}: MakerImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Gunakan placeholder jika src null atau error loading
  const imageSrc = !src || imageError ? '/images/placeholder-maker.jpg' : src;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      onError={() => setImageError(true)}
      unoptimized={true} // SOLUSI 4: Tambahkan unoptimized prop
    />
  );
}