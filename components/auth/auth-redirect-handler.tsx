'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthRedirectHandlerProps {
  initialSession: any
}

export function AuthRedirectHandler({ initialSession }: AuthRedirectHandlerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const returnUrl = searchParams?.get('returnUrl')

  useEffect(() => {
    if (user && returnUrl) {
      router.push(returnUrl)
    }
  }, [user, returnUrl, router])

  return null
}
