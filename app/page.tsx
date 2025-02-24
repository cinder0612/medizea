'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { BaseLayout } from '@/components/layouts/base-layout'
import { ImageBackground } from '@/components/shared/image-background'

// Dynamically import sections to reduce initial bundle size
const HeroSection = dynamic(() => import('@/components/sections/hero-section'))
const FeaturesSection = dynamic(() => import('@/components/sections/features-section'))
const PricingComparison = dynamic(() => import('@/components/sections/pricing-comparison'))
const HowItWorksSection = dynamic(() => import('@/components/sections/how-it-works-section'))
const BenefitsSection = dynamic(() => import('@/components/sections/benefits-section'))
const TestimonialsSection = dynamic(() => import('@/components/sections/testimonials-section'))
const GallerySection = dynamic(() => import('@/components/sections/gallery-section'))
const Footer = dynamic(() => import('@/components/sections/footer'))

export default function Home() {
  const [error, setError] = useState<string | null>(null)

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <BaseLayout showParticles={true}>
      <main className="relative min-h-screen flex flex-col items-center justify-between">
        <ImageBackground />

        {/* Content */}
        <div className="relative z-10 w-full">
          <HeroSection />
          <FeaturesSection />
          <PricingComparison />
          <HowItWorksSection />
          <BenefitsSection />
          <TestimonialsSection />
          <GallerySection />
          <Footer />
        </div>
      </main>
    </BaseLayout>
  )
}
