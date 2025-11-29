'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface User {
  id_user: number;
  username: string;
  nama: string;
  email: string;
  role: string;
  avatar?: string;
}

interface LayoutAdminProps {
  children: React.ReactNode;
  user: User;
  title: string;
}

const adminMenuItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Kelola User', href: '/admin/users', icon: '👥' },
  { name: 'Kelola Kategori', href: '/admin/categories', icon: '📁' },
  { name: 'Kelola Produk', href: '/admin/products', icon: '🛍️' },
  { name: 'Kelola Maker', href: '/admin/makers', icon: '🔨' },
  { name: 'Kelola Artikel', href: '/admin/articles', icon: '📝' },
  { name: 'Kelola Tema', href: '/admin/themes', icon: '🎨' },
  { name: 'Kelola Hubungi Kami', href: '/admin/contact', icon: '📞' },
  { name: 'Kelola Hero Section', href: '/admin/hero', icon: '🖼️' },
]

export default function LayoutAdmin({ children, user, title }: LayoutAdminProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarDropdownOpen, setSidebarDropdownOpen] = useState(false)
  const [topbarDropdownOpen, setTopbarDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-screen bg-amber-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-amber-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200">
            <Link href="/admin" className="text-2xl font-bold text-amber-800">
              Admin Panel
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-amber-600 hover:text-amber-800"
            >
              ✕
            </button>
          </div>

          {/* User Info with Dropdown */}
          <div className="px-6 py-4 border-b border-amber-200 relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.nama}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.nama.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setSidebarDropdownOpen(!sidebarDropdownOpen)}
                  className="flex items-center justify-between w-full text-left hover:text-amber-700 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-amber-900 truncate">{user.nama}</p>
                    <p className="text-xs text-amber-600">{user.role}</p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-amber-500 transition-transform ${
                      sidebarDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dropdown Menu in Sidebar */}
            {sidebarDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-amber-200 rounded-lg shadow-lg z-50">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 transition-colors border-b border-amber-100"
                  onClick={() => setSidebarDropdownOpen(false)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil Saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Tambah Produk Baru Button - hanya tampil di halaman produk */}
            {/* {(pathname === '/admin/products' || pathname.startsWith('/admin/products/')) && (
              <Link
                href="/admin/products/add"
                onClick={() => {
                  setSidebarOpen(false)
                  setSidebarDropdownOpen(false)
                }}
                className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors mb-4"
              >
                <span className="mr-2">➕</span>
                Tambah Produk Baru
              </Link>
            )} */}

            {adminMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setSidebarOpen(false)
                  setSidebarDropdownOpen(false)
                }}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-amber-100 text-amber-800 border-r-2 border-amber-500'
                    : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-amber-200">
            <Link
              href="/"
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
              onClick={() => setSidebarDropdownOpen(false)}
            >
              ← Kembali ke Website
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-amber-200 lg:border-none">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-amber-600 hover:text-amber-800"
            >
              ☰
            </button>
            <h1 className="text-xl font-semibold text-amber-900">{title}</h1>
            
            {/* Top Bar User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTopbarDropdownOpen(!topbarDropdownOpen)}
                className="flex items-center space-x-2 text-amber-700 hover:text-amber-800 font-medium p-2 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <span>{user.nama}</span>
                <svg 
                  className={`w-4 h-4 text-amber-500 transition-transform ${
                    topbarDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu in Top Bar */}
              {topbarDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-amber-200 rounded-lg shadow-lg z-50">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 transition-colors border-b border-amber-100"
                    onClick={() => setTopbarDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profil Saya
                  </Link>
                  <button
                    onClick={() => {
                      setTopbarDropdownOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {
            setSidebarOpen(false)
            setSidebarDropdownOpen(false)
          }}
        />
      )}

      {/* Close dropdowns when clicking outside */}
      {(sidebarDropdownOpen || topbarDropdownOpen) && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setSidebarDropdownOpen(false)
            setTopbarDropdownOpen(false)
          }}
        />
      )}
    </div>
  )
}