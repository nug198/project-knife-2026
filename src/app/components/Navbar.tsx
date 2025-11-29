'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"

const navItems = [
  { name: "Main Hall", href: "/" },
  { name: "Collection", href: "/collection" },
  { name: "Craftsmen", href: "/craftsmen" },
  { name: "Knife-Talks", href: "/article" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()

  // Jangan render navbar di halaman admin
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      <nav className="w-full bg-amber-900 fixed top-0 left-0 z-50 border-b border-amber-700 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold text-amber-50 hover:text-amber-200 transition-colors"
          >
            NHK
          </Link>

          {/* Menu Items - Center */}
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-lg font-medium text-amber-50 transition-all duration-200
                  ${pathname === item.href 
                    ? 'bg-amber-600 text-white font-semibold' 
                    : 'hover:bg-amber-800 hover:text-amber-200'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Login/Profile */}
          <div className="flex items-center">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-amber-700 animate-pulse"></div>
            ) : user ? (
              <div className="relative group">
                <Link href="/profile" className="flex items-center gap-2 text-amber-50 hover:text-amber-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-600 overflow-hidden border-2 border-amber-400">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-500 flex items-center justify-center text-xs text-white">
                        {user.nama.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block">{user.nama}</span>
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-amber-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-amber-50 hover:bg-amber-700 transition-colors"
                    >
                      Profil Saya
                    </Link>
                    {user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-2 text-amber-50 hover:bg-amber-700 transition-colors"
                      >
                        Dashboard Admin
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-amber-50 hover:bg-amber-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg font-medium text-white bg-amber-600 hover:bg-amber-500 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer untuk mencegah tumpang tindih dengan konten */}
      <div className="h-16"></div>
    </>
  )
}