'use client'

import { motion } from 'framer-motion'
import { Sparkles, Headphones, Smartphone, BarChart2 } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function FeaturesSection() {
  return (
    <section className="py-24" id="features">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-thin text-center text-amber-200 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Why Choose Calm
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <FeatureItem
            icon={Sparkles}
            title="AI-Powered Personalization"
            description="Our advanced AI tailors each meditation to your unique needs and preferences."
          />
          <FeatureItem
            icon={Headphones}
            title="High-Quality Audio"
            description="Immerse yourself in crystal-clear, professionally produced meditation tracks."
          />
          <FeatureItem
            icon={Smartphone}
            title="Seamless Mobile Experience"
            description="Access your meditations anytime, anywhere with our user-friendly mobile app."
          />
          <FeatureItem
            icon={BarChart2}
            title="Progress Tracking"
            description="Monitor your meditation journey with detailed insights and statistics."
          />
        </motion.div>
      </div>
    </section>
  )
}

function FeatureItem({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div 
      className="flex flex-col items-center text-center group"
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        whileHover={{ 
          boxShadow: "0 0 8px 2px rgba(255, 225, 125, 0.5)", 
          scale: 1.1 
        }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400 mb-4 stroke-[1.5] transition-colors duration-200 group-hover:text-amber-300" />
      </motion.div>
      <h3 className="text-lg sm:text-xl font-light text-amber-200 mb-4">{title}</h3>
      <p className="text-sm sm:text-base text-amber-100 font-light">{description}</p>
    </motion.div>
  )
}

