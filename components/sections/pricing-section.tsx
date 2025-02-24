'use client'

import { motion } from 'framer-motion'
import { fadeIn, fadeInUp, stagger } from '@/lib/animations'

export default function PricingSection() {
  return (
    <section className="py-20">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
        className="container mx-auto px-4"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-4xl font-thin text-center text-amber-200 mb-16"
        >
          Choose Your Medizea Plan
        </motion.h2>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {/* Pricing cards */}
          {[/* your pricing plans */].map((plan, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="pricing-card"
            >
              {/* Pricing card content */}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
} 