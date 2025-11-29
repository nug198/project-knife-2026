import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import CollectionCategoryImage from "./CollectionCategoryImage";

const prisma = new PrismaClient();

interface Category {
  id_kategori: number;
  nama_kategori: string;
  slug: string | null;
  deskripsi: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  image_url?: string | null;
}

export default async function CollectionSection() {
  let categories: Category[] = [];
  
  try {
    // PERBAIKAN: Ambil data kategori beserta produk dan gambar produk
    const dbCategories = await prisma.kategori.findMany({
      orderBy: { nama_kategori: "asc" },
      include: {
        // PERBAIKAN: Include produk dengan gambar
        produk: {
          where: {
            status_tampil: true // Hanya produk yang ditampilkan
          },
          take: 1, // Ambil satu produk saja untuk gambar kategori
          include: {
            gambar_produk: {
              take: 1, // Ambil satu gambar pertama
              orderBy: {
                urutan: 'asc'
              }
            }
          }
        }
      },
    });

    // Transform data dari Prisma ke format Category
    categories = dbCategories.map(category => {
      // PERBAIKAN: Ambil gambar dari produk pertama jika ada
      let productImageUrl = null;
      
      if (category.produk && category.produk.length > 0) {
        const firstProduct = category.produk[0];
        if (firstProduct.gambar_produk && firstProduct.gambar_produk.length > 0) {
          productImageUrl = firstProduct.gambar_produk[0].url_gambar;
        }
      }

      return {
        id_kategori: category.id_kategori,
        nama_kategori: category.nama_kategori,
        slug: category.slug,
        deskripsi: category.deskripsi,
        created_at: category.created_at,
        updated_at: category.updated_at,
        // PERBAIKAN: Prioritaskan gambar dari produk, lalu fallback ke helper function
        image_url: productImageUrl || getCategoryImage(category.nama_kategori)
      };
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    // Jika database error, kembalikan array kosong
    categories = [];
  } finally {
    await prisma.$disconnect();
  }

  // Jika tidak ada kategori, jangan render section
  if (categories.length === 0) {
    return null;
  }

  const displayCategories = categories.slice(0, 4);

  return (
    <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#f8f4e9] to-[#efebe9] rounded-3xl my-10">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-4 text-[#5d4037]">
          Find Your Collection
        </h2>
        <p className="text-[#8d6e63] text-lg max-w-2xl mx-auto leading-relaxed">
          Explore a selection of blades forged through precision and tradition, 
          each balancing beauty, strength, and performance.
        </p>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayCategories.map((item) => {
          const href = `/collection?kategori=${encodeURIComponent(item.nama_kategori)}`;

          return (
            <Link
              key={item.id_kategori}
              href={href}
              className="group block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white"
            >
              <div className="relative aspect-4/5 overflow-hidden bg-[#d7ccc8]">
                <CollectionCategoryImage
                  src={item.image_url || undefined}
                  alt={item.nama_kategori}
                />
                
                {/* Overlay dengan gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-[#5d4037]/90 via-[#5d4037]/30 to-transparent flex items-end justify-start p-6">
                  <div className="text-left">
                    <h3 className="text-[#f8f4e9] font-bold text-xl mb-3 drop-shadow-lg">
                      {item.nama_kategori}
                    </h3>
                    <div className="inline-flex items-center text-[#d7ccc8] text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-2">
                      <span>Explore Collection</span>
                      <svg 
                        className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#8d6e63]/50 rounded-2xl transition-colors duration-500" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-16">
        <Link
          href="/collection"
          className="inline-flex items-center px-8 py-4 bg-linear-to-r from-[#8d6e63] to-[#6d4c41] text-[#f8f4e9] font-semibold rounded-2xl hover:from-[#6d4c41] hover:to-[#5d4037] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
        >
          <span>View All Collections</span>
          <svg 
            className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

// Helper function untuk mendapatkan gambar berdasarkan nama kategori
function getCategoryImage(categoryName: string): string {
  const imageMap: { [key: string]: string } = {
    'Kitchen': '/images/kitchen-category.jpg',
    'Axe': '/images/axe-category.jpg', 
    'Bushcraft': '/images/bushcraft-category.jpg',
    'Tactical': '/images/tactical-category.jpg',
    'Hunting': '/images/hunting-category.jpg',
    'Survival': '/images/survival-category.jpg',
    'Collector': '/images/collector-category.jpg',
    'Custom': '/images/custom-category.jpg',
  };

  // Kembalikan placeholder yang konsisten
  return imageMap[categoryName] || '/images/placeholder-category.jpg';
}