'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { user, subscriptionStatus } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black/90 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-amber-400/5 blur-3xl animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-amber-300/5 blur-3xl animate-float"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Welcome Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-amber-500/20">
            <h1 className="text-3xl font-thin text-amber-200 mb-4">
              Welcome back, {user.email}
            </h1>
            <p className="text-amber-100/80">
              {subscriptionStatus?.isActive 
                ? "Access your personalized meditation experience below." 
                : "Upgrade your account to unlock our meditation generator."}
            </p>
          </div>

          {/* Subscription Status */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-amber-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-thin text-amber-200">Subscription Status</h2>
                <p className="text-amber-100/70">
                  {subscriptionStatus?.isActive 
                    ? "Premium Member - Full Access Enabled" 
                    : "Free Plan - Meditation Generator Locked"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {subscriptionStatus?.isActive ? (
                <Link href="/meditation-generator">
                  <Button className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black px-8 py-6 text-lg font-medium rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                    Start Meditation
                  </Button>
                </Link>
              ) : (
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black px-8 py-6 text-lg font-medium rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                    Upgrade Now
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-amber-500/20">
            <h2 className="text-2xl font-thin text-amber-200 mb-6">Account Details</h2>
            <div className="space-y-4 text-amber-100/70">
              <div>
                <label className="block text-amber-200/50 mb-1">Email</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="block text-amber-200/50 mb-1">Member Since</label>
                <p>{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
