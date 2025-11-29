/**
 * Utility functions untuk image processing
 */

export interface ImageProcessOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Helper function untuk mendapatkan URL gambar yang optimal
 * Untuk sementara, return URL asli tanpa processing
 */
export function getOptimizedImageUrl(
  originalUrl: string | null,
  options: {
    type?: 'normal' | 'zoom' | 'thumbnail' | 'portrait';
  } = {}
): string {
  const { type = 'normal' } = options;
  
  if (!originalUrl) {
    return '/images/placeholder-product.jpg';
  }

  // Untuk development, gunakan original URL
  // Di production nanti bisa diaktifkan image processing
  return originalUrl;
}

/**
 * Check jika gambar perlu diproses
 */
export function shouldProcessImage(originalUrl: string | null): boolean {
  if (!originalUrl) return false;
  
  // Skip processing untuk placeholder
  if (originalUrl.includes('placeholder')) return false;
  
  // Untuk sementara, nonaktifkan processing di development
  if (process.env.NODE_ENV === 'development') return false;
  
  return false; // Nonaktifkan sementara
}