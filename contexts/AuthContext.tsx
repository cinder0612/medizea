'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from "@/components/ui/use-toast"

interface SubscriptionStatus {
  isActive: boolean
  planId?: string
  currentPeriodEnd?: string
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
  subscriptionStatus: SubscriptionStatus | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
  initialSession?: any
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialSession?.user || null)
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Function to fetch subscription status
  const fetchSubscriptionStatus = async (userId: string) => {
    try {
      const { data: isActive, error } = await supabase
        .rpc('is_subscription_active', {
          user_uuid: userId
        })

      if (error) throw error

      setSubscriptionStatus({ isActive: !!isActive })
      return isActive
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      return false
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Start with the initial session if provided
        if (initialSession?.user) {
          setUser(initialSession.user)
          await fetchSubscriptionStatus(initialSession.user.id)
        } else {
          // Otherwise fetch the current session
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
          if (user) {
            await fetchSubscriptionStatus(user.id)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      if (event === 'SIGNED_IN') {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          await fetchSubscriptionStatus(user.id)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSubscriptionStatus(null)
      } else if (event === 'TOKEN_REFRESHED') {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          await fetchSubscriptionStatus(user.id)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, initialSession])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found after sign in')
      
      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found after sign up')
      
      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSubscriptionStatus(null)
      router.push('/')
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
    subscriptionStatus,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
