'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import LayoutAdmin from '../../../../components/LayoutAdmin'
import Link from 'next/link'

interface User {
  id_user: number;
  username: string;
  nama: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Kategori {
  id_kategori: number;
  nama_kategori: string;
}

interface Maker {
  id_maker: number;
  nama_maker: string;
}

interface ProductFormData {
  nama_produk: string;
  slug: string;
  harga: string;
  id_kategori: string;
  id_maker: string;
  deskripsi_singkat: string;
  deskripsi_lengkap: string;
  bahan_bilah: string;
  bahan_gagang: string;
  bahan_sarung: string;
  panjang_bilah: string;
  lebar_bilah: string;
  tebal_bilah: string;
  berat: string;
  video_demo: string;
  status_tampil: boolean;
}

export default function EditProduct() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [makerList, setMakerList] = useState<Maker[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [formData, setFormData] = useState<ProductFormData>({
    nama_produk: '',
    slug: '',
    harga: '',
    id_kategori: '',
    id_maker: '',
    deskripsi_singkat: '',
    deskripsi_lengkap: '',
    bahan_bilah: '',
    bahan_gagang: '',
    bahan_sarung: '',
    panjang_bilah: '',
    lebar_bilah: '',
    tebal_bilah: '',
    berat: '',
    video_demo: '',
    status_tampil: true
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          if (userData.role !== 'admin') {
            router.push('/')
            return
          }
          setUser(userData)
          await Promise.all([fetchKategori(), fetchMakers(), fetchProduct()])
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const product = result.data
          setFormData({
            nama_produk: product.nama_produk,
            slug: product.slug,
            harga: product.harga?.toString() || '',
            id_kategori: product.id_kategori?.toString() || '',
            id_maker: product.id_maker?.toString() || '',
            deskripsi_singkat: product.deskripsi_singkat || '',
            deskripsi_lengkap: product.deskripsi_lengkap || '',
            bahan_bilah: product.bahan_bilah || '',
            bahan_gagang: product.bahan_gagang || '',
            bahan_sarung: product.bahan_sarung || '',
            panjang_bilah: product.panjang_bilah?.toString() || '',
            lebar_bilah: product.lebar_bilah?.toString() || '',
            tebal_bilah: product.tebal_bilah?.toString() || '',
            berat: product.berat?.toString() || '',
            video_demo: product.video_demo || '',
            status_tampil: product.status_tampil
          })
        } else {
          throw new Error(result.error || 'Failed to fetch product')
        }
      } else {
        throw new Error('Failed to fetch product')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setFetchError('Gagal memuat data produk')
    }
  }

