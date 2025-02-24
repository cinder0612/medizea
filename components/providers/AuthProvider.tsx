'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, Subscription } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  loading: boolean
  subscriptionStatus: {
    isActive: boolean
    plan: 'basic' | 'pro' | 'premium' | null
    subscription: Subscription | null
  } | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isSubscribed: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscriptionStatus: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isSubscribed: false
})

export const useAuth = () => {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isActive: boolean
    plan: 'basic' | 'pro' | 'premium' | null
    subscription: Subscription | null
  } | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchSubscriptionStatus(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchSubscriptionStatus(session.user.id)
      } else {
        setSubscriptionStatus(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const fetchSubscriptionStatus = async (userId: string) => {
    // First get the customer record for the user
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!customer) {
      setSubscriptionStatus({
        isActive: false,
        plan: null,
        subscription: null,
      })
      return
    }

    // Then get their active subscription
    const { data: subscription } = await supabase
      .from('customer_subscriptions')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'active')
      .is('canceled_at', null)
      .single()

    setSubscriptionStatus({
      isActive: !!subscription,
      plan: subscription?.subscription_tier || null,
      subscription: subscription || null,
    })
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    router.refresh()
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    // Clear user and subscription state
    setUser(null)
    setSubscriptionStatus(null)
    // Redirect to welcome page
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      subscriptionStatus,
      signIn,
      signUp,
      signOut,
      isSubscribed: subscriptionStatus?.isActive && subscriptionStatus?.plan !== 'basic'
    }}>
      {children}
    </AuthContext.Provider>
  )
}
