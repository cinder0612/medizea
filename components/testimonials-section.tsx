'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const testimonials = [
  {
    quote: "Calm has transformed my daily routine. The personalized meditations are exactly what I needed.",
    author: "Owen J.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mikael-QkqU5kG1d95xFyoBJLqx68OesnFony.png"
  },
  {
    quote: "As a busy professional, Calm helps me stay focused and reduces my stress levels significantly.",
    author: "Michael T.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mike-wexR3DZxUCZ9fVTAYN0tsC5tGRqcVq.png"
  },
  {
    quote: "The AI-generated sessions feel incredibly tailored to my needs. It's like having a personal meditation guide.",
    author: "Emily R.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/emily-hFvve6PT49kc3BJXBdY5zTkv3spblO.png"
  }
]

export default function TestimonialsSection() {
  const [[page, direction], setPage] = useState([0, 0])

  const paginate = useCallback((newDirection: number) => {
    setPage(([currentPage]) => [
      (currentPage + newDirection + testimonials.length) % testimonials.length,
      newDirection
    ])
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1)
    }, 5000)
    return () => clearInterval(timer)
  }, [paginate])

  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-thin text-center text-amber-200 mb-16">What Our Users Say</h2>
        <div className="relative h-[300px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full"
            >
              <TestimonialCard {...testimonials[page]} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
}

function TestimonialCard({ 
  quote, 
  author, 
  imageUrl 
}: { 
  quote: string;
  author: string;
  imageUrl: string;
}) {
  return (
    <motion.div 
      className="p-6 rounded-lg border border-amber-500/20 transition-all duration-300 ease-in-out hover:border-amber-500/40 hover:bg-amber-500/5 max-w-2xl mx-auto bg-black/50 backdrop-blur-sm"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
          <Image
            src={imageUrl}
            alt={author}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
        <p className="text-amber-200 font-light text-lg">{author}</p>
      </div>
      <p className="text-amber-100 italic text-lg font-light">{quote}</p>
    </motion.div>
  )
}

