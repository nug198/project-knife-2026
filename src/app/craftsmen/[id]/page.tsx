import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import NavbarFooter from '../../components/NavbarFooter';
import MakerImage from '../../components/MakerImage';
import ProductImage from '../../components/ProductImage';

interface Product {
  id_produk: number;
  nama_produk: string;
  slug: string;
  harga: number | null;
  id_kategori: number;
  id_maker: number;
  deskripsi_singkat: string | null;
  deskripsi_lengkap: string | null;
  bahan_bilah: string | null;
  bahan_gagang: string | null;
  bahan_sarung: string | null;
  panjang_bilah: number | null;
  lebar_bilah: number | null;
  tebal_bilah: number | null;
  berat: number | null;
  status_tampil: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
  foto_url: string | null;
  kategori?: {
    nama_kategori: string;
    slug: string;
  } | null;
}

interface Maker {
  id_maker: number;
  nama_maker: string;
  profil: string;
  lokasi: string;
  kontak: string;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
  produk: Product[];
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// Helper functions
function formatDimensions(value: number | null, unit: string): string {
  if (value === null || value === undefined) return '-';
  return `${value} ${unit}`;
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'Hubungi untuk harga';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return '-';
  
  try {
    const numRating = typeof rating === 'number' ? rating : Number(rating);
    
    if (isNaN(numRating)) {
      return '-';
    }
    
    return numRating.toFixed(1);
  } catch (error) {
    console.error('Error formatting rating:', error);
    return '-';
  }
}

async function getMaker(id: string): Promise<Maker | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/makers/${id}`;
    
    console.log('🔄 Fetching maker from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      next: { tags: [`maker-${id}`] }
    });

    if (!response.ok) {
      console.log('❌ API response not OK:', response.status);
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Maker data received:', result);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching maker:', error);
    return null;
  }
}

function getExcerpt(content: string, maxLength: number = 100): string {
  if (!content) return 'Tidak ada deskripsi';
  const plainText = content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
}

export default async function MakerDetail({ params }: Props) {
  // PERBAIKAN: Await params karena sekarang Promise
  const { id } = await params;
  const maker = await getMaker(id);

  if (!maker) {
    notFound();
  }

  console.log('🎨 Rendering maker:', maker.nama_maker);
  console.log('📸 Maker photo URL:', maker.foto_url);
  console.log('📦 Number of products:', maker.produk?.length);

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb dengan tema biru */}
      <div className="pt-24 pb-6 bg-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <span className="mx-2">›</span>
            <Link href="/craftsmen" className="hover:text-blue-600 transition-colors">Craftsmen</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">{maker.nama_maker}</span>
          </nav>
        </div>
      </div>

      {/* Maker Content */}
      <article className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {maker.nama_maker}
            </h1>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                <span className="text-lg">📍</span>
                <span className="font-medium">{maker.lokasi || 'Lokasi tidak tersedia'}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                <span className="text-lg">📧</span>
                <span className="font-medium">{maker.kontak || 'Kontak tidak tersedia'}</span>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Featured Image */}
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
              <MakerImage
                src={maker.foto_url}
                alt={maker.nama_maker}
                className="object-cover"
                priority
              />
            </div>

            {/* Maker Profile */}
            <div className="flex flex-col justify-center">
              <div className="prose prose-lg max-w-none text-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-blue-200 pb-3">
                  Tentang {maker.nama_maker}
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  {maker.profil ? (
                    maker.profil.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">
                      Belum ada deskripsi profil untuk craftsman ini.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📋</span>
                  Informasi Craftsman
                </h3>
                <div className="space-y-3 text-gray-600">
                  <p className="flex justify-between">
                    <strong>Lokasi:</strong> 
                    <span>{maker.lokasi || 'Tidak tersedia'}</span>
                  </p>
                  <p className="flex justify-between">
                    <strong>Kontak:</strong> 
                    <span>{maker.kontak || 'Tidak tersedia'}</span>
                  </p>
                  <p className="flex justify-between">
                    <strong>Jumlah Karya:</strong> 
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                      {maker.produk?.length || 0} Produk
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <strong>Bergabung:</strong> 
                    <span>{new Date(maker.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          {maker.produk && maker.produk.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Karya {maker.nama_maker}</h2>
                <p className="text-gray-600">Telusuri koleksi karya terbaik dari craftsman kami</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maker.produk.map((produk) => (
                  <div
                    key={produk.id_produk}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 group"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                      <ProductImage
                        src={produk.foto_url}
                        alt={produk.nama_produk}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Kategori Badge */}
                      {produk.kategori && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          {produk.kategori.nama_kategori}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                        {produk.nama_produk}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {produk.deskripsi_singkat || 'Tidak ada deskripsi singkat'}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span>Bilah:</span>
                          <span className="font-medium">{produk.bahan_bilah || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gagang:</span>
                          <span className="font-medium">{produk.bahan_gagang || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Panjang:</span>
                          <span className="font-medium">
                            {formatDimensions(produk.panjang_bilah, "cm")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {formatPrice(produk.harga)}
                        </span>
                        {produk.rating && (
                          <span className="flex items-center gap-1 text-yellow-600 text-sm bg-yellow-50 px-2 py-1 rounded">
                            ⭐ {formatRating(produk.rating)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Link 
                      href={`/collection/${produk.slug || produk.id_produk}`}
                      className="block text-center bg-blue-600 text-white py-3 hover:bg-blue-700 transition-colors font-medium mt-2"
                    >
                      Lihat Detail Produk
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Products Message */}
          {(!maker.produk || maker.produk.length === 0) && (
            <div className="mt-16 text-center py-16 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Karya
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {maker.nama_maker} belum memiliki produk yang ditampilkan. Karya akan muncul di sini segera setelah tersedia.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-16 flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
            <Link 
              href="/craftsmen"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Kembali ke Daftar Craftsmen
            </Link>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <div className="mt-auto">
        <footer className="w-full bg-white border-t border-gray-200 py-8 mt-10 text-center text-sm text-gray-600">
          <NavbarFooter />
          <p>© 2025 HandmadeKnives | All rights reserved.</p>
          <div className="flex justify-center gap-3 mt-3 text-lg">
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: Props) {
  // PERBAIKAN: Await params karena sekarang Promise
  const { id } = await params;
  const maker = await getMaker(id);
  
  if (!maker) {
    return {
      title: 'Craftsman Tidak Ditemukan',
    };
  }

  return {
    title: `${maker.nama_maker} | HandmadeKnives`,
    description: getExcerpt(maker.profil, 160),
    openGraph: {
      title: `${maker.nama_maker} | HandmadeKnives`,
      description: getExcerpt(maker.profil, 160),
      images: maker.foto_url ? [maker.foto_url] : [],
    },
  };
}