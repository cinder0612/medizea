// Password validation function
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long',
    }
  }

  // Add more password requirements if needed
  // Example: require numbers, special characters, etc.
  
  return {
    isValid: true,
    message: 'Password is valid',
  }
}

// Get redirect URL after authentication
export function getRedirectUrl(type: 'url' | 'searchParams', searchParams?: URLSearchParams): string {
  if (type === 'url') {
    // For email confirmation redirects, always use the base URL
    return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`
  }

  if (!searchParams) {
    return '/dashboard'
  }

  // Get the returnUrl from search params, default to dashboard
  const returnUrl = searchParams.get('returnUrl')
  
  // List of allowed redirect URLs after login
  const allowedRedirects = ['/dashboard', '/meditation-generator']
  
  // If returnUrl is provided and it's in the allowed list, use it
  if (returnUrl && allowedRedirects.some(url => returnUrl.startsWith(url))) {
    return returnUrl
  }
  
  // Default redirect to dashboard
  return '/dashboard'
}
