"use client"

import Link from "next/link";
// import ProductImage from "./ProductImage";
import CustomImage from "./CustomImage";

interface ProductCardProps {
  produk: {
    id_produk: number;
    nama_produk: string;
    slug?: string;
    harga?: number | null | undefined;
    bahan_bilah?: string | null | undefined;
    panjang_bilah?: number | null | undefined;
    lebar_bilah?: number | null | undefined;
    tebal_bilah?: number | null | undefined;
    gambar_produk?: Array<{
      url?: string;
      gambar?: string;
      url_gambar?: string;
    }>;
    foto_url?: string | null | undefined;
  };
}

// Format harga dengan handling null/undefined
function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return 'Hubungi';
  
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  } catch (error) {
    console.error('Error formatting price:', error);
    return 'Hubungi';
  }
}

// Format dimensi produk
function formatDimensions(
  panjang: number | null | undefined, 
  lebar: number | null | undefined, 
  tebal: number | null | undefined
): string {
  const parts = [];
  
  if (panjang !== null && panjang !== undefined && !isNaN(panjang)) {
    parts.push(`${panjang}cm`);
  }
  
  if (lebar !== null && lebar !== undefined && !isNaN(lebar)) {
    parts.push(`${lebar}cm`);
  }
  
  if (tebal !== null && tebal !== undefined && !isNaN(tebal)) {
    parts.push(`${tebal}cm`);
  }
  
  return parts.length > 0 ? parts.join(' × ') : '-';
}

// Helper untuk menangani bahan_bilah
function getBahanBilah(bahan_bilah: string | null | undefined): string {
  if (bahan_bilah === null || bahan_bilah === undefined || bahan_bilah.trim() === '') {
    return 'Material tidak tersedia';
  }
  return bahan_bilah;
}

// export default function ProductCard({ produk }: ProductCardProps) {
//   // PERBAIKAN: Tentukan URL gambar dengan prioritas yang konsisten
//   const imgUrl = produk.foto_url || 
//                 produk.gambar_produk?.[0]?.url_gambar || 
//                 (produk.gambar_produk?.[0]?.gambar ? `/images/products/${produk.gambar_produk[0].gambar}` : null);

//   // Pastikan slug atau id_produk tersedia untuk link
//   const productSlug = produk.slug || produk.id_produk.toString();

//   return (
//     <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
//       {/* Gambar dan konten utama tetap dalam Link */}
//       <Link href={`/collection/${productSlug}`} className="block">
//         <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
//           {/* PERBAIKAN: Gunakan ProductImage dengan fallback yang konsisten */}
//           <ProductImage
//             src={imgUrl}
//             alt={produk.nama_produk}
//             className="object-cover transition-transform duration-300 group-hover:scale-105"
//             fill
//             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//           />
//         </div>
        
//         <div className="p-4">
//           <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
//             {produk.nama_produk}
//           </h3>
          
//           <div className="space-y-1 text-sm text-gray-600 mb-3">
//             <p className="font-medium text-blue-600">
//               {formatPrice(produk.harga)}
//             </p>
//             <p>{getBahanBilah(produk.bahan_bilah)}</p>
//             <p className="text-xs text-gray-500">
//               {formatDimensions(produk.panjang_bilah, produk.lebar_bilah, produk.tebal_bilah)}
//             </p>
//           </div>
//         </div>
//       </Link>
      
//       {/* Bagian bawah dengan ID dan Link terpisah */}
//       <div className="px-4 pb-4 pt-2 border-t border-gray-100">
//         <div className="flex justify-between items-center">
//           <span className="text-xs text-gray-500">ID: {produk.id_produk}</span>
//           <Link 
//             href={`/collection/${productSlug}`}
//             className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors hover:underline flex items-center gap-1"
//           >
//             Lihat Detail
//             <span className="transition-transform group-hover:translate-x-0.5">→</span>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function ProductCard({ produk }: ProductCardProps) {
  const imgUrl = produk.foto_url || 
                produk.gambar_produk?.[0]?.url_gambar || 
                (produk.gambar_produk?.[0]?.gambar ? `/images/products/${produk.gambar_produk[0].gambar}` : null);

  const productSlug = produk.slug || produk.id_produk.toString();

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
      <Link href={`/collection/${productSlug}`} className="block">
        <div className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden">
          <CustomImage
            src={imgUrl}
            alt={produk.nama_produk}
            width={550}
            height={400}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
            {produk.nama_produk}
          </h3>
          
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <p className="font-medium text-blue-600">
              {formatPrice(produk.harga)}
            </p>
            <p>{getBahanBilah(produk.bahan_bilah)}</p>
            <p className="text-xs text-gray-500">
              {formatDimensions(produk.panjang_bilah, produk.lebar_bilah, produk.tebal_bilah)}
            </p>
          </div>
        </div>
      </Link>
      
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">ID: {produk.id_produk}</span>
          <Link 
            href={`/collection/${productSlug}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors hover:underline flex items-center gap-1"
          >
            Lihat Detail
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}