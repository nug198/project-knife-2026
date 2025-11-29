'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LayoutAdmin from '../../../components/LayoutAdmin'
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

interface ImageFile {
  file: File;
  preview: string;
  keterangan: string;
  urutan: number;
}

export default function AddProduct() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [makerList, setMakerList] = useState<Maker[]>([])
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const router = useRouter()

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
          await Promise.all([fetchKategori(), fetchMakers()])
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
  }, [router])

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

  // Check if dependencies are available
  const hasDependencies = kategoriList.length > 0 && makerList.length > 0

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

  // Tambahkan konstanta validasi di bagian atas komponen
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_IMAGES = 3;

  // Perbaiki fungsi handleImageUpload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Check if adding these images would exceed the limit
    if (imageFiles.length + files.length > MAX_IMAGES) {
        alert(`Maksimal ${MAX_IMAGES} gambar per produk`)
        e.target.value = '' // Reset input
        return
    }

    const newImages: ImageFile[] = []
    
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
        // Client-side validation for file type and size
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            alert(`File ${file.name} bukan gambar yang diizinkan (hanya JPEG, PNG, WebP)`)
            return
        }
        
        if (file.size > MAX_FILE_SIZE) {
            alert(`File ${file.name} terlalu besar (maksimal 2MB)`)
            return
        }

        const preview = URL.createObjectURL(file)
        newImages.push({
            file,
            preview,
            keterangan: '',
            urutan: imageFiles.length + index + 1
        })
        }
    })

    setImageFiles(prev => [...prev, ...newImages])
    e.target.value = '' // Reset input after selection
  }

  const removeImage = (index: number) => {
    const newImages = imageFiles.filter((_, i) => i !== index)
    URL.revokeObjectURL(imageFiles[index].preview)
    setImageFiles(newImages.map((img, i) => ({ ...img, urutan: i + 1 })))
  }

  const updateImageInfo = (index: number, field: string, value: string | number) => {
    const newImages = [...imageFiles]
    newImages[index] = { ...newImages[index], [field]: value }
    setImageFiles(newImages)
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === imageFiles.length - 1)
    ) return

    const newImages = [...imageFiles]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
    
    const updatedImages = newImages.map((img, i) => ({ ...img, urutan: i + 1 }))
    setImageFiles(updatedImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate dependencies
    if (!hasDependencies) {
      alert('Harus ada setidaknya 1 kategori dan 1 maker sebelum menambah produk')
      return
    }

    setSubmitting(true)

    try {
      // 1. Create product first
      const productResponse = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          harga: formData.harga ? parseFloat(formData.harga) : null,
          panjang_bilah: formData.panjang_bilah ? parseFloat(formData.panjang_bilah) : null,
          lebar_bilah: formData.lebar_bilah ? parseFloat(formData.lebar_bilah) : null,
          tebal_bilah: formData.tebal_bilah ? parseFloat(formData.tebal_bilah) : null,
          berat: formData.berat ? parseFloat(formData.berat) : null,
          id_kategori: formData.id_kategori ? parseInt(formData.id_kategori) : null,
          id_maker: formData.id_maker ? parseInt(formData.id_maker) : null,
        }),
      })

      if (!productResponse.ok) {
        const errorData = await productResponse.json()
        throw new Error(errorData.error || 'Failed to create product')
      }

      const productData = await productResponse.json()
      const productId = productData.data.id_produk

      // 2. Upload images if any
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (imageFile) => {
          const formDataImage = new FormData()
          formDataImage.append('image', imageFile.file)
          formDataImage.append('id_produk', productId.toString())
          formDataImage.append('keterangan', imageFile.keterangan)
          formDataImage.append('urutan', imageFile.urutan.toString())

          const imageResponse = await fetch('/api/admin/products/images', {
            method: 'POST',
            body: formDataImage,
          })

          if (!imageResponse.ok) {
            throw new Error(`Failed to upload image: ${imageFile.file.name}`)
          }

          return imageResponse.json()
        })

        await Promise.all(uploadPromises)
      }

      // 3. Redirect to products list
      router.push('/admin/products?message=Produk berhasil dibuat')
    } catch (error) {
      console.error('Failed to create product:', error)
      alert(`Gagal membuat produk: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imageFiles.forEach(image => URL.revokeObjectURL(image.preview))
    }
  }, [imageFiles])

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
    <LayoutAdmin user={user} title="Tambah Produk Baru">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200">
          <div className="px-6 py-5 border-b border-amber-200">
            <h2 className="text-lg font-semibold text-amber-900">Tambah Produk Baru</h2>
            <p className="text-sm text-amber-600 mt-1">Isi form berikut untuk menambahkan produk baru</p>
            
            {fetchError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{fetchError}</p>
                <p className="text-xs text-red-500 mt-1">
                  Silakan refresh halaman atau coba lagi nanti.
                </p>
              </div>
            )}

            {/* Dependency Warning */}
            {!hasDependencies && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  ⚠️ Perhatian: Dependency Required
                </h3>
                <p className="text-sm text-yellow-700">
                  Untuk menambahkan produk, Anda perlu memiliki:
                </p>
                <ul className="text-sm text-yellow-600 mt-1 list-disc list-inside">
                  {kategoriList.length === 0 && <li>Minimal 1 kategori</li>}
                  {makerList.length === 0 && <li>Minimal 1 maker</li>}
                </ul>
                <div className="mt-3 flex gap-3">
                  {kategoriList.length === 0 && (
                    <Link 
                      href="/admin/categories" 
                      className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Tambah Kategori
                    </Link>
                  )}
                  {makerList.length === 0 && (
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50 disabled:opacity-50"
                    placeholder="Slug akan otomatis terisi"
                    readOnly
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies || kategoriList.length === 0}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriList.map(kategori => (
                      <option key={kategori.id_kategori} value={kategori.id_kategori}>
                        {kategori.nama_kategori}
                      </option>
                    ))}
                  </select>
                  {kategoriList.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Belum ada kategori</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">
                    Maker/Pembuat
                  </label>
                  <select
                    name="id_maker"
                    value={formData.id_maker}
                    onChange={handleInputChange}
                    disabled={!hasDependencies || makerList.length === 0}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Pilih Maker</option>
                    {makerList.map(maker => (
                      <option key={maker.id_maker} value={maker.id_maker}>
                        {maker.nama_maker}
                      </option>
                    ))}
                  </select>
                  {makerList.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Belum ada maker</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="status_tampil"
                    checked={formData.status_tampil}
                    onChange={handleInputChange}
                    disabled={!hasDependencies}
                    className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 disabled:opacity-50"
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
                  disabled={!hasDependencies}
                  rows={3}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={!hasDependencies}
                  rows={6}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!hasDependencies}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={!hasDependencies}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://youtube.com/embed/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1">
                  Upload Gambar Produk
                </label>
                <div className={`border-2 border-dashed border-amber-300 rounded-lg p-6 text-center ${!hasDependencies ? 'opacity-50' : ''}`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={!hasDependencies}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors ${!hasDependencies ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    📁 Pilih Gambar
                  </label>
                  <p className="text-sm text-amber-600 mt-2">
                    Drag & drop gambar atau klik untuk memilih (Multiple files allowed)
                  </p>
                </div>
              </div>

              {/* Image Preview & Management */}
              {imageFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-amber-700">Gambar yang akan diupload:</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {imageFiles.map((image, index) => (
                      <div key={index} className="border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-amber-700">
                                Gambar #{image.urutan}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'up')}
                                  disabled={index === 0 || !hasDependencies}
                                  className="p-1 text-amber-600 hover:text-amber-800 disabled:opacity-50"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'down')}
                                  disabled={index === imageFiles.length - 1 || !hasDependencies}
                                  className="p-1 text-amber-600 hover:text-amber-800 disabled:opacity-50"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  disabled={!hasDependencies}
                                  className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={image.keterangan}
                              onChange={(e) => updateImageInfo(index, 'keterangan', e.target.value)}
                              disabled={!hasDependencies}
                              placeholder="Keterangan gambar (opsional)"
                              className="w-full px-2 py-1 text-sm border border-amber-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-amber-200">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-6 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || !hasDependencies || fetchError !== null}
                className="px-6 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayoutAdmin>
  )
}