'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LayoutAdmin from '../../components/LayoutAdmin'
import Link from 'next/link'

interface Produk {
  id_produk: number;
  nama_produk: string;
  slug: string;
  harga: number | null;
  id_kategori: number | null;
  id_maker: number | null;
  deskripsi_singkat: string | null;
  deskripsi_lengkap: string | null;
  bahan_bilah: string | null;
  bahan_gagang: string | null;
  bahan_sarung: string | null;
  panjang_bilah: number | null;
  lebar_bilah: number | null;
  tebal_bilah: number | null;
  berat: number | null;
  video_demo: string | null;
  status_tampil: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
  kategori?: {
    nama_kategori: string;
  };
  maker?: {
    nama_maker: string;
  };
  gambar_produk: Array<{
    id_gambar: number;
    gambar: string;
    url_gambar: string;
    keterangan: string;
    urutan: number;
  }>;
}

interface Kategori {
  id_kategori: number;
  nama_kategori: string;
}

interface Maker {
  id_maker: number;
  nama_maker: string;
}

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Produk[]>([])
  const [categories, setCategories] = useState<Kategori[]>([])
  const [makers, setMakers] = useState<Maker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchCategories()
      fetchMakers()
    }
  }, [user])

  // Check URL parameters for success messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    if (message) {
      setSuccess(message)
      // Clean URL
      window.history.replaceState({}, '', '/admin/products')
    }
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('🔄 Fetching products...')
      
      const response = await fetch('/api/admin/products')
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Response not OK:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📦 API Response:', result)
      
      if (result.success) {
        setProducts(result.data || [])
        console.log(`✅ Loaded ${result.data?.length || 0} products`)
      } else {
        throw new Error(result.error || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error)
      setError(`Gagal memuat data produk: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCategories(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchMakers = async () => {
    try {
      const response = await fetch('/api/admin/makers')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMakers(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching makers:', error)
    }
  }

  const handleDelete = async (id: number, productName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
        return
    }

    try {
        console.log(`🗑️ Deleting product ID: ${id}`)
        
        const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        })

        console.log(`📨 Delete response status: ${response.status}`)

        if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
            const errorData = await response.json()
            console.error('❌ Delete error response:', errorData)
            errorMessage = errorData.error || errorData.message || errorMessage
            
            // Tambahkan informasi lebih spesifik
            if (errorData.message) {
            errorMessage += ` - ${errorData.message}`
            }
        } catch (parseError) {
            console.error('❌ Failed to parse error response:', parseError)
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log('✅ Delete result:', result)

        if (result.success) {
        setSuccess('Produk berhasil dihapus')
        // Clear error jika ada
        setError('')
        fetchProducts() // Refresh the list
        } else {
        throw new Error(result.error || 'Failed to delete product')
        }
    } catch (error) {
        console.error('❌ Error deleting product:', error)
        setError(`Gagal menghapus produk: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Clear success message jika ada
        setSuccess('')
    }
  }

  const getFirstProductImage = (product: Produk) => {
    if (!product.gambar_produk || product.gambar_produk.length === 0) {
      return '/images/placeholder-product.jpg'
    }

    // Urutkan berdasarkan urutan dan ambil gambar pertama
    const sortedImages = [...product.gambar_produk].sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
    return sortedImages[0].url_gambar || '/images/placeholder-product.jpg'
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDimensions = (product: Produk) => {
    const parts = []
    if (product.panjang_bilah) parts.push(`P:${product.panjang_bilah}cm`)
    if (product.lebar_bilah) parts.push(`L:${product.lebar_bilah}cm`)
    if (product.tebal_bilah) parts.push(`T:${product.tebal_bilah}cm`)
    return parts.length > 0 ? parts.join(' | ') : '-'
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <LayoutAdmin user={user} title="Kelola Produk">
      <div className="space-y-6">
        {/* Header dengan Tombol Tambah */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-amber-600">Kelola produk dan item yang dijual</p>
          </div>
          <Link
            href="/admin/products/add"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Tambah Produk
          </Link>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Dependency Check */}
        {(categories.length === 0 || makers.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              ⚠️ Perhatian: Dependency Required
            </h3>
            <p className="text-sm text-yellow-700">
              Untuk menambahkan produk, Anda perlu memiliki:
            </p>
            <ul className="text-sm text-yellow-600 mt-1 list-disc list-inside">
              {categories.length === 0 && <li>Minimal 1 kategori</li>}
              {makers.length === 0 && <li>Minimal 1 maker</li>}
            </ul>
            <div className="mt-3 flex gap-3">
              {categories.length === 0 && (
                <Link 
                  href="/admin/categories" 
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Tambah Kategori
                </Link>
              )}
              {makers.length === 0 && (
                <Link 
                  href="/admin/makers" 
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Tambah Maker
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Tabel Produk */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="ml-3 text-amber-600">Memuat data produk...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Nama Produk
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Maker
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-amber-600">
                        {error ? (
                          <div>
                            <p>Gagal memuat data produk.</p>
                            <button
                              onClick={fetchProducts}
                              className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                              Coba Muat Ulang
                            </button>
                          </div>
                        ) : (
                          'Belum ada produk. Mulai dengan menambahkan produk pertama.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id_produk} className="hover:bg-amber-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-100 flex items-center justify-center">
                            <img
                              src={getFirstProductImage(product)}
                              alt={product.nama_produk}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/placeholder-product.jpg'
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-amber-900">
                            {product.nama_produk}
                          </div>
                          <div className="text-xs text-amber-600 font-mono mt-1">
                            {product.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-amber-700">
                            {product.kategori?.nama_kategori || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-amber-700">
                            {product.maker?.nama_maker || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-amber-900">
                            {formatPrice(product.harga)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status_tampil 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status_tampil ? 'Tampil' : 'Disembunyikan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/products/edit/${product.id_produk}`}
                              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id_produk, product.nama_produk)}
                              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Hapus
                            </button>
                            <Link
                              href={`/admin/products/${product.id_produk}/images`}
                              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Gambar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </LayoutAdmin>
  )
}