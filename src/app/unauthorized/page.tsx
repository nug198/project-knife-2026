// app/unauthorized/page.tsx
import Link from 'next/link'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-amber-600 mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/login"
              className="block w-full border border-amber-600 text-amber-600 py-2 px-4 rounded-md hover:bg-amber-50 transition-colors"
            >
              Login dengan Akun Lain
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}