'use client'

import MeditationGenerator from '@/components/meditation-generator'
import { BaseLayout } from '@/components/layouts/base-layout'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const MeditationPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [hasCredits, setHasCredits] = useState(false)
  const [availableCredits, setAvailableCredits] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkCredits = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // Check user_credits table
        const { data: credits, error } = await supabase
          .from('user_credits')
          .select('available_credits')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking credits:', error)
          throw error
        }

        const creditsAvailable = credits?.available_credits || 0
        setAvailableCredits(creditsAvailable)
        setHasCredits(creditsAvailable >= 10) // Minimum credits needed for one meditation
      } catch (error) {
        console.error('Error in credits check:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkCredits()
  }, [user, supabase])

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
        </div>
      </BaseLayout>
    )
  }

  // Check if user is authenticated and has credits
  if (!user || !hasCredits) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center backdrop-blur-md bg-black/40 border border-amber-500/20 rounded-lg p-8 shadow-xl max-w-md"
          >
            <h2 className="text-2xl font-light text-amber-200 mb-4">
              {!user ? 'Credits Required' : 'Insufficient Credits'}
            </h2>
            <p className="text-amber-100/70 mb-6">
              {!user 
                ? 'The Meditation Generator requires credits to use. Get credits to unlock this feature and start your meditation journey.'
                : `You have ${availableCredits} credits. You need at least 10 credits to generate a meditation.`}
            </p>
            <Button
              onClick={() => router.push('/pricing')}
              className="bg-amber-400 text-black hover:bg-amber-300"
            >
              Get Credits
            </Button>
          </motion.div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-6"
        style={{ position: 'fixed', zIndex: 9999 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 gap-2 backdrop-blur-sm bg-black/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </motion.div>

      <BaseLayout>
        <div className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black/90 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent"></div>
            {/* Floating Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400/5 rounded-full filter blur-3xl animate-float"></div>
            <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-amber-300/5 rounded-full filter blur-3xl animate-float-delayed"></div>
          </div>

          {/* Main Content */}
          <div className="relative container mx-auto pt-24 pb-12 px-4">
            <MeditationGenerator />
          </div>
        </div>
      </BaseLayout>
    </>
  )
}

export default MeditationPage
