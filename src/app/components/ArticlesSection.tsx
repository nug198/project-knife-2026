"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleImage from "./ArticleImage";

interface Artikel {
  id_artikel: number;
  judul: string;
  slug: string;
  isi: string;
  gambar: string | null;
  created_at: string;
  updated_at: string;
  id_user: number;
  url_sumber: string | null;
  user: {
    nama: string;
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function getExcerpt(content: string, maxLength: number = 100): string {
  if (!content) return 'Tidak ada deskripsi';
  const plainText = content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
}

export default function ArticlesSection() {
  const [articles, setArticles] = useState<Artikel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/articles');
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setArticles(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch articles');
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Gagal memuat artikel');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);
  
  const latestArticles = articles.slice(0, 3);

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#efebe9] to-[#f8f4e9] rounded-3xl my-10">
        <h2 className="text-4xl font-bold mb-3 text-[#5d4037]">Knife Talks</h2>
        <p className="text-[#8d6e63] text-lg mb-10 max-w-2xl mx-auto">
          Stories, updates, and insights from the edge.
        </p>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8d6e63]"></div>
          <p className="text-[#8d6e63] mt-4">Memuat artikel...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#efebe9] to-[#f8f4e9] rounded-3xl my-10">
        <h2 className="text-4xl font-bold mb-3 text-[#5d4037]">Knife Talks</h2>
        <p className="text-[#8d6e63] text-lg mb-10 max-w-2xl mx-auto">
          Stories, updates, and insights from the edge.
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

  if (latestArticles.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#efebe9] to-[#f8f4e9] rounded-3xl my-10">
        <h2 className="text-4xl font-bold mb-3 text-[#5d4037]">Knife Talks</h2>
        <p className="text-[#8d6e63] text-lg mb-10 max-w-2xl mx-auto">
          Stories, updates, and insights from the edge.
        </p>
        <div className="text-center py-12 bg-[#d7ccc8]/30 rounded-2xl">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-[#8d6e63] text-lg mb-4">Belum ada artikel tersedia.</p>
          <Link 
            href="/article"
            className="inline-block bg-[#8d6e63] text-[#f8f4e9] px-6 py-3 rounded-lg hover:bg-[#6d4c41] transition duration-300 font-medium"
          >
            Tulis Artikel Pertama
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto py-20 text-center px-6 bg-linear-to-b from-[#efebe9] to-[#f8f4e9] rounded-3xl my-10">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-3 text-[#5d4037]">Knife Talks</h2>
        <p className="text-[#8d6e63] text-lg max-w-2xl mx-auto">
          Stories, updates, and insights from the edge.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {latestArticles.map((article) => (
          <div
            key={article.id_artikel}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full border border-[#d7ccc8]"
          >
            <ArticleImage 
              src={article.gambar} 
              alt={article.judul}
            />
            
            <div className="p-6 text-left grow flex flex-col">
              <Link href={`/article/${article.slug}`}>
                <h3 className="text-xl font-bold mb-3 line-clamp-2 hover:text-[#8d6e63] transition-colors cursor-pointer text-[#5d4037]">
                  {article.judul}
                </h3>
              </Link>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-[#8d6e63]">
                  Penulis: <span className="font-semibold">{article.user.nama}</span>
                </p>
                <p className="text-sm text-[#8d6e63] flex items-center gap-1">
                  📅 {formatDate(article.created_at)}
                </p>
              </div>
              
              <p className="text-[#5d4037] leading-relaxed mb-6 line-clamp-3 grow">
                {getExcerpt(article.isi, 120)}
              </p>
              
              <div className="mt-auto pt-4 border-t border-[#d7ccc8]">
                <Link 
                  href={`/article/${article.slug}`}
                  className="inline-flex items-center text-[#8d6e63] hover:text-[#5d4037] font-semibold transition-colors group"
                >
                  Baca selengkapnya
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {articles.length > 3 && (
        <div className="mt-16">
          <Link 
            href="/article"
            className="inline-flex items-center px-8 py-4 bg-linear-to-r from-[#8d6e63] to-[#6d4c41] text-[#f8f4e9] font-semibold rounded-2xl hover:from-[#6d4c41] hover:to-[#5d4037] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {/* <span>View All Article ({articles.length})</span> */}
            <span>View All Article </span>
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