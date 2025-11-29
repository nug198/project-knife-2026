// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LayoutAdmin from '../components/LayoutAdmin'
import { useAuth } from '../contexts/AuthContext'

interface Stats {
  totalProducts: number;
  totalArticles: number;
  totalMakers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()

    // Di dalam component AdminDashboard, tambahkan:
    useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
        if (!authLoading && (!user || !isAdmin)) {
        router.push('/')
        return
        }

        if (user && isAdmin && isMounted) {
        await fetchStats()
        }
    }

    fetchData()

    return () => {
        isMounted = false
    }
    }, [user, isAdmin, authLoading, router])

  // app/admin/page.tsx - HANYA BAGIAN fetchStats YANG DIPERBAIKI
    const fetchStats = async () => {
    try {
        setError(null)
        setLoading(true)
        console.log('🔄 Starting to fetch stats...')
        
        // Helper function dengan timeout
        const fetchWithTimeout = async (url: string, timeout = 5000) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)
        
        try {
            const response = await fetch(url, {
            cache: 'no-store',
            signal: controller.signal,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
            })
            clearTimeout(timeoutId)
            
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            return await response.json()
        } catch (error) {
            clearTimeout(timeoutId)
            throw error
        }
        }

        // Gunakan Promise.allSettled untuk handle partial failure
        const [productsResult, articlesResult, makersResult] = await Promise.allSettled([
        fetchWithTimeout('/api/admin/stats/products').catch(e => {
            console.error('❌ Products API failed:', e)
            return { success: false, data: { total: 0 } }
        }),
        fetchWithTimeout('/api/admin/stats/articles').catch(e => {
            console.error('❌ Articles API failed:', e)
            return { success: false, data: { total: 0 } }
        }),
        fetchWithTimeout('/api/admin/stats/makers').catch(e => {
            console.error('❌ Makers API failed:', e)
            return { success: false, data: { total: 0 } }
        })
        ])

        // Process results
        const productsData = productsResult.status === 'fulfilled' ? productsResult.value : { success: false, data: { total: 0 } }
        const articlesData = articlesResult.status === 'fulfilled' ? articlesResult.value : { success: false, data: { total: 0 } }
        const makersData = makersResult.status === 'fulfilled' ? makersResult.value : { success: false, data: { total: 0 } }

        console.log('📈 Parsed data:', {
        products: productsData,
        articles: articlesData,
        makers: makersData
        })

        // Set stats - always set values even if some failed
        setStats({
        totalProducts: productsData.success ? productsData.data.total : 0,
        totalArticles: articlesData.success ? articlesData.data.total : 0,
        totalMakers: makersData.success ? makersData.data.total : 0
        })

        // Check if any API failed and show warning
        const failedAPIs = []
        if (!productsData.success) failedAPIs.push('Products')
        if (!articlesData.success) failedAPIs.push('Articles')
        if (!makersData.success) failedAPIs.push('Makers')

        if (failedAPIs.length > 0) {
        setError(`Beberapa data tidak dapat dimuat: ${failedAPIs.join(', ')}. Data mungkin tidak lengkap.`)
        } else {
        console.log('✅ All stats loaded successfully')
        }

    } catch (error) {
        console.error('💥 Failed to fetch stats:', error)
        setError('Gagal memuat data statistik. Silakan refresh halaman.')
        
        // Set default values on error
        setStats({
        totalProducts: 0,
        totalArticles: 0,
        totalMakers: 0
        })
    } finally {
        setLoading(false)
        console.log('✅ Stats fetch completed')
    }
    }

  const handleRetry = () => {
    console.log('🔄 Retrying stats fetch...')
    fetchStats()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-700">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  if (loading) {
    return (
      <LayoutAdmin user={user} title="Dashboard Admin">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-amber-700">Memuat data statistik...</p>
          </div>
        </div>
      </LayoutAdmin>
    )
  }

  return (
    <LayoutAdmin user={user} title="Dashboard Admin">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-yellow-500 mr-3">⚠️</div>
              <div>
                <p className="text-yellow-700 font-medium">Peringatan</p>
                <p className="text-yellow-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <StatCard 
          title="Total Produk"
          value={stats?.totalProducts || 0}
          description="Produk terdaftar"
          icon="🛍️"
          href="/admin/products"
        />
        <StatCard 
          title="Total Artikel"
          value={stats?.totalArticles || 0}
          description="Artikel terbit"
          icon="📝"
          href="/admin/articles"
        />
        <StatCard 
          title="Total Maker"
          value={stats?.totalMakers || 0}
          description="Maker terdaftar"
          icon="🔨"
          href="/admin/makers"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200">
        <div className="px-6 py-5 border-b border-amber-200">
          <h2 className="text-lg font-semibold text-amber-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionLink href="/admin/users" icon="👥" text="Kelola User" />
            <QuickActionLink href="/admin/categories" icon="📁" text="Kelola Kategori" />
            <QuickActionLink href="/admin/products" icon="🛍️" text="Kelola Produk" />
            <QuickActionLink href="/admin/articles" icon="📝" text="Kelola Artikel" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-amber-200">
        <div className="px-6 py-5 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-amber-900">Aktivitas Terbaru</h2>
            <button 
              onClick={fetchStats}
              className="text-sm text-amber-600 hover:text-amber-800 transition-colors flex items-center"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center text-amber-600 py-8">
            <p className="mb-2">Tidak ada aktivitas terbaru</p>
            <p className="text-sm">Aktivitas akan muncul di sini ketika ada perubahan data</p>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  )
}

// Komponen StatCard untuk reusable code
function StatCard({ title, value, description, icon, href }: { 
  title: string; 
  value: number; 
  description: string; 
  icon: string; 
  href: string;
}) {
  return (
    <Link 
      href={href}
      className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-amber-600">{title}</p>
          <p className="text-3xl font-bold text-amber-900 mt-2">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-amber-500 mt-1">{description}</p>
        </div>
        <div className="text-3xl text-amber-500 group-hover:scale-110 transition-transform">{icon}</div>
      </div>
    </Link>
  )
}

// Komponen QuickActionLink untuk reusable code
function QuickActionLink({ href, icon, text }: { 
  href: string; 
  icon: string; 
  text: string;
}) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-center px-4 py-3 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
    >
      {icon} {text}
    </Link>
  )
}