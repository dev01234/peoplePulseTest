
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define routes that don't require authentication
const publicRoutes = ['/login', '/reset-password', '/favicon.ico', '/api/auth']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')
  const { pathname } = request.nextUrl

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/public')
  )

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Allow access to public routes regardless of authentication status
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If no token is present and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/login') {
      loginUrl.searchParams.set('returnUrl', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Token exists, allow access to protected routes
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|public|favicon.ico).*)',
  ],
}