'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const AuthForm = dynamic(() => import('@/components/AuthForm'), {
  ssr: false,
})

export default function AuthPage() {
  const { user, subscriptionStatus } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  useEffect(() => {
    if (user) {
      if (returnUrl) {
        // If there's a return URL and user has required subscription, go there
        if (returnUrl === '/meditation-generator') {
          if (subscriptionStatus?.isActive) {
            router.push(returnUrl)
          } else {
            router.push('/pricing')
          }
        } else {
          router.push(returnUrl)
        }
      } else {
        // No return URL, go to dashboard
        router.push('/dashboard')
      }
    }
  }, [user, router, returnUrl, subscriptionStatus])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black/90 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-amber-400/5 blur-3xl animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-amber-300/5 blur-3xl animate-float"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  )
}
