'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { validatePassword, getRedirectUrl } from '@/lib/auth-config'
import { useAuth } from '../contexts/AuthContext'

function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams?.get('mode') as 'signin' | 'signup' | 'forgot' || 'signin'
  const { signIn, signUp } = useAuth()

  useEffect(() => {
    // Reset form when mode changes
    setEmail('')
    setPassword('')
    setError(null)
    setIsLoading(false)
  }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else if (mode === 'signup') {
        await signUp(email, password)
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=resetPassword`,
        })
        if (error) throw error
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        })
      }
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-[480px] p-12 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <motion.h1 
            className="text-4xl font-light tracking-tight text-amber-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </motion.h1>
          <motion.p 
            className="text-lg text-amber-100/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {mode === 'signin'
              ? 'Enter your credentials to continue'
              : mode === 'signup'
              ? 'Sign up to start your journey'
              : 'Enter your email to reset password'}
          </motion.p>
        </div>

        <motion.form 
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-5">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-5 bg-white/5 border-white/10 rounded-xl text-lg text-amber-100 placeholder:text-amber-100/50 focus:border-amber-400/50 focus:ring-amber-400/50 transition-colors"
            />
            {mode !== 'forgot' && (
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-5 bg-white/5 border-white/10 rounded-xl text-lg text-amber-100 placeholder:text-amber-100/50 focus:border-amber-400/50 focus:ring-amber-400/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-100/50 hover:text-amber-100/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={`
              w-full h-14 text-lg font-medium bg-amber-500 hover:bg-amber-400 text-black 
              transition-all duration-200 rounded-xl relative overflow-hidden
              ${isLoading ? 'cursor-not-allowed' : ''}
            `}
          >
            <div className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </Button>
        </motion.form>

        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {mode === 'signin' ? (
            <>
              <Link
                href="/auth?mode=forgot"
                className="block text-amber-400 hover:text-amber-300 transition-colors text-lg"
              >
                Forgot Password?
              </Link>
              <div className="text-amber-100/70 text-lg">
                Don't have an account?{' '}
                <Link href="/auth?mode=signup" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Sign Up
                </Link>
              </div>
            </>
          ) : mode === 'signup' ? (
            <div className="text-amber-100/70 text-lg">
              Already have an account?{' '}
              <Link href="/auth?mode=signin" className="text-amber-400 hover:text-amber-300 transition-colors">
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              href="/auth?mode=signin"
              className="text-amber-400 hover:text-amber-300 transition-colors text-lg"
            >
              Back to Sign In
            </Link>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export { AuthForm as default }
