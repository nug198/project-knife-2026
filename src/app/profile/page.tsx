'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LayoutAdmin from '../components/LayoutAdmin'
import Navbar from '../components/Navbar'
import PasswordInput from '../components/PasswordInput'

const avatars = [
  '/images/avatars/avatar1.jpg',
  '/images/avatars/avatar2.jpg',
  '/images/avatars/avatar3.jpg',
  '/images/avatars/avatar4.jpg',
  '/images/avatars/avatar5.jpg'
]

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    selectedAvatar: ''
  })

  // Set selected avatar ketika user data tersedia
  useState(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        selectedAvatar: user.avatar || avatars[0]
      }))
    }
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Password baru tidak cocok')
      setSaving(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage('Password minimal 6 karakter')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('Password berhasil diubah')
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        setMessage(result.error || 'Gagal mengubah password')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (avatar: string) => {
    setFormData(prev => ({ ...prev, selectedAvatar: avatar }))
    
    try {
      const response = await fetch('/api/auth/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar }),
      })

      if (response.ok) {
        setMessage('Avatar berhasil diubah')
        // User data akan di-update melalui AuthContext
      }
    } catch (error) {
      setMessage('Gagal mengubah avatar')
    }
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

  // Jika user adalah admin, gunakan LayoutAdmin (tanpa Navbar)
  if (user.role === 'admin') {
    return (
      <LayoutAdmin user={user} title="Profil Saya">
        <ProfileContent 
          user={user}
          formData={formData}
          setFormData={setFormData}
          message={message}
          saving={saving}
          onPasswordChange={handlePasswordChange}
          onAvatarChange={handleAvatarChange}
        />
      </LayoutAdmin>
    )
  }

  // Untuk user biasa, gunakan Navbar
  return (
    <main className="flex flex-col min-h-screen bg-amber-50">
      <Navbar />
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileContent 
            user={user}
            formData={formData}
            setFormData={setFormData}
            message={message}
            saving={saving}
            onPasswordChange={handlePasswordChange}
            onAvatarChange={handleAvatarChange}
          />
        </div>
      </div>
    </main>
  )
}

// Komponen terpisah untuk konten profile
interface ProfileContentProps {
  user: any;
  formData: any;
  setFormData: any;
  message: string;
  saving: boolean;
  onPasswordChange: (e: React.FormEvent) => void;
  onAvatarChange: (avatar: string) => void;
}

function ProfileContent({ 
  user, 
  formData, 
  setFormData, 
  message, 
  saving, 
  onPasswordChange, 
  onAvatarChange 
}: ProfileContentProps) {
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Profil Saya</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('berhasil') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Selection */}
          <div>
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Pilih Avatar</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {avatars.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onAvatarChange(avatar)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    formData.selectedAvatar === avatar
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://via.placeholder.com/150/FFFBEB/7C2D12?text=Avatar+${index + 1}`
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Current User Info */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Informasi Akun</h3>
              <div className="space-y-2 text-sm text-amber-700">
                <p><strong>Nama:</strong> {user.nama}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {user.role}
                  </span>
                </p>
                <p><strong>Status:</strong> 
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Online
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          <div>
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Ubah Password</h2>
            <form onSubmit={onPasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-amber-700 mb-1">
                  Password Saat Ini
                </label>
                <PasswordInput
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  required
                  disabled={saving}
                  placeholder="Masukkan password saat ini"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-amber-700 mb-1">
                  Password Baru
                </label>
                <PasswordInput
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  required
                  disabled={saving}
                  placeholder="Masukkan password baru (min. 6 karakter)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <PasswordInput
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  disabled={saving}
                  placeholder="Ulangi password baru"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}