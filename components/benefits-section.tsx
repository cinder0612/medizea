'use client'

import { motion } from 'framer-motion'
import { Wind, Brain, Moon, Heart } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function BenefitsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2 
          className="text-5xl font-thin text-center text-amber-200 mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Benefits of Meditation
        </motion.h2>
        
        <motion.div 
          className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <BenefitItem
            icon={Wind}
            title="Reduced Stress"
            description="Regular meditation helps lower cortisol levels, promoting relaxation and reducing stress."
          />
          <BenefitItem
            icon={Brain}
            title="Improved Focus"
            description="Meditation enhances cognitive function and increases attention span, leading to better focus."
          />
          <BenefitItem
            icon={Moon}
            title="Better Sleep"
            description="Practicing meditation can help improve sleep quality and combat insomnia."
          />
          <BenefitItem
            icon={Heart}
            title="Emotional Well-being"
            description="Meditation promotes emotional balance and helps manage anxiety and depression."
          />
        </motion.div>
      </div>
    </section>
  )
}

function BenefitItem({ 
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
      variants={itemVariants}
      className="bg-black/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
    >
      <div className="flex items-center mb-3">
        <Icon className="w-8 h-8 text-amber-200 mr-3 stroke-[1]" />
        <h3 className="text-2xl font-light text-amber-200">
          {title}
        </h3>
      </div>
      <p className="text-amber-100 leading-relaxed font-light">
        {description}
      </p>
    </motion.div>
  )
}
