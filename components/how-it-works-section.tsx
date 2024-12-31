'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function HowItWorksSection() {
  return (
    <section className="py-24" id="how-it-works">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-thin text-center text-amber-200 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          How It Works
        </motion.h2>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-6 md:space-x-12">
          <StepItem number={1} title="Enter Prompt" description="Describe your desired meditation experience." />
          <ArrowRight className="hidden md:block h-6 w-6 text-amber-400" />
          <StepItem number={2} title="Enhance" description="Our AI refines and enhances your prompt." />
          <ArrowRight className="hidden md:block h-6 w-6 text-amber-400" />
          <StepItem number={3} title="Choose Duration" description="Select the length of your meditation session." />
          <ArrowRight className="hidden md:block h-6 w-6 text-amber-400" />
          <StepItem number={4} title="Enjoy" description="Immerse yourself in your personalized meditation." />
        </div>
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

