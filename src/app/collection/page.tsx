"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import NavbarFooter from "../components/NavbarFooter";
import ProductImage from "../components/ProductImage";

interface Product {
  id_produk: number;
  nama_produk: string;
  slug: string;
  harga: number;
  kategori: {
    id_kategori: number;
    nama_kategori: string;
  } | null; // PERBAIKAN: kategori bisa null
  maker: {
    id_maker: number;
    nama_maker: string;
  } | null; // PERBAIKAN: maker bisa null
  deskripsi_singkat: string | null;
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
    url_gambar: string;
    urutan: number;
  }[];
}

// Interface untuk Kategori
interface Kategori {
  id_kategori: number;
  nama_kategori: string;
  slug: string;
  deskripsi: string | null;
}

// PERBAIKAN: Helper function untuk validasi produk
const isValidProduct = (product: any): product is Product => {
  return (
    product &&
    typeof product.id_produk === 'number' &&
    typeof product.nama_produk === 'string'
  );
};

// PERBAIKAN: Helper function untuk mendapatkan nama kategori dengan fallback
const getKategoriName = (product: Product): string => {
  return product.kategori?.nama_kategori || 'Uncategorized';
};

// PERBAIKAN: Helper function untuk mendapatkan nama maker dengan fallback
const getMakerName = (product: Product): string => {
  return product.maker?.nama_maker || 'Unknown Maker';
};

