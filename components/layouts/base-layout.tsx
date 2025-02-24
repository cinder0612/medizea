'use client'

import { useState, useEffect } from 'react'
import { Toaster } from "@/components/ui/toaster"
import Head from 'next/head'

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
  title?: string
  hideVideo?: boolean
}

export function BaseLayout({ children, className = "", title, hideVideo }: BaseLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative min-h-screen bg-black">
      {/* Video Background - only show if hideVideo is false */}
      {!hideVideo && (
        <div className="fixed inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          >
            <source src="/videos/meditation.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        </div>
      )}

      <Head>
        <title>{title ? `${title} - Medizea` : 'Medizea - AI-Powered Meditation'}</title>
      </Head>
      <div className={`relative z-10 ${className}`}>
        {mounted && children}
      </div>
      <Toaster />
    </div>
  )
}
