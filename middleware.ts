import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Skip auth check for callback route
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  // Auth Required Routes
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/meditation-generator')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth?mode=signin', req.url))
    }
  }

  // Auth Routes - redirect to dashboard if already signed in
  if (req.nextUrl.pathname.startsWith('/auth') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/meditation-generator/:path*', '/auth/:path*']
}
