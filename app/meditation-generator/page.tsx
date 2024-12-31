'use client'

import MeditationGenerator from '@/components/meditation-generator'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const MeditationPage = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black/90 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent"></div>
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-amber-400/5 blur-3xl animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-amber-300/5 blur-3xl animate-float"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-6 left-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 transition-all duration-300"
          >
            ← Back Home
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <MeditationGenerator />
        </motion.div>
      </div>
    </div>
  )
}

export default MeditationPage
