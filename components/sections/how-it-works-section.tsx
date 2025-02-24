'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function HowItWorksSection() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleViewCredits = async () => {
    setIsLoading(true)
    try {
      await router.push('/credits')
    } catch (error) {
      console.error('Navigation error:', error)
    }
    setIsLoading(false)
  }

  return (
    <section className="py-24" id="how-it-works">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-thin text-center text-amber-200 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          How Medizea Works
        </motion.h2>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-6 md:space-x-12 mb-20">
          <StepItem number={1} title="Enter Prompt" description="Describe your desired meditation experience." />
          <ArrowRight className="hidden md:block h-6 w-6 text-amber-400" />
          <StepItem number={2} title="Enhance" description="Our AI refines and enhances your prompt." />
          <ArrowRight className="hidden md:block h-6 w-6 text-amber-400" />
          <StepItem number={3} title="Choose Duration" description="Select the length of your meditation session." />
          <ArrowRight className="hidden md:block h-6 w-6 text-amber-400" />
          <StepItem number={4} title="Enjoy" description="Immerse yourself in your personalized meditation." />
        </div>

        {/* Credit System Feature */}
        <motion.div
          className="max-w-4xl mx-auto mt-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="backdrop-blur-md bg-black/40 border border-amber-500/20 rounded-xl p-8 shadow-[0_0_50px_-12px] shadow-amber-500/30 hover:shadow-amber-500/40 hover:shadow-[0_0_50px_-6px] transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                <span className="text-lg font-medium">Credit System</span>
              </div>
              <h3 className="text-2xl font-light text-amber-200">
                Power Up Your Meditation Journey
              </h3>
              <p className="text-lg text-amber-100/70 max-w-2xl">
                Use credits for Medizea's AI-powered meditation sessions. Get <span className="text-amber-400">bonus credits</span> on every package purchase!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-4">
                <div className="backdrop-blur-sm bg-black/20 border border-amber-500/10 rounded-lg p-4">
                  <div className="text-2xl font-light text-amber-400 mb-2">5-15%</div>
                  <div className="text-sm text-amber-100/70">Bonus Credits</div>
                </div>
                <div className="backdrop-blur-sm bg-black/20 border border-amber-500/10 rounded-lg p-4">
                  <div className="text-2xl font-light text-amber-400 mb-2">∞</div>
                  <div className="text-sm text-amber-100/70">Never Expire</div>
                </div>
                <div className="backdrop-blur-sm bg-black/20 border border-amber-500/10 rounded-lg p-4">
                  <div className="text-2xl font-light text-amber-400 mb-2">5+</div>
                  <div className="text-sm text-amber-100/70">Package Options</div>
                </div>
              </div>
              <Button
                onClick={handleViewCredits}
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black px-8 py-6 text-lg font-light rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 text-black" />
                    <span>Loading...</span>
                  </>
                ) : (
                  'View Credit Packages'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StepItem({ 
  number, 
  title, 
  description 
}: { 
  number: number;
  title: string;
  description: string;
}) {
  return (
    <motion.div 
      className="flex flex-col items-center text-center max-w-xs group"
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-amber-200 flex items-center justify-center mb-6">
        <span className="text-lg sm:text-xl font-light text-amber-200">{number}</span>
      </div>
      <h3 className="text-lg sm:text-xl font-light text-amber-200 mb-4">{title}</h3>
      <p className="text-sm sm:text-base text-amber-100 font-light">{description}</p>
    </motion.div>
  )
}
