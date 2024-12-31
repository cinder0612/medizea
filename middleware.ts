import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of paths that require authentication
const protectedPaths = ['/dashboard']

// List of paths that require subscription
const subscriptionPaths = ['/meditation-generator']

// List of public paths that should never redirect
const publicPaths = ['/', '/auth', '/pricing']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Middleware error:', error)
  }

  // Early return for public paths
  const pathname = req.nextUrl.pathname
  if (publicPaths.includes(pathname)) {
    return res
  }

  // Check if path requires authentication
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!session?.user) {
      const redirectUrl = new URL('/auth', req.url)
      redirectUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Check if path requires subscription
  if (subscriptionPaths.some(path => pathname.startsWith(path))) {
    const { data: { subscription } } = await supabase.from('subscriptions').select('*').single()
    if (!session?.user || !subscription?.isActive) {
      if (!session?.user) {
        const redirectUrl = new URL('/auth', req.url)
        redirectUrl.searchParams.set('returnUrl', pathname)
        return NextResponse.redirect(redirectUrl)
      } else {
        return NextResponse.redirect(new URL('/pricing', req.url))
      }
    }
  }

  return res
}

// Ensure the middleware is run for every page
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
