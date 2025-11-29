// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rute yang memerlukan autentikasi
const protectedRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/products',
  '/admin/articles',
  '/admin/makers',
  '/admin/categories',
  '/admin/themes',
  '/admin/contact',
  '/admin/hero',
  '/profile'
]

// Rute yang hanya bisa diakses oleh admin
const adminRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/products',
  '/admin/articles',
  '/admin/makers',
  '/admin/categories',
  '/admin/themes',
  '/admin/contact',
  '/admin/hero'
]

// Rute API yang dilindungi
const protectedApiRoutes = [
  '/api/admin'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Cek jika rute adalah API yang dilindungi
  const isProtectedApi = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedApi) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      // Verifikasi token
      const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        headers: {
          'Cookie': `token=${token}`
        }
      })
      
      const { valid, user } = await response.json()
      
      if (!valid) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Cek role untuk API admin
      if (pathname.startsWith('/api/admin') && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }

      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }

  // Cek jika rute dilindungi
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Redirect ke login jika tidak ada token
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verifikasi token
    const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
      headers: {
        'Cookie': `token=${token}`
      }
    })
    
    const { valid, user } = await response.json()

    if (!valid) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('token')
      return response
    }

    // Cek role untuk rute admin
    const isAdminRoute = adminRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute && user.role !== 'admin') {
      const redirectUrl = new URL('/unauthorized', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
  } catch (error) {
    // Token invalid, clear cookie dan redirect ke login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (auth endpoints)
     * - login page
     * - home page
     * - collection pages
     * - craftsmen pages
     * - knife-talk pages
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|api/auth|public|$|collection|craftsmen|knife-talk).*)',
  ],
}