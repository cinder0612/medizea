'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import AuthForm from '@/components/auth/AuthForm'
import { BaseLayout } from '@/components/layouts/base-layout'
import { motion } from 'framer-motion'

export default function AuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        if (returnUrl === '/meditation-generator') {
          const { data: { subscription } } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .single()
          if (subscription.status === 'active') {
            router.push(returnUrl)
          } else {
            router.push('/pricing')
          }
        } else {
          router.push(returnUrl)
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null)
          if (returnUrl === '/meditation-generator') {
            const { data: { subscription } } = await supabase
              .from('subscriptions')
              .select('status')
              .eq('user_id', session.user.id)
              .single()
            if (subscription.status === 'active') {
              router.push(returnUrl)
            } else {
              router.push('/pricing')
            }
          } else {
            router.push(returnUrl)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, returnUrl])

  if (user) {
    return null
  }

  return (
    <BaseLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black/90 flex items-center justify-center p-4 relative overflow-hidden"
      >
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
      </motion.div>
    </BaseLayout>
  )
}
