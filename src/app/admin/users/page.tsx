'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LayoutAdmin from '../../components/LayoutAdmin'

interface User {
  id_user: number;
  username: string;
  password: string;
  nama: string;
  email: string;
  avatar: string | null;
  role: string;
  last_login: string | null;
  created_at: string;
  updated_at: string | null;
  _count?: {
    artikel: number;
  };
}

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    email: '',
    role: 'admin'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setUsers(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nama: '',
      email: '',
      role: 'admin'
    })
    setEditingUser(null)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
        // Buat payload dasar
        const basePayload = {
        username: formData.username,
        nama: formData.nama,
        email: formData.email,
        role: formData.role,
        avatar: '/images/avatars/avatar1.jpg'
        }

        // Untuk create, selalu sertakan password
        if (!editingUser) {
        const payload = {
            ...basePayload,
            password: formData.password
        }

        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const result = await response.json()

        if (response.ok) {
            setSuccess('User berhasil ditambahkan')
            setShowModal(false)
            resetForm()
            fetchUsers()
        } else {
            throw new Error(result.error || 'Failed to save user')
        }
        } else {
        // Untuk edit, buat payload tanpa password jika kosong
        const payload = formData.password 
            ? { ...basePayload, password: formData.password }
            : basePayload

        const response = await fetch(`/api/admin/users/${editingUser.id_user}`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const result = await response.json()

        if (response.ok) {
            setSuccess('User berhasil diupdate')
            setShowModal(false)
            resetForm()
            fetchUsers()
        } else {
            throw new Error(result.error || 'Failed to save user')
        }
        }
    } catch (error) {
        console.error('Error saving user:', error)
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
        setSubmitting(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '', // Kosongkan password saat edit
      nama: user.nama,
      email: user.email,
      role: user.role
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number, user: User) => {
    // Cek apakah user yang akan dihapus adalah user yang sedang login
    if (currentUser && user.id_user === currentUser.id_user) {
      setError('Tidak dapat menghapus user yang sedang login');
      return;
    }

    // Cek apakah user memiliki artikel
    const articleCount = user._count?.artikel || 0;
    
    if (articleCount > 0) {
      setError(`Tidak dapat menghapus user "${user.nama}" karena memiliki ${articleCount} artikel. Hapus artikel terlebih dahulu.`);
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus user "${user.nama}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('User berhasil dihapus');
        fetchUsers();
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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

  const getArticleInfo = (user: User) => {
    const articleCount = user._count?.artikel || 0;
    return {
      count: articleCount,
      hasArticles: articleCount > 0,
      message: articleCount > 0 
        ? `${articleCount} artikel` 
        : 'Tidak ada artikel'
    };
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <LayoutAdmin user={currentUser} title="Kelola Users">
      <div className="space-y-6">
        {/* Header dengan Tombol Tambah */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-amber-600">Kelola user admin</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Tambah User
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

        {/* Tabel Users */}
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
                      Avatar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Jumlah Artikel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-amber-600">
                        Belum ada user. Mulai dengan menambahkan user pertama.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const articleInfo = getArticleInfo(user);
                      const isCurrentUser = currentUser && user.id_user === currentUser.id_user;
                      
                      return (
                        <tr key={user.id_user} className="hover:bg-amber-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-100 flex items-center justify-center">
                              <img
                                src={user.avatar || '/images/avatars/avatar1.jpg'}
                                alt={user.nama}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/images/avatars/avatar1.jpg'
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-amber-900">
                              {user.username}
                              {isCurrentUser && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Anda
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-amber-900">
                              {user.nama}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-amber-600">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-amber-600">
                              {formatDate(user.last_login)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              articleInfo.hasArticles 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {articleInfo.message}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              {/* TOMBOL EDIT - HIJAU */}
                              <button
                                onClick={() => handleEdit(user)}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm border border-green-700"
                              >
                                Edit
                              </button>

                              {/* TOMBOL HAPUS - MERAH (disabled untuk user saat ini) */}
                              <button
                                onClick={() => handleDelete(user.id_user, user)}
                                disabled={isCurrentUser}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm border ${
                                  isCurrentUser
                                    ? 'bg-gray-400 cursor-not-allowed border-gray-500'
                                    : 'bg-red-600 hover:bg-red-700 border-red-700'
                                }`}
                                title={isCurrentUser ? 'Tidak dapat menghapus user yang sedang login' : (articleInfo.hasArticles ? `Tidak dapat dihapus: ${articleInfo.message}` : 'Hapus user')}
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

      {/* Modal Tambah/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-amber-900">
                  {editingUser ? 'Edit User' : 'Tambah User'}
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
                  <label htmlFor="nama" className="block text-sm font-medium text-amber-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-amber-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Masukkan username"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-amber-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Masukkan email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-amber-700 mb-1">
                    Password {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password"}
                  />
                  {editingUser && (
                    <p className="text-xs text-amber-600 mt-1">
                      Kosongkan password jika tidak ingin mengubah
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-amber-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white"
                  >
                    <option value="admin">Admin</option>
                  </select>
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
                    disabled={
                        submitting || 
                        !formData.nama.trim() || 
                        !formData.username.trim() || 
                        !formData.email.trim() || 
                        (!editingUser && !formData.password.trim()) // Hanya validasi password untuk create
                    }
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                    {submitting ? (
                        <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                        </>
                    ) : (
                        editingUser ? 'Update' : 'Simpan'
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