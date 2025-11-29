import Link from 'next/link';
import Navbar from '../components/Navbar';
import NavbarFooter from '../components/NavbarFooter';
import ArticleImage from '../components/ArticleImage'; // Import komponen baru

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

async function getArticles(): Promise<Artikel[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/articles`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

function getExcerpt(content: string, maxLength: number = 100): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <div className="text-center py-10 bg-linear-to-b from-red-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Knife Talks</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stories, updates, and insights from the edge. Explore our collection of articles about knife craftsmanship, maintenance, and history.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Belum ada artikel tersedia.</p>
              <Link 
                href="/"
                className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Kembali ke Beranda
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article
                  key={article.id_artikel}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
                >
                  {/* Gunakan ArticleImage yang sudah ada error handling */}
                  <ArticleImage 
                    src={article.gambar} 
                    alt={article.judul}
                  />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <Link href={`/article/${article.slug}`}>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-green-600 transition-colors line-clamp-2">
                        {article.judul}
                      </h2>
                    </Link>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>By {article.user.nama}</span>
                      <span>•</span>
                      <span>
                        {new Date(article.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {getExcerpt(article.isi, 120)}
                    </p>
                    
                    <Link 
                      href={`/article/${article.slug}`}
                      className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1 mt-auto"
                    >
                      Baca selengkapnya
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
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
    </main>
  );
}