'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { RefreshCw, X } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'

export default function HeroSection() {
  const router = useRouter()
  const [showSample, setShowSample] = useState(false)
  const [mantra, setMantra] = useState("Breathe in peace, breathe out stress.")

  const handleClick = () => {
    router.push('/auth')
  }

  const refreshMantra = () => {
    const mantras = [
      "Breathe in peace, breathe out stress.",
      "I am calm, I am centered, I am at peace.",
      "Every breath brings me closer to inner peace.",
      "I release tension and embrace tranquility.",
      "In this moment, I am exactly where I need to be."
    ]
    setMantra(mantras[Math.floor(Math.random() * mantras.length)])
  }

  return (
    <section className="py-40 text-center relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-thin text-amber-200 mb-6"
          {...fadeInUp}
        >
          Discover Inner Peace with AI
        </motion.h1>
        <motion.p 
          className="text-lg sm:text-xl text-amber-100/80 mb-8 max-w-2xl mx-auto"
          {...fadeInUp}
        >
          Experience personalized meditation sessions powered by advanced AI, designed to help you find tranquility in your daily life.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          {...fadeInUp}
        >
          <Button
            onClick={handleClick}
            className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black px-8 py-6 text-lg font-medium rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started
          </Button>
        </motion.div>

        {showSample && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-black/90 p-8 rounded-xl border border-amber-500/20 max-w-2xl w-full relative">
              <Button
                onClick={() => setShowSample(false)}
                variant="ghost"
                className="absolute top-2 right-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-thin text-amber-200">Daily Mantra</h3>
                  <Button
                    onClick={refreshMantra}
                    variant="ghost"
                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-amber-100 text-xl font-light">{mantra}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
