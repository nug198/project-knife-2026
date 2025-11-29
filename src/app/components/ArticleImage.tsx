"use client";

import Image from "next/image";
import { useState } from "react";

interface ArticleImageProps {
  src: string | null;
  alt: string;
}

export default function ArticleImage({ src, alt }: ArticleImageProps) {
  const [imgError, setImgError] = useState(false);
  
  // PERBAIKAN: Gunakan path yang konsisten untuk placeholder
  const [imgSrc, setImgSrc] = useState(src || "/images/placeholder-article.jpg");

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc("/images/placeholder-article.jpg");
    }
  };

  // PERBAIKAN: Selalu gunakan Image component, jangan div placeholder
  return (
    <div className="relative w-full h-48">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}