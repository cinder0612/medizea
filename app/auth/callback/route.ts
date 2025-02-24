import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Handle error from Supabase
  if (error) {
    console.error('Auth error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/auth?mode=signin&error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    )
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL('/auth/update-password', requestUrl.origin))
    } catch (error) {
      console.error('Error:', error)
      return NextResponse.redirect(
        new URL('/auth?mode=signin&error=Failed to exchange code for session', requestUrl.origin)
      )
    }
  }

  // Return to auth page if no code or error
  return NextResponse.redirect(new URL('/auth?mode=signin', requestUrl.origin))
}
