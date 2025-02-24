'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { CheckCircle, Sparkles } from 'lucide-react'
import { fadeInUp, slideInFromLeft, slideInFromRight, fadeIn } from '@/lib/animations'
import { stagger } from '@/lib/animations'
import { BrandScroll } from '@/components/brand-scroll'
import { Loader2 } from 'lucide-react'

export default function HeroSection() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      await router.push('/auth?mode=signin')
    } catch (error) {
      console.error('Navigation error:', error)
    }
    setIsLoading(false)
  }

  return (
    <section className="min-h-[90vh] flex flex-col justify-center relative overflow-hidden px-4 pt-20">
      <div className="container mx-auto max-w-[1400px] relative">
        <motion.div 
          className="text-center max-w-4xl mx-auto space-y-8"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Pre-headline with floating animation */}
          <motion.div 
            className="text-amber-400 text-lg tracking-wide flex items-center justify-center gap-2 font-medium"
            variants={fadeInUp}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 text-transparent bg-clip-text">
              The Revolutionary AI-Powered Meditation Platform
            </span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.div>

          {/* Main Headline with slide-in effect */}
          <motion.h1 
            variants={slideInFromLeft}
            className="text-[2.75rem] leading-[1.2] lg:text-6xl font-light"
          >
            <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 text-transparent bg-clip-text">
              Welcome to{' '}
            </span>
            <span className="bg-gradient-to-r from-amber-400 to-amber-300 text-transparent bg-clip-text font-medium">
              Medizea
            </span>
            <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 text-transparent bg-clip-text">
              {' '}
            </span>
            <div className="text-2xl lg:text-3xl mt-6 text-amber-100/90 font-light">
              Experience personalized meditation with{' '}
              <span className="font-handwriting text-amber-400 relative">
                Medizea's AI-powered platform
              </span>
              {' '}Transform your mindfulness journey today.
            </div>
          </motion.h1>

          {/* Benefits with staggered entrance */}
          <motion.div 
            variants={stagger}
            className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-amber-100/90"
          >
            {[
              "Personalized Sessions",
              "Advanced AI Technology",
              "Proven Results"
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-transparent backdrop-blur-sm border border-amber-500/10 hover:border-amber-500/20 transition-colors"
              >
                <CheckCircle className="text-amber-400 w-5 h-5" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button with hover animation */}
          <motion.div
            variants={fadeInUp}
            className="space-y-4 pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black px-12 py-6 text-xl font-medium rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 text-black" />
                    <span>Loading...</span>
                  </>
                ) : (
                  'Start Your Journey'
                )}
              </Button>
            </motion.div>
            <p className="text-sm text-amber-100/70 font-light">
              30-Day Money-Back Guarantee • No Credit Card Required
            </p>
          </motion.div>
        </motion.div>

        {/* Stats with staggered entrance */}
        <motion.div 
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20"
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "4.9★", label: "User Rating" },
            { value: "95%", label: "Success Rate" },
            { value: "50K+", label: "Meditations" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              className="text-center p-4 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent backdrop-blur-sm border border-amber-500/10"
            >
              <div className="text-4xl bg-gradient-to-r from-amber-300 to-amber-400 text-transparent bg-clip-text font-light">{stat.value}</div>
              <div className="text-sm text-amber-100/70 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Brand scroll with fade in */}
        <motion.div 
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-20"
        >
          <BrandScroll />
        </motion.div>
      </div>
    </section>
  )
}
