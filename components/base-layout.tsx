'use client'

import { ParticleBackground } from "@/components/particle-background"
import { Toaster } from "@/components/ui/toaster"
import { motion } from "framer-motion"
import { AuthProvider } from "@/contexts/AuthContext"
import { Navbar } from "@/components/navbar"

interface BaseLayoutProps {
  children: React.ReactNode
  showParticles?: boolean
  showNavbar?: boolean
  showFooter?: boolean
  className?: string
}

export function BaseLayout({ 
  children, 
  showParticles = true, 
  showNavbar = true,
  showFooter = true,
  className = "" 
}: BaseLayoutProps) {
  return (
    <main className={`relative min-h-screen flex flex-col bg-black/70 ${className}`}>
      {showParticles && (
        <>
          <div className="absolute inset-0 bg-black opacity-60 z-10" />
          <ParticleBackground />
        </>
      )}
      <div className="relative z-20 flex-grow overflow-auto">
        <AuthProvider>
          {showNavbar && <Navbar />}
          {children}
          {showFooter && (
            <footer className="border-t">
              <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Your App Name. All rights reserved.
              </div>
            </footer>
          )}
        </AuthProvider>
      </div>
      <Toaster />
    </main>
  )
}

export const MotionCard = motion.div
