'use client'

import { BaseLayout } from '@/components/layouts/base-layout'
import { useState } from 'react'
import { toast } from "@/components/ui/use-toast"
import dynamic from 'next/dynamic'
import StickyNav from '@/components/sticky-nav'

// Dynamically import heavy components
const HeroSection = dynamic(() => import('@/components/hero-section'))
const FeaturesSection = dynamic(() => import('@/components/features-section'))
const HowItWorksSection = dynamic(() => import('@/components/how-it-works-section'))
const BenefitsSection = dynamic(() => import('@/components/benefits-section'))
const TestimonialsSection = dynamic(() => import('@/components/testimonials-section'))
const GallerySection = dynamic(() => import('@/components/gallery-section'))

export default function Home() {
  const [error, setError] = useState<string | null>(null)

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const missingVar = !process.env.NEXT_PUBLIC_SUPABASE_URL ? 'URL' : 'Anon Key'
    setError(`Missing Supabase ${missingVar}. Please check your environment variables.`)
    toast({
      title: "Configuration Error",
      description: `There's an issue with the Supabase ${missingVar} configuration.`,
      variant: "destructive",
    })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <BaseLayout showParticles={true}>
      <StickyNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <TestimonialsSection />
        <GallerySection />
      </main>
    </BaseLayout>
  )
}
