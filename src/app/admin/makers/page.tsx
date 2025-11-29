'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LayoutAdmin from '../../components/LayoutAdmin'

interface Maker {
  id_maker: number;
  nama_maker: string;
  profil: string | null;
  lokasi: string | null;
  kontak: string | null;
  foto_url: string | null;
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

export default function MakersPage() {
  const { user, loading: authLoading } = useAuth()
  const [makers, setMakers] = useState<Maker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMaker, setEditingMaker] = useState<Maker | null>(null)
  const [formData, setFormData] = useState({
    nama_maker: '',
    profil: '',
    lokasi: '',
    kontak: '',
    foto_url: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMakers()
    }
  }, [user])

  const fetchMakers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/makers')
      
      if (!response.ok) {
        throw new Error('Failed to fetch makers')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setMakers(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch makers')
      }
    } catch (error) {
      console.error('Error fetching makers:', error)
      setError('Gagal memuat data maker')
    } finally {
      setLoading(false)
    }
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
      nama_maker: '',
      profil: '',
      lokasi: '',
      kontak: '',
      foto_url: ''
    })
    setEditingMaker(null)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...formData,
        profil: formData.profil || null,
        lokasi: formData.lokasi || null,
        kontak: formData.kontak || null,
        foto_url: formData.foto_url || null
      }

      const url = editingMaker 
        ? `/api/admin/makers/${editingMaker.id_maker}`
        : '/api/admin/makers'
      
      const method = editingMaker ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(editingMaker ? 'Maker berhasil diupdate' : 'Maker berhasil ditambahkan')
        setShowModal(false)
        resetForm()
        fetchMakers()
      } else {
        throw new Error(result.error || 'Failed to save maker')
      }
    } catch (error) {
      console.error('Error saving maker:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (maker: Maker) => {
    setEditingMaker(maker)
    setFormData({
      nama_maker: maker.nama_maker,
      profil: maker.profil || '',
      lokasi: maker.lokasi || '',
      kontak: maker.kontak || '',
      foto_url: maker.foto_url || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number, maker: Maker) => {
    const productCount = maker._count?.produk || 0;
    
    if (productCount > 0) {
        setError(`Tidak dapat menghapus maker "${maker.nama_maker}" karena memiliki ${productCount} produk. Hapus produk terlebih dahulu.`);
        return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus maker "${maker.nama_maker}"?`)) {
        return;
    }

    try {
        console.log('Deleting maker with ID:', id); // Debug log
        
        const response = await fetch(`/api/admin/makers/${id}`, {
        method: 'DELETE',
        });

        const result = await response.json();

        if (response.ok) {
        setSuccess('Maker berhasil dihapus');
        fetchMakers();
        } else {
        throw new Error(result.error || 'Failed to delete maker');
        }
    } catch (error) {
        console.error('Error deleting maker:', error);
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

  const getFirstProductImage = (maker: Maker) => {
    if (!maker.produk || maker.produk.length === 0) {
      return maker.foto_url || '/images/placeholder-maker.jpg'
    }

    const firstProduct = maker.produk[0]
    if (!firstProduct.gambar_produk || firstProduct.gambar_produk.length === 0) {
      return maker.foto_url || '/images/placeholder-maker.jpg'
    }

    return firstProduct.gambar_produk[0].url_gambar
  }

  const getProductInfo = (maker: Maker) => {
    const productCount = maker._count?.produk || 0;
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
    <LayoutAdmin user={user} title="Kelola Maker">
      <div className="space-y-6">
        {/* Header dengan Tombol Tambah */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-amber-600">Kelola maker/pembuat produk</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Tambah Maker
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

        {/* Tabel Maker */}
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
                      Foto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Nama Maker
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Profil
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
                  {makers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-amber-600">
                        Belum ada maker. Mulai dengan menambahkan maker pertama.
                      </td>
                    </tr>
                  ) : (
                    makers.map((maker) => {
                      const productInfo = getProductInfo(maker);
                      
                      return (
                        <tr key={maker.id_maker} className="hover:bg-amber-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-100 flex items-center justify-center">
                              <img
                                src={getFirstProductImage(maker)}
                                alt={maker.nama_maker}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/images/placeholder-maker.jpg'
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-amber-900">
                              {maker.nama_maker}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-amber-600">
                              {maker.lokasi || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-amber-600">
                              {maker.kontak || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-amber-700 max-w-xs truncate">
                              {maker.profil || '-'}
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
                              <button
                                onClick={() => handleEdit(maker)}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm border border-green-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(maker.id_maker, maker)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm border border-red-700"
                                title={productInfo.hasProducts ? `Tidak dapat dihapus: ${productInfo.message}` : 'Hapus maker'}
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

      {/* Modal Tambah/Edit Maker */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-amber-900">
                  {editingMaker ? 'Edit Maker' : 'Tambah Maker'}
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
                  <label htmlFor="nama_maker" className="block text-sm font-medium text-amber-700 mb-1">
                    Nama Maker *
                  </label>
                  <input
                    type="text"
                    id="nama_maker"
                    name="nama_maker"
                    value={formData.nama_maker}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Contoh: Jefri, Adi, Blacksmith Co."
                  />
                </div>

                <div>
                  <label htmlFor="lokasi" className="block text-sm font-medium text-amber-700 mb-1">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    id="lokasi"
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Contoh: Bandung, Jawa Barat"
                  />
                </div>

                <div>
                  <label htmlFor="kontak" className="block text-sm font-medium text-amber-700 mb-1">
                    Kontak
                  </label>
                  <input
                    type="text"
                    id="kontak"
                    name="kontak"
                    value={formData.kontak}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Contoh: 08123456789, @username_ig"
                  />
                </div>

                <div>
                  <label htmlFor="foto_url" className="block text-sm font-medium text-amber-700 mb-1">
                    URL Foto
                  </label>
                  <input
                    type="url"
                    id="foto_url"
                    name="foto_url"
                    value={formData.foto_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="https://example.com/foto-maker.jpg"
                  />
                </div>

                <div>
                  <label htmlFor="profil" className="block text-sm font-medium text-amber-700 mb-1">
                    Profil
                  </label>
                  <textarea
                    id="profil"
                    name="profil"
                    value={formData.profil}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500 resize-none"
                    placeholder="Jelaskan profil dan keahlian maker..."
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
                    disabled={submitting || !formData.nama_maker.trim()}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      editingMaker ? 'Update' : 'Simpan'
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