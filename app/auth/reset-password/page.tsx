'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { BaseLayout } from '@/components/layouts/base-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { GradientBackground } from '@/components/shared/gradient-background'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BaseLayout>
      <div className="relative min-h-screen flex items-center justify-center">
        <GradientBackground />
        <div className="relative z-10 w-full max-w-md">
          <div className="relative w-full max-w-[480px] p-12 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-light tracking-tight text-amber-400">
                  Reset Password
                </h1>
                <p className="text-lg text-amber-100/70">
                  Enter your email to receive a reset link
                </p>
              </div>

              {success ? (
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400">
                      Check your email for the password reset link.
                      <span className="block mt-2 text-sm">
                        Didn't receive the email? Check your spam folder or try again.
                      </span>
                    </p>
                  </div>
                  <div className="space-y-4 text-center">
                    <button
                      onClick={() => setSuccess(false)}
                      className="text-amber-400 hover:text-amber-300 font-medium"
                    >
                      Try again
                    </button>
                    <div>
                      <Link
                        href="/auth?mode=signin"
                        className="text-amber-100/70 hover:text-amber-100"
                      >
                        Back to sign in
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-400">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleReset} className="space-y-6">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 px-5 bg-white/5 border-white/10 rounded-xl text-lg text-amber-100 placeholder:text-amber-100/50 focus:border-amber-400/50 focus:ring-amber-400/50"
                      required
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-medium rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>

                    <div className="text-center">
                      <Link
                        href="/auth?mode=signin"
                        className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
                      >
                        Back to Sign In
                      </Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
