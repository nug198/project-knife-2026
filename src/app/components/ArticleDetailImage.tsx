"use client";

import Image from "next/image";
import { useState } from "react";

interface ArticleDetailImageProps {
  src: string | null;
  alt: string;
}

export default function ArticleDetailImage({ src, alt }: ArticleDetailImageProps) {
  const [imgError, setImgError] = useState(false);
  
  // PERBAIKAN: Gunakan path yang konsisten dengan ArticleImage
  const [imgSrc, setImgSrc] = useState(src || "/images/placeholder-article.jpg");

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc("/images/placeholder-article.jpg");
    }
  };

  // PERBAIKAN: Selalu gunakan Image component dengan fallback yang konsisten
  return (
    <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={handleError}
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
      />
    </div>
  );
}