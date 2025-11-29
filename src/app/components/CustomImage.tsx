'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CustomImageProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  thumbnail?: boolean;
  portrait?: boolean;
  style?: React.CSSProperties;
  onError?: () => void;
  onLoad?: () => void;
}

export default function CustomImage({ 
  src, 
  alt, 
  width = 550,
  height = 400,
  className = '', 
  fill = false,
  sizes,
  priority = false,
  thumbnail = false,
  portrait = false,
  style,
  onError,
  onLoad
}: CustomImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('/images/placeholder-product.jpg');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state ketika src berubah
  useEffect(() => {
    if (!src) {
      setImgSrc('/images/placeholder-product.jpg');
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Jika sudah error, gunakan placeholder
    if (hasError) {
      setImgSrc('/images/placeholder-product.jpg');
      return;
    }

    // PERBAIKAN: Simplifikasi path resolution - biarkan Next.js yang handle path relatif/absolut
    let normalizedSrc = src;
    
    // Handle URL absolut (http, https, //)
    if (src.startsWith('http') || src.startsWith('//')) {
      normalizedSrc = src;
    } 
    // Handle path absolut (dimulai dengan /)
    else if (src.startsWith('/')) {
      normalizedSrc = src;
    }
    // Handle path relatif - tambahkan slash di depan
    else {
      normalizedSrc = `/${src}`;
    }

    console.log('🖼️ CustomImage path resolution:', { 
      original: src, 
      normalized: normalizedSrc 
    });
    
    setImgSrc(normalizedSrc);
    setHasError(false);
    setIsLoading(true);
  }, [src, hasError]);

  const handleLoad = () => {
    console.log('✅ CustomImage loaded successfully:', imgSrc);
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error('❌ CustomImage error loading:', imgSrc);
    setHasError(true);
    setImgSrc('/images/placeholder-product.jpg');
    setIsLoading(false);
    onError?.();
  };

  // Container styling
  const containerClass = `relative overflow-hidden ${className}`.trim();

  // Dimensions untuk thumbnail
  const displayWidth = thumbnail ? 100 : width;
  const displayHeight = thumbnail ? 100 : height;

  console.log('🎯 CustomImage rendering:', {
    originalSrc: src,
    finalSrc: imgSrc,
    displayWidth,
    displayHeight,
    isLoading,
    hasError
  });

  // Fill layout
  if (fill) {
    return (
      <div className={containerClass}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        )}
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${portrait ? 'object-scale-down' : 'object-cover'}`}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          style={style}
        />
      </div>
    );
  }

  // Fixed dimensions
  return (
    <div 
      className={containerClass}
      style={{ 
        width: displayWidth, 
        height: displayHeight,
        ...style 
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={displayWidth}
        height={displayHeight}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${
          thumbnail 
            ? 'object-cover' 
            : portrait 
              ? 'object-scale-down' 
              : 'object-cover'
        }`}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}