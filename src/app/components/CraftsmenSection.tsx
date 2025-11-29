"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MakerImage from "./MakerImage"; // Tetap import MakerImage

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

function getExcerpt(content: string, maxLength: number = 100): string {
  if (!content) return 'Tidak ada deskripsi';
  const plainText = content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
}

export default function CraftsmenSection() {
  const [makers, setMakers] = useState<Maker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMakers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/makers');
        if (!response.ok) {
          throw new Error('Failed to fetch makers');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setMakers(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch makers');
        }
      } catch (err) {
        console.error('Error fetching makers:', err);
        setError('Gagal memuat data craftsmen');
        setMakers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMakers();
  }, []);
  
  const featuredMakers = makers.slice(0, 3);

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#f8f4e9] to-[#efebe9] rounded-3xl my-10">
        <h2 className="text-4xl font-bold mb-3 text-[#5d4037]">Meet the Craftsmen</h2>
        <p className="text-[#8d6e63] text-lg mb-10 max-w-2xl mx-auto">
          The skilled hands behind exceptional blades
        </p>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8d6e63]"></div>
          <p className="text-[#8d6e63] mt-4">Memuat data craftsmen...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#f8f4e9] to-[#efebe9] rounded-3xl my-10">
        <h2 className="text-4xl font-bold mb-3 text-[#5d4037]">Meet the Craftsmen</h2>
        <p className="text-[#8d6e63] text-lg mb-10 max-w-2xl mx-auto">
          The skilled hands behind exceptional blades
        </p>
        <div className="text-center py-8">
          <div className="bg-[#ffebee] border border-[#f44336] rounded-xl p-6 max-w-md mx-auto">
            <p className="text-[#d32f2f]">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-[#8d6e63] hover:text-[#5d4037] font-medium"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (featuredMakers.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#f8f4e9] to-[#efebe9] rounded-3xl my-10">
        <h2 className="text-4xl font-bold mb-3 text-[#5d4037]">Meet the Craftsmen</h2>
        <p className="text-[#8d6e63] text-lg mb-10 max-w-2xl mx-auto">
          The skilled hands behind exceptional blades
        </p>
        <div className="text-center py-12 bg-[#d7ccc8]/30 rounded-2xl">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-[#8d6e63] text-lg mb-4">Belum ada data craftsmen tersedia.</p>
          <Link 
            href="/craftsmen"
            className="inline-block bg-[#8d6e63] text-[#f8f4e9] px-6 py-3 rounded-lg hover:bg-[#6d4c41] transition duration-300 font-medium"
          >
            Kelola Craftsmen
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#f8f4e9] to-[#efebe9] rounded-3xl my-10">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-3 text-[#5d4037]">Meet the Craftsmen</h2>
        <p className="text-[#8d6e63] text-lg max-w-2xl mx-auto">
          Discover the makers whose dedication and artistry shape every knife — transforming raw metal into timeless tools of craft and character.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {featuredMakers.map((maker) => (
          <div
            key={maker.id_maker}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-[#d7ccc8] flex flex-col h-full transform hover:-translate-y-2"
          >
            <div className="relative w-full h-80 bg-linear-to-br from-[#d7ccc8] to-[#bcaaa4] overflow-hidden">
              {/* SOLUSI 3 & 4: Tetap menggunakan MakerImage */}
              <MakerImage 
                src={maker.foto_url} 
                alt={maker.nama_maker}
                className="transition-transform duration-700 hover:scale-105"
                fill
              />
              
              {maker.produk_count && maker.produk_count > 0 && (
                <div className="absolute top-4 right-4 bg-[#8d6e63] text-[#f8f4e9] px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  {maker.produk_count} Karya
                </div>
              )}
            </div>
            
            <div className="p-6 text-left grow flex flex-col">
              <h3 className="text-2xl font-bold mb-3 text-[#5d4037] group-hover:text-[#8d6e63] transition-colors">
                {maker.nama_maker}
              </h3>
              
              <div className="flex items-center gap-2 text-[#8d6e63] mb-4">
                <span className="flex items-center gap-2 bg-[#efebe9] px-3 py-1 rounded-full text-sm">
                  📍 {maker.lokasi || 'Lokasi tidak tersedia'}
                </span>
              </div>
              
              <p className="text-[#5d4037] leading-relaxed mb-6 line-clamp-3 grow">
                {getExcerpt(maker.profil, 120)}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#d7ccc8]">
                <Link 
                  href={`/craftsmen/${maker.id_maker}`}
                  className="inline-flex items-center text-[#8d6e63] hover:text-[#5d4037] font-semibold transition-colors group"
                >
                  Lihat Profil
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <span className="text-xs text-[#8d6e63] bg-[#efebe9] px-2 py-1 rounded">
                  ID: {maker.id_maker}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {makers.length > 3 && (
        <div className="mt-16">
          <Link 
            href="/craftsmen"
            className="inline-flex items-center px-8 py-4 bg-linear-to-r from-[#8d6e63] to-[#6d4c41] text-[#f8f4e9] font-semibold rounded-2xl hover:from-[#6d4c41] hover:to-[#5d4037] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>View All Craftsmen</span>
            <svg 
              className="w-5 h-5 ml-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}