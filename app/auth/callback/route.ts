import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url) // Moved outside the try block

  try {
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/auth?error=missing_code', requestUrl.origin))
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Exchange the code for a session
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL(`/auth?error=${error.message}`, requestUrl.origin))
    }

    // Get the redirect URL from the 'next' parameter
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    // Successful authentication, redirect to the intended page
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL('/auth?error=server_error', requestUrl.origin))
  }
}

