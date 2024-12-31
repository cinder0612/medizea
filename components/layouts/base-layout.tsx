'use client'

import { useState, useEffect } from 'react'
import { ParticleBackground } from "@/components/particle-background"
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { AuthRedirectHandler } from '@/components/auth/auth-redirect-handler'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface BaseLayoutProps {
  children: React.ReactNode
  showParticles?: boolean
  className?: string
}

export function BaseLayout({ children, showParticles = true, className = "" }: BaseLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="layout"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-black"
      >
        {showParticles && (
          <div className="fixed inset-0 z-0">
            <ParticleBackground />
          </div>
        )}
        
        <div className="relative min-h-screen flex flex-col">
          <div className="z-50">
            <Navbar />
          </div>
          <main className={`relative z-10 flex-grow ${className}`}>
            <AuthRedirectHandler initialSession={null} />
            {children}
          </main>
          <Toaster />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
