import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import NavbarFooter from '../../components/NavbarFooter';
import ArticleDetailImage from '../../components/ArticleDetailImage'; // Import komponen baru

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

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Dynamic rendering - disable caching for development
export const dynamic = 'force-dynamic';

async function getArticle(slug: string): Promise<Artikel | null> {
  try {
    console.log('Fetching article for slug:', slug);
    
    // Use relative URL for API calls in the same app
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/articles/${slug}`;
    
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API result:', result);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default async function ArticleDetail({ params }: Props) {
  // UNWRAP THE PARAMS PROMISE
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-6 bg-green-50">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Beranda</Link>
            <span className="mx-2">›</span>
            <Link href="/article" className="hover:text-green-600">Artikel</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{article.judul}</span>
          </nav>
        </div>
      </div>

      {/* Article Content */}
      <article className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.judul}
            </h1>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-medium">Penulis:</span>
                <span>{article.user.nama}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>
                  {new Date(article.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </header>

          {/* Featured Image - SELALU TAMPILKAN dengan komponen yang handle error */}
          <ArticleDetailImage 
            src={article.gambar}
            alt={article.judul}
          />

          {/* Article Content */}
          <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
            {article.isi}
          </div>

          {/* Source Link */}
          {article.url_sumber && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Sumber: {' '}
                <a 
                  href={article.url_sumber} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {article.url_sumber}
                </a>
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
            <Link 
              href="/article"
              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
            >
              ← Kembali ke Daftar Artikel
            </Link>
            <Link 
              href="/"
              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </article>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 py-8 mt-10 text-center text-sm text-zinc-600">
        <NavbarFooter />
        <p>© 2025 HandmadeKnives | All rights reserved.</p>
        <div className="flex justify-center gap-3 mt-3 text-lg">
          <a href="#"><i className="fa-brands fa-facebook"></i></a>
          <a href="#"><i className="fa-brands fa-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-youtube"></i></a>
        </div>
      </footer>
    </main>
  );
}

export async function generateMetadata({ params }: Props) {
  // UNWRAP THE PARAMS PROMISE
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan',
    };
  }

  return {
    title: `${article.judul} | HandmadeKnives`,
    description: getExcerpt(article.isi, 160),
  };
}

function getExcerpt(content: string, maxLength: number = 100): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
}