  const fetchKategori = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setKategoriList(result.data || [])
        } else {
          setKategoriList([])
          setFetchError('Gagal memuat data kategori')
        }
      } else {
        console.error('Failed to fetch categories:', response.status)
        setKategoriList([])
        setFetchError('Gagal memuat data kategori')
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setKategoriList([])
      setFetchError('Error: Gagal memuat data kategori')
    }
  }

  const fetchMakers = async () => {
    try {
      const response = await fetch('/api/admin/makers')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMakerList(result.data || [])
        } else {
          setMakerList([])
          setFetchError('Gagal memuat data maker')
        }
      } else {
        console.error('Failed to fetch makers:', response.status)
        setMakerList([])
        setFetchError('Gagal memuat data maker')
      }
    } catch (error) {
      console.error('Failed to fetch makers:', error)
      setMakerList([])
      setFetchError('Error: Gagal memuat data maker')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Auto-generate slug from product name
    if (name === 'nama_produk') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        ...formData,
        harga: formData.harga ? parseFloat(formData.harga) : null,
        panjang_bilah: formData.panjang_bilah ? parseFloat(formData.panjang_bilah) : null,
        lebar_bilah: formData.lebar_bilah ? parseFloat(formData.lebar_bilah) : null,
        tebal_bilah: formData.tebal_bilah ? parseFloat(formData.tebal_bilah) : null,
        berat: formData.berat ? parseFloat(formData.berat) : null,
        id_kategori: formData.id_kategori ? parseInt(formData.id_kategori) : null,
        id_maker: formData.id_maker ? parseInt(formData.id_maker) : null,
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update product')
      }

      const result = await response.json()

      if (result.success) {
        router.push('/admin/products?message=Produk berhasil diupdate')
      } else {
        throw new Error(result.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      alert(`Gagal mengupdate produk: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
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
    <LayoutAdmin user={user} title="Edit Produk">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200">
          <div className="px-6 py-5 border-b border-amber-200">
            <h2 className="text-lg font-semibold text-amber-900">Edit Produk</h2>
            <p className="text-sm text-amber-600 mt-1">Edit informasi produk</p>
            
            {fetchError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{fetchError}</p>
                <p className="text-xs text-red-500 mt-1">
                  Silakan refresh halaman atau coba lagi nanti.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informasi Dasar */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-amber-800 border-b border-amber-200 pb-2">
                📝 Informasi Dasar
              </h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    name="nama_produk"
                    value={formData.nama_produk}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Masukkan nama produk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50"
                    placeholder="Slug akan otomatis terisi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    name="harga"
                    value={formData.harga}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Kategori
                  </label>
                  <select
                    name="id_kategori"
                    value={formData.id_kategori}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriList.map(kategori => (
                      <option key={kategori.id_kategori} value={kategori.id_kategori}>
                        {kategori.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Maker/Pembuat
                  </label>
                  <select
                    name="id_maker"
                    value={formData.id_maker}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Pilih Maker</option>
                    {makerList.map(maker => (
                      <option key={maker.id_maker} value={maker.id_maker}>
                        {maker.nama_maker}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="status_tampil"
                    checked={formData.status_tampil}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <label className="ml-2 text-sm font-medium text-amber-700">
                    Tampilkan di website
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="deskripsi_singkat"
                  value={formData.deskripsi_singkat}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Deskripsi singkat tentang produk..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1">
                  Deskripsi Lengkap
                </label>
                <textarea
                  name="deskripsi_lengkap"
                  value={formData.deskripsi_lengkap}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Deskripsi lengkap tentang produk..."
                />
              </div>
            </div>

            {/* Spesifikasi Teknis */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-amber-800 border-b border-amber-200 pb-2">
                🔧 Spesifikasi Teknis
              </h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Bahan Bilah
                  </label>
                  <input
                    type="text"
                    name="bahan_bilah"
                    value={formData.bahan_bilah}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Contoh: Baja Karbon Tinggi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Bahan Gagang
                  </label>
                  <input
                    type="text"
                    name="bahan_gagang"
                    value={formData.bahan_gagang}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Contoh: Kayu Jati"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Bahan Sarung
                  </label>
                  <input
                    type="text"
                    name="bahan_sarung"
                    value={formData.bahan_sarung}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Contoh: Kulit Sapi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Panjang Bilah (cm)
                  </label>
                  <input
                    type="number"
                    name="panjang_bilah"
                    value={formData.panjang_bilah}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                    step="0.1"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Lebar Bilah (cm)
                  </label>
                  <input
                    type="number"
                    name="lebar_bilah"
                    value={formData.lebar_bilah}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                    step="0.1"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Tebal Bilah (cm)
                  </label>
                  <input
                    type="number"
                    name="tebal_bilah"
                    value={formData.tebal_bilah}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Berat (gram)
                  </label>
                  <input
                    type="number"
                    name="berat"
                    value={formData.berat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                    step="1"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-amber-800 border-b border-amber-200 pb-2">
                🖼️ Media & Gambar
              </h3>

              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1">
                  Video Demo (URL YouTube)
                </label>
                <input
                  type="url"
                  name="video_demo"
                  value={formData.video_demo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="https://youtube.com/embed/..."
                />
              </div>

              <div className="text-center py-4">
                <Link
                  href={`/admin/products/${productId}/images`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📁 Kelola Gambar Produk
                </Link>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-amber-200">
              <Link
                href="/admin/products"
                className="px-6 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Menyimpan...' : 'Update Produk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayoutAdmin>
  )
}