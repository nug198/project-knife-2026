'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface ProductImage {
  id_gambar: number;
  gambar: string;
  url_gambar: string;
  keterangan: string;
  urutan: number;
}

interface Product {
  id_produk: number;
  nama_produk: string;
  gambar_produk: ProductImage[];
}

export default function ProductImagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

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
          fetchProduct()
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setProduct(result.data)
        } else {
          setError('Gagal memuat data produk')
        }
      } else {
        setError('Gagal memuat data produk')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setError('Error: Gagal memuat data produk')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', files[0])
      formData.append('id_produk', productId)
      formData.append('urutan', (product?.gambar_produk.length || 0 + 1).toString())

      const response = await fetch('/api/admin/products/images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const result = await response.json()
      if (result.success) {
        setSuccess('Gambar berhasil diupload')
        fetchProduct() // Refresh images
      } else {
        throw new Error(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      setError(`Gagal upload gambar: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      e.target.value = '' // Reset input
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete image')
      }

      const result = await response.json()
      if (result.success) {
        setSuccess('Gambar berhasil dihapus')
        fetchProduct() // Refresh images
      } else {
        throw new Error(result.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
      setError(`Gagal menghapus gambar: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const updateImageOrder = async (imageId: number, newUrutan: number) => {
    try {
      const response = await fetch(`/api/admin/products/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urutan: newUrutan }),
      })

      if (!response.ok) {
        throw new Error('Failed to update image order')
      }

      fetchProduct() // Refresh images
    } catch (error) {
      console.error('Failed to update image order:', error)
      setError('Gagal mengupdate urutan gambar')
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
    <LayoutAdmin user={user} title="Kelola Gambar Produk">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">
              Kelola Gambar Produk
            </h1>
            <p className="text-amber-600">
              {product?.nama_produk || 'Loading...'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Kembali
            </Link>
            <Link
              href={`/admin/products/edit/${productId}`}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Produk
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-4">
            Upload Gambar Baru
          </h2>
          
          <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploading || (product?.gambar_produk.length || 0) >= 3}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors ${
                uploading || (product?.gambar_produk.length || 0) >= 3 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : '📁 Pilih Gambar'}
            </label>
            <p className="text-sm text-amber-600 mt-2">
              Format: JPEG, PNG, WebP | Maksimal: 2MB | Dimensi: 500x500 - 2000x2000 pixels
            </p>
            <p className="text-xs text-amber-500 mt-1">
              Maksimal 3 gambar per produk ({product?.gambar_produk.length || 0}/3 digunakan)
            </p>
          </div>
        </div>

        {/* Current Images */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-4">
            Gambar Saat Ini ({product?.gambar_produk.length || 0})
          </h2>

          {!product?.gambar_produk || product.gambar_produk.length === 0 ? (
            <div className="text-center py-8 text-amber-600">
              <p>Belum ada gambar untuk produk ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.gambar_produk
                .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
                .map((image, index) => (
                  <div key={image.id_gambar} className="border border-amber-200 rounded-lg p-4">
                    <div className="relative aspect-square mb-3">
                      <img
                        src={image.url_gambar}
                        alt={`Gambar ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-amber-700">
                          Gambar #{image.urutan}
                        </span>
                        <div className="flex gap-1">
                          {index > 0 && (
                            <button
                              onClick={() => updateImageOrder(image.id_gambar, image.urutan - 1)}
                              className="p-1 text-amber-600 hover:text-amber-800"
                              title="Pindah ke atas"
                            >
                              ↑
                            </button>
                          )}
                          {index < product.gambar_produk.length - 1 && (
                            <button
                              onClick={() => updateImageOrder(image.id_gambar, image.urutan + 1)}
                              className="p-1 text-amber-600 hover:text-amber-800"
                              title="Pindah ke bawah"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(image.id_gambar)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Hapus gambar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        value={image.keterangan}
                        onChange={async (e) => {
                          // Update keterangan
                          try {
                            const response = await fetch(`/api/admin/products/images/${image.id_gambar}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ 
                                keterangan: e.target.value,
                                urutan: image.urutan
                              }),
                            })
                            
                            if (response.ok) {
                              fetchProduct() // Refresh
                            }
                          } catch (error) {
                            console.error('Failed to update image description:', error)
                          }
                        }}
                        placeholder="Keterangan gambar"
                        className="w-full px-2 py-1 text-sm border border-amber-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </LayoutAdmin>
  )
}