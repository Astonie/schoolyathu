import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Allow access to auth pages without authentication
    if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }

    // Redirect to sign-in if not authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Super admin can access everything
    if (token.role === 'SUPER_ADMIN') {
      return NextResponse.next()
    }

    // Check if user belongs to a school (multi-tenant check)
    if (!token.schoolId && token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/auth/error?error=NoSchoolAccess', req.url))
    }

    // Role-based access control for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      // Super admin has access to everything
      if (token.role === 'SUPER_ADMIN') {
        return NextResponse.next()
      }

      // Basic role validation - let the server-side handle detailed permissions
      const validRoles = ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT']
      if (!validRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/auth/error?error=InvalidRole', req.url))
      }
    }

    // API routes protection
    if (pathname.startsWith('/api/')) {
      // Add school context to API requests
      const response = NextResponse.next()
      response.headers.set('x-school-id', token.schoolId || '')
      response.headers.set('x-user-role', token.role || '')
      response.headers.set('x-user-id', token.sub || '')
      return response
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = ['/auth', '/api/auth', '/']
        if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
          return true
        }
        
        // Require authentication for protected routes
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}