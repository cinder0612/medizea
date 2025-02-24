'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeIn, fadeInUp, stagger } from '@/lib/animations'
import { Brain, Target, Zap, Clock, Shield, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function FeaturesSection() {
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
    <section id="features" className="py-32 relative">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
        className="container mx-auto px-4 space-y-20"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-4xl font-thin text-center text-amber-200"
        >
          Powerful Features
        </motion.h2>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-8 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent backdrop-blur-sm border border-amber-500/10"
            >
              <div className="flex flex-col items-start gap-4">
                {feature.icon}
                <div>
                  <h3 className="text-amber-400 text-lg mb-3">{feature.title}</h3>
                  <p className="text-amber-100/70">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-20"
          variants={fadeInUp}
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
              'Transform Your Meditation Practice Now'
            )}
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

const features = [
  {
    icon: <Clock className="w-8 h-8 text-amber-400" />,
    title: "Quick Sessions",
    description: "Effective 10-minute meditations that fit your busy schedule"
  },
  {
    icon: <Shield className="w-8 h-8 text-amber-400" />,
    title: "Proven Methods",
    description: "Science-backed techniques enhanced by AI technology"
  },
  {
    icon: <Sparkles className="w-8 h-8 text-amber-400" />,
    title: "Daily Inspiration",
    description: "Fresh content and motivation to keep you engaged"
  }
]