function CollectionContent() {
  const searchParams = useSearchParams();
  const urlKategori = searchParams.get('kategori');
  
  const [produk, setProduk] = useState<Product[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState(urlKategori || "All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [kategoriLoading, setKategoriLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const perPage = 9;

  useEffect(() => {
    if (urlKategori) {
      setKategori(urlKategori);
      setCurrentPage(1);
    }
  }, [urlKategori]);

  const getSafeImageUrl = (product: Product, index: number = 0): string | null => {
    if (!product.gambar_produk || product.gambar_produk.length === 0) {
      return null;
    }

    const gambar = product.gambar_produk[index];
    if (!gambar || !gambar.url_gambar) {
      return null;
    }

    return gambar.url_gambar;
  };

  // Fetch produk dari API
  useEffect(() => {
    const fetchProduk = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }
        
        // PERBAIKAN: Filter dan validasi data sebelum disimpan
        const validProducts = data.filter(isValidProduct);
        console.log(`Loaded ${validProducts.length} valid products out of ${data.length}`);
        
        setProduk(validProducts);
        
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch products');
        setProduk([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduk();
  }, []);

  // Fetch kategori dari API terpisah
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        setKategoriLoading(true);
        const response = await fetch('/api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setKategoriList(result.data);
          } else {
            console.warn('Invalid categories response format');
            // Fallback: ambil kategori dari produk yang ada
            const uniqueKategories = Array.from(
              new Set(produk.map(p => getKategoriName(p)))
            )
            .filter(name => name !== 'Uncategorized')
            .map((nama_kategori, index) => ({
              id_kategori: index + 1,
              nama_kategori,
              slug: nama_kategori.toLowerCase().replace(/ /g, '-'),
              deskripsi: null
            }));
            setKategoriList(uniqueKategories);
          }
        } else {
          console.warn('Failed to fetch categories, using fallback');
          // Fallback: ambil kategori dari produk yang ada
          const uniqueKategories = Array.from(
            new Set(produk.map(p => getKategoriName(p)))
          )
          .filter(name => name !== 'Uncategorized')
          .map((nama_kategori, index) => ({
            id_kategori: index + 1,
            nama_kategori,
            slug: nama_kategori.toLowerCase().replace(/ /g, '-'),
            deskripsi: null
          }));
          setKategoriList(uniqueKategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback ke kategori dari produk
        const uniqueKategories = Array.from(
          new Set(produk.map(p => getKategoriName(p)))
        )
        .filter(name => name !== 'Uncategorized')
        .map((nama_kategori, index) => ({
          id_kategori: index + 1,
          nama_kategori,
          slug: nama_kategori.toLowerCase().replace(/ /g, '-'),
          deskripsi: null
        }));
        setKategoriList(uniqueKategories);
      } finally {
        setKategoriLoading(false);
      }
    };

    if (produk.length > 0) {
      fetchKategori();
    }
  }, [produk]);

  // PERBAIKAN: Filter dengan pengecekan null yang aman
  const filteredProduk = produk.filter((p) => {
    const kategoriName = getKategoriName(p);
    const cocokKategori = kategori === "All" || kategoriName === kategori;
    const cocokNama = p.nama_produk?.toLowerCase().includes(search.toLowerCase());
    return cocokKategori && cocokNama;
  });

  const totalPages = Math.ceil(filteredProduk.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const visibleProduk = filteredProduk.slice(startIndex, startIndex + perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, kategori]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDimensions = (value: number | null, unit: string) => {
    if (value === null || value === undefined) return '-';
    return `${value} ${unit}`;
  };

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <section className="text-center py-10 bg-linear-to-b from-green-50 to-white">
        <h1 className="text-3xl font-bold text-green-600 mb-3">
          {kategori === "All" ? "Every edge tells a story" : `Koleksi ${kategori}`}
        </h1>
        <p className="text-gray-600 italic max-w-2xl mx-auto">
          {kategori === "All" 
            ? "Explore a selection of blades forged through precision and tradition, each one crafted to balance beauty, strength, and performance."
            : `Temukan koleksi ${kategori} pilihan yang dibuat dengan ketelitian dan tradisi.`}
        </p>
        {kategori !== "All" && (
          <button
            onClick={() => setKategori("All")}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Tampilkan semua produk
          </button>
        )}
      </section>

      {error && (
        <div className="mx-auto max-w-6xl px-6 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <strong>Error:</strong> {error}
            <button 
              onClick={() => window.location.reload()}
              className="ml-4 text-blue-600 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-10 px-6">
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Cari produk..."
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <select
            value={kategori}
            onChange={(e) => {
              setKategori(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={kategoriLoading}
          >
            <option value="All">Semua Kategori</option>
            {kategoriLoading ? (
              <option value="" disabled>Memuat kategori...</option>
            ) : (
              kategoriList.map(kat => (
                <option key={kat.id_kategori} value={kat.nama_kategori}>
                  {kat.nama_kategori}
                </option>
              ))
            )}
          </select>
        </div>
        <button
          onClick={() => setCurrentPage(1)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 transition duration-300"
        >
          Terapkan Filter
        </button>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-600">
          Menampilkan {filteredProduk.length} produk
          {kategori !== "All" && ` dalam kategori ${kategori}`}
          {search && ` untuk "${search}"`}
        </p>
        {totalPages > 1 && (
          <p className="text-gray-500 text-sm mt-1">
            Halaman {currentPage} dari {totalPages}
          </p>
        )}
      </div>

      <section className="flex justify-center pb-10 px-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Memuat produk...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
            {visibleProduk.length > 0 ? (
              visibleProduk.map((item) => (
                <div
                  key={item.id_produk}
                  className="rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 hover:translate-y-1 bg-white"
                >
                  <div className="relative w-full h-56">
                    <ProductImage
                      src={getSafeImageUrl(item)}
                      alt={item.nama_produk}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* PERBAIKAN: Gunakan helper function untuk kategori */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        {getKategoriName(item)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-gray-800">{item.nama_produk}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.deskripsi_singkat || "Deskripsi tidak tersedia"}
                    </p>
                    <p className="text-sm font-semibold text-green-600 mb-2">
                      {formatCurrency(item.harga)}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Bahan: {item.bahan_bilah || "-"}</p>
                      <p>Bilah: {formatDimensions(item.panjang_bilah, "cm")} | Tebal: {formatDimensions(item.tebal_bilah, "mm")}</p>
                      {/* PERBAIKAN: Gunakan helper function untuk maker */}
                      <p>Pembuat: {getMakerName(item)}</p>
                    </div>
                    <div className="mt-3 text-right">
                      <Link
                        href={`/collection/${item.slug || item.id_produk}`}
                        className="inline-flex items-center gap-1 text-green-600 text-sm font-medium hover:text-green-700 hover:underline transition group"
                      >
                        Lihat Detail
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="text-gray-400 text-lg mb-2">Tidak ada produk ditemukan</div>
                <p className="text-sm text-gray-500 mb-2">
                  {search || kategori !== "All" 
                    ? "Coba ubah kata kunci pencarian atau filter kategori" 
                    : "Belum ada produk yang tersedia"}
                </p>
                
                <div className="text-center py-4">
                  <Link 
                    href="/"
                    className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>

                {(search || kategori !== "All") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setKategori("All");
                    }}
                    className="text-green-600 hover:underline mt-4"
                  >
                    Tampilkan semua produk
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex justify-center mb-10 px-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              ← Previous
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? goToPage(page) : null}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  currentPage === page
                    ? "bg-green-600 text-white border-green-600"
                    : typeof page === 'number'
                    ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    : "bg-white text-gray-400 border-gray-300 cursor-default"
                }`}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              Next →
            </button>
          </nav>
        </div>
      )}

      {totalPages > 1 && (
        <div className="lg:hidden text-center mb-6">
          <p className="text-gray-600 text-sm">
            Menampilkan {startIndex + 1}-{Math.min(startIndex + perPage, filteredProduk.length)} dari {filteredProduk.length} produk
          </p>
        </div>
      )}

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

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white pt-24">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Memuat...</span>
        </div>
      </div>
    }>
      <CollectionContent />
    </Suspense>
  );
}