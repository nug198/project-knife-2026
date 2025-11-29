'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import NavbarFooter from '../../components/NavbarFooter';
import CustomImage from '../../components/CustomImage';

interface Product {
  id_produk: number;
  nama_produk: string;
  slug: string;
  harga: number;
  kategori: {
    id_kategori: number;
    nama_kategori: string;
    slug?: string;
  };
  maker: {
    id_maker: number;
    nama_maker: string;
    foto_url?: string;
    lokasi?: string;
  };
  deskripsi_singkat: string | null;
  deskripsi_lengkap: string | null;
  bahan_bilah: string | null;
  bahan_gagang: string | null;
  bahan_sarung: string | null;
  panjang_bilah: number | null;
  lebar_bilah: number | null;
  tebal_bilah: number | null;
  berat: number | null;
  created_at: string;
  updated_at: string;
  gambar_produk: {
    id_gambar: number;
    gambar?: string;
    url_gambar: string | null;
    urutan: number;
    keterangan?: string | null;
  }[];
}

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDimensions(value: number | null, unit: string): string {
  if (value === null || value === undefined) return '-';
  return `${value} ${unit}`;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/products/${slug}`;
    
    console.log('🔍 Fetching product from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ Product not found (404)');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ Product data received:', {
        name: result.data.nama_produk,
        id_produk: result.data.id_produk,
        imageCount: result.data.gambar_produk?.length || 0,
        images: result.data.gambar_produk?.map((img: any) => ({
          id: img.id_gambar,
          gambar: img.gambar,
          url_gambar: img.url_gambar
        }))
      });
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return null;
  }
}

// =============================================================================
// SIMPLE IMAGE MODAL
// =============================================================================

function ImageModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt 
}: { 
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-6xl max-h-full w-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-lg hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-70 px-4 py-2 rounded-lg"
        >
          ✕ Tutup
        </button>
        
        <div 
          className="relative w-full h-full max-h-[85vh] rounded-lg flex items-center justify-center bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              console.error('❌ Modal image error:', imageUrl);
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-product.jpg';
            }}
          />
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg text-sm">
          Klik di luar gambar untuk menutup
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PRODUCT IMAGE GALLERY - FIXED VERSION
// =============================================================================

function ProductImageGallery({ product }: { product: Product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState<{[key: number]: boolean}>({});

  const allImages = product.gambar_produk || [];
  
  // PERBAIKAN: Gunakan path yang benar dengan id_produk
  const getImageUrl = (index: number): string => {
    if (!allImages[index]) {
      console.log('❌ No image at index:', index);
      return '/images/placeholder-product.jpg';
    }
    
    const image = allImages[index];
    
    // PERBAIKAN: Path yang benar - public/images/products/[id_produk]/[nama_file]
    if (image.gambar && image.gambar.trim() !== '') {
      const imagePath = `/images/products/${product.id_produk}/${image.gambar}`;
      console.log('🖼️ Using CORRECT image path:', imagePath);
      return imagePath;
    }
    
    console.log('❌ No valid image data at index:', index, image);
    return '/images/placeholder-product.jpg';
  };

  const mainImageUrl = getImageUrl(selectedImageIndex);

  console.log('🎯 Gallery State:', {
    selectedIndex: selectedImageIndex,
    mainImageUrl,
    productId: product.id_produk,
    imageData: allImages[selectedImageIndex],
    totalImages: allImages.length
  });

  const handleImageLoad = (index: number) => {
    console.log('✅ Image loaded successfully:', index, getImageUrl(index));
    setImageLoadStates(prev => ({ ...prev, [index]: true }));
  };

  const handleImageError = (index: number) => {
    console.error('❌ Image failed to load:', index, getImageUrl(index));
    setImageLoadStates(prev => ({ ...prev, [index]: false }));
  };

  const isImageLoaded = imageLoadStates[selectedImageIndex];

  return (
    <>
      <div className="space-y-6">
        {/* Main Image Container */}
        <div 
          className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-gray-200 cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Debug overlay - menunjukkan status loading */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-blue-100 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Memuat gambar...</p>
                <p className="text-xs text-gray-500 mt-1">{mainImageUrl}</p>
              </div>
            </div>
          )}
          
          {/* Main Image */}
          <CustomImage
            src={mainImageUrl}
            alt={product.nama_produk}
            width={600}
            height={450}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isImageLoaded ? 'group-hover:scale-105 opacity-100' : 'opacity-0'
            }`}
            priority
            onLoad={() => handleImageLoad(selectedImageIndex)}
            onError={() => handleImageError(selectedImageIndex)}
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              👁️ Klik untuk lihat ukuran penuh
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {allImages.map((gambar, index) => {
              const thumbUrl = getImageUrl(index);
              const isSelected = index === selectedImageIndex;
              const isThumbLoaded = imageLoadStates[index];
              
              return (
                <button
                  key={gambar.id_gambar}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    isSelected 
                      ? 'border-green-500 scale-110 shadow-lg' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                  onClick={() => {
                    console.log('🖱️ Switching to image:', index);
                    setSelectedImageIndex(index);
                  }}
                >
                  {!isThumbLoaded && (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    </div>
                  )}
                  <CustomImage
                    src={thumbUrl}
                    alt={`${product.nama_produk} view ${index + 1}`}
                    width={80}
                    height={80}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      isThumbLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    thumbnail
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Debug Info */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">Debug Information:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>🆔 Product ID: {product.id_produk}</p>
            <p>🖼️ Total Images: {allImages.length}</p>
            <p>🎯 Selected Index: {selectedImageIndex}</p>
            <p>📁 Image File: {allImages[selectedImageIndex]?.gambar || 'None'}</p>
            <p>🔗 Final Path: {mainImageUrl}</p>
            <p>✅ Load Status: {isImageLoaded ? 'Loaded' : 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={mainImageUrl}
        alt={product.nama_produk}
      />
    </>
  );
}

// =============================================================================
// MAIN PRODUCT DETAIL COMPONENT
// =============================================================================

export default function ProductDetail({ params }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        
        const { slug } = await params;
        console.log('🔄 Loading product with slug:', slug);
        
        const productData = await getProduct(slug);
        
        if (!productData) {
          console.log('❌ Product not found');
          setError('Produk tidak ditemukan');
          return;
        }
        
        // Validasi data gambar secara detail
        console.log('🔍 Detailed Image Validation:', {
          productName: productData.nama_produk,
          productId: productData.id_produk,
          hasImages: !!productData.gambar_produk,
          imageCount: productData.gambar_produk?.length || 0,
          images: productData.gambar_produk?.map((img, index) => ({
            index,
            id: img.id_gambar,
            gambar: img.gambar,
            hasGambar: !!img.gambar,
            gambarValue: img.gambar || 'NULL',
            expectedPath: `/images/products/${productData.id_produk}/${img.gambar}`
          }))
        });
        
        setProduct(productData);
      } catch (err) {
        console.error('❌ Error loading product:', err);
        setError('Terjadi kesalahan saat memuat produk');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params]);

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat produk...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/collection"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ← Kembali ke Koleksi
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb Navigation */}
      <div className="pt-24 pb-6 bg-green-50">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600 transition-colors">Beranda</Link>
            <span className="mx-2">›</span>
            <Link href="/collection" className="hover:text-green-600 transition-colors">Koleksi</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">{product.nama_produk}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <article className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.nama_produk}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {product.deskripsi_singkat || "Produk handmade berkualitas tinggi dengan craftsmanship terbaik"}
            </p>
          </header>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <ProductImageGallery product={product} />

            {/* Product Information */}
            <div className="flex flex-col justify-center space-y-6">
              {/* Price */}
              <div className="bg-linear-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <p className="text-3xl font-bold text-green-700">{formatPrice(product.harga)}</p>
                <p className="text-sm text-gray-600 mt-1">Harga termasuk pajak dan sarung</p>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-green-500 pl-3">
                  Informasi Produk
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Kategori</span>
                      <span className="text-gray-800">{product.kategori.nama_kategori}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Pembuat</span>
                      <span className="text-gray-800">{product.maker.nama_maker}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Berat Total</span>
                      <span className="text-gray-800">{formatDimensions(product.berat, "g")}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Panjang Bilah</span>
                      <span className="text-gray-800">{formatDimensions(product.panjang_bilah, "cm")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Lebar Bilah</span>
                      <span className="text-gray-800">{formatDimensions(product.lebar_bilah, "cm")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Tebal Bilah</span>
                      <span className="text-gray-800">{formatDimensions(product.tebal_bilah, "mm")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-green-500 pl-3">
                  Bahan & Konstruksi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                    <p className="font-semibold text-gray-700 mb-2">Bahan Bilah</p>
                    <p className="text-gray-800">{product.bahan_bilah || "-"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                    <p className="font-semibold text-gray-700 mb-2">Bahan Gagang</p>
                    <p className="text-gray-800">{product.bahan_gagang || "-"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                    <p className="font-semibold text-gray-700 mb-2">Bahan Sarung</p>
                    <p className="text-gray-800">{product.bahan_sarung || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.deskripsi_lengkap && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-green-500 pl-3">
                    Deskripsi Lengkap
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.deskripsi_lengkap}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/collection"
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-center"
                >
                  ← Kembali ke Koleksi
                </Link>
                <Link
                  href={`/craftsmen/${product.maker.id_maker}`}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium shadow-md text-center"
                >
                  Lihat Profil Pembuat
                </Link>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16 border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Produk Lainnya dari {product.maker.nama_maker}
            </h3>
            <div className="text-center">
              <Link 
                href={`/craftsmen/${product.maker.id_maker}`}
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors group"
              >
                Lihat semua karya {product.maker.nama_maker}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-600">
        <NavbarFooter />
        <p>© 2025 HandmadeKnives | All rights reserved.</p>
      </footer>
    </main>
  );
}