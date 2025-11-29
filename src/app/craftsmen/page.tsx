import Link from 'next/link';
import Navbar from '../components/Navbar';
import NavbarFooter from '../components/NavbarFooter';
import MakerImage from '../components/MakerImage';

interface Maker {
  id_maker: number;
  nama_maker: string;
  profil: string;
  lokasi: string;
  kontak: string;
  foto_url: string;
  created_at: string;
  updated_at: string;
  produk_count?: number;
}

async function getMakers(): Promise<Maker[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/makers`, {
      cache: 'no-store',
      next: { tags: ['makers'] }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch makers: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching makers:', error);
    return [];
  }
}

function getExcerpt(content: string, maxLength: number = 100): string {
  if (!content) return 'Tidak ada deskripsi';
  const plainText = content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
}

export default async function CraftsmenPage() {
  const makers = await getMakers();

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Header dengan tema biru */}
      <div className="text-center py-10 bg-linear-to-b from-blue-50 to-white-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet the Artisans</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the master craftsmen whose skill and passion transform steel into exceptional blades.
          </p>
        </div>
      </div>

      {/* Makers Grid */}
      <div className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {makers.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔧</div>
                <p className="text-gray-500 text-lg">Belum ada data craftsman.</p>
                <p className="text-gray-400 text-sm mt-2">Craftsman akan muncul di sini setelah ditambahkan.</p>

                    <div className="text-center py-12">
                      <Link 
                        href="/"
                        className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium"
                      >
                        Kembali ke Beranda
                      </Link>
                    </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {makers.map((maker) => (
                <div
                  key={maker.id_maker}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 hover:border-blue-200 group"
                >
                  {/* Gambar Maker */}
                  <div className="relative w-full h-80 bg-gray-100 overflow-hidden">
                    <MakerImage
                      src={maker.foto_url}
                      alt={maker.nama_maker}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Badge jumlah produk */}
                    {maker.produk_count && maker.produk_count > 0 && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {maker.produk_count} Produk
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                      {maker.nama_maker}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        📍 {maker.lokasi || 'Lokasi tidak tersedia'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3 flex-1 leading-relaxed">
                      {getExcerpt(maker.profil, 120)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <Link 
                        href={`/craftsmen/${maker.id_maker}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors group/link"
                      >
                        Lihat Profil
                        <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                      </Link>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        ID: {maker.id_maker}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
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