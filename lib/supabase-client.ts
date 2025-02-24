import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// Create a single instance of the Supabase client for client components
export const supabase = createClientComponentClient<Database>()

// Export a function to create a fresh client when needed (for server components)
export function createClient() {
  return createClientComponentClient<Database>()
}

// Password validation function
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }
  }

  return {
    isValid: true,
    message: 'Password is valid',
  }
}

// Get redirect URL for email confirmation
export function getEmailRedirectUrl(): string {
  return `${window.location.origin}/auth?mode=resetPassword`
}

// Handle auth redirects consistently
export function handleAuthRedirect(returnUrl?: string) {
  const baseUrl = '/auth?mode=signin'
  return returnUrl ? `${baseUrl}&returnUrl=${encodeURIComponent(returnUrl)}` : baseUrl
}

// Handle sign out redirect
export function handleSignOutRedirect() {
  return '/'
}

// Handle successful auth redirect
export function handleSuccessRedirect(returnUrl?: string | null) {
  // Only allow redirects to protected or subscription paths
  if (returnUrl && (requiresAuth(returnUrl) || requiresSubscription(returnUrl))) {
    return returnUrl
  }
  return '/dashboard'
}

// Check if path requires auth
export function requiresAuth(pathname: string): boolean {
  const protectedPaths = ['/dashboard', '/meditation-generator']
  return protectedPaths.some(path => pathname.startsWith(path))
}

// Check if path requires subscription
export function requiresSubscription(pathname: string): boolean {
  const subscriptionPaths: string[] = []
  return subscriptionPaths.some(path => pathname.startsWith(path))
}

// Check if path is public
export function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/', '/auth', '/pricing', '/auth/update-password', '/auth/reset-password', '/auth/callback']
  return publicPaths.some(path => pathname.startsWith(path))
}
