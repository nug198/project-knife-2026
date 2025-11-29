'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LayoutAdmin from '../../components/LayoutAdmin'

interface Kategori {
  id_kategori: number;
  nama_kategori: string;
  slug: string;
  deskripsi: string | null;
  created_at: string;
  updated_at: string;
  _count?: {
    produk: number;
  };
  produk?: Array<{
    gambar_produk: Array<{
      url_gambar: string;
    }>;
  }>;
}

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Kategori | null>(null)
  const [formData, setFormData] = useState({
    nama_kategori: '',
    deskripsi: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Gagal memuat data kategori')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      nama_kategori: '',
      deskripsi: ''
    })
    setEditingCategory(null)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const slug = generateSlug(formData.nama_kategori)
      const payload = {
        ...formData,
        slug
      }

      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id_kategori}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(editingCategory ? 'Kategori berhasil diupdate' : 'Kategori berhasil ditambahkan')
        setShowModal(false)
        resetForm()
        fetchCategories()
      } else {
        throw new Error(result.error || 'Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: Kategori) => {
    setEditingCategory(category)
    setFormData({
      nama_kategori: category.nama_kategori,
      deskripsi: category.deskripsi || ''
    })
    setShowModal(true)
  }

  // PERBAIKAN: Handle delete dengan pengecekan produk yang lebih sederhana
  const handleDelete = async (id: number, category: Kategori) => {
    // Cek apakah kategori memiliki produk
    const productCount = category._count?.produk || 0;
    
    if (productCount > 0) {
      setError(`Tidak dapat menghapus kategori "${category.nama_kategori}" karena memiliki ${productCount} produk. Hapus produk terlebih dahulu.`);
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${category.nama_kategori}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Kategori berhasil dihapus');
        fetchCategories();
      } else {
        throw new Error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const getFirstProductImage = (category: Kategori) => {
    if (!category.produk || category.produk.length === 0) {
      return '/images/placeholder-product.jpg'
    }

    const firstProduct = category.produk[0]
    if (!firstProduct.gambar_produk || firstProduct.gambar_produk.length === 0) {
      return '/images/placeholder-product.jpg'
    }

    return firstProduct.gambar_produk[0].url_gambar
  }

  // PERBAIKAN: Fungsi untuk mendapatkan info produk yang lebih sederhana
  const getProductInfo = (category: Kategori) => {
    const productCount = category._count?.produk || 0;
    return {
      count: productCount,
      hasProducts: productCount > 0,
      message: productCount > 0 
        ? `${productCount} produk` 
        : 'Tidak ada produk'
    };
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
    <LayoutAdmin user={user} title="Kelola Kategori">
      <div className="space-y-6">
        {/* Header dengan Tombol Tambah */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-amber-600">Kelola kategori produk</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Tambah Kategori
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Tabel Kategori */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="ml-3 text-amber-600">Memuat data...</span>
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
                      Nama Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Jumlah Produk
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-amber-600">
                        Belum ada kategori. Mulai dengan menambahkan kategori pertama.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => {
                      const productInfo = getProductInfo(category);
                      
                      return (
                        <tr key={category.id_kategori} className="hover:bg-amber-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-100 flex items-center justify-center">
                              <img
                                src={getFirstProductImage(category)}
                                alt={category.nama_kategori}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/images/placeholder-product.jpg'
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-amber-900">
                              {category.nama_kategori}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-amber-600 font-mono">
                              {category.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-amber-700 max-w-xs truncate">
                              {category.deskripsi || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              productInfo.hasProducts 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {productInfo.message}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              {/* TOMBOL EDIT - HIJAU */}
                              <button
                                onClick={() => handleEdit(category)}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm border border-green-700"
                              >
                                Edit
                              </button>

                              {/* TOMBOL HAPUS - MERAH (SELALU AKTIF) */}
                              <button
                                onClick={() => handleDelete(category.id_kategori, category)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm border border-red-700"
                                title={productInfo.hasProducts ? `Tidak dapat dihapus: ${productInfo.message}` : 'Hapus kategori'}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit Kategori */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-amber-900">
                  {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-amber-400 hover:text-amber-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="nama_kategori" className="block text-sm font-medium text-amber-700">
                      Nama Kategori *
                    </label>
                    <div className="group relative">
                      <svg className="w-4 h-4 text-amber-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 text-center z-10">
                        Masukkan nama kategori produk. Contoh: "Pisau Chef", "Pisau Hunting"
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    id="nama_kategori"
                    name="nama_kategori"
                    value={formData.nama_kategori}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Contoh: Pisau Dapur, Pisau Outdoor"
                  />
                  <p className="text-xs text-amber-600 mt-1">
                    Slug akan dibuat otomatis: <span className="font-mono bg-amber-100 px-1 rounded">{generateSlug(formData.nama_kategori)}</span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="deskripsi" className="block text-sm font-medium text-amber-700">
                      Deskripsi
                    </label>
                    <div className="group relative">
                      <svg className="w-4 h-4 text-amber-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 text-center z-10">
                        Deskripsi singkat tentang kategori (opsional)
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                  <textarea
                    id="deskripsi"
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500 resize-none"
                    placeholder="Jelaskan tentang kategori ini... (opsional)"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.nama_kategori.trim()}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      editingCategory ? 'Update' : 'Simpan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </LayoutAdmin>
  )
}