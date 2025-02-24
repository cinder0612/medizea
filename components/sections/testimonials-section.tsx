'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import styles from './testimonials-section.module.css'
import { fadeIn, fadeInUp, stagger } from '@/lib/animations'

const topTestimonials = [
  {
    quote: "“Calm has transformed my daily routine. The personalized meditations are exactly what I needed to start my day focused.”",
    author: "Owen J.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mikael-QkqU5kG1d95xFyoBJLqx68OesnFony.png",
    note: "⭐️⭐️⭐️⭐️⭐️ 5/5 App Store Review"
  },
  {
    quote: "“As a busy professional, Calm helps me stay focused and reduces my stress levels significantly. Best mindfulness investment I've made.”",
    author: "Michael T.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mike-wexR3DZxUCZ9fVTAYN0tsC5tGRqcVq.png",
    note: "Featured in TechCrunch"
  },
  {
    quote: "“The AI-generated sessions feel incredibly tailored to my needs. It's like having a personal meditation guide available 24/7.”",
    author: "Emily R.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/emily-hFvve6PT49kc3BJXBdY5zTkv3spblO.png",
    note: "2024 Wellness App Award Winner"
  }
]

const bottomTestimonials = [
  {
    quote: "“Revolutionary workflow optimization helped our team achieve 40% faster project completion rates. Essential for modern workplaces.”",
    author: "David K.",
    imageUrl: "https://i.ibb.co/MkVsdnPR/man1.png",
    note: "Verified Enterprise Client"
  },
  {
    quote: "“Real-time analytics transformed how we make data-driven decisions. The insights dashboard alone is worth the subscription.”",
    author: "Sarah L.",
    imageUrl: "https://i.ibb.co/7thbPvPY/woman2.png",
    note: "CIO Magazine Top Pick"
  },
  {
    quote: "“The collaboration features eliminated communication barriers across our global teams. Finally, a tool that truly connects us.”",
    author: "James P.",
    imageUrl: "https://i.ibb.co/zWn2cGBn/man2.png",
    note: "Global Team of 500+ Users"
  }
]

export default function TestimonialsSection() {
  const scrollTrackTopRef = useRef<HTMLDivElement>(null);
  const scrollTrackBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollTop = () => {
      if (scrollTrackTopRef.current) {
        if (scrollTrackTopRef.current.scrollLeft >= scrollTrackTopRef.current.scrollWidth / 2) {
          scrollTrackTopRef.current.scrollLeft = 0;
        } else {
          scrollTrackTopRef.current.scrollLeft += 1;
        }
      }
    };

    const scrollBottom = () => {
      if (scrollTrackBottomRef.current) {
        if (scrollTrackBottomRef.current.scrollLeft <= 0) {
          scrollTrackBottomRef.current.scrollLeft = scrollTrackBottomRef.current.scrollWidth / 2;
        } else {
          scrollTrackBottomRef.current.scrollLeft -= 1;
        }
      }
    };

    const topInterval = setInterval(scrollTop, 20);
    const bottomInterval = setInterval(scrollBottom, 20);

    return () => {
      clearInterval(topInterval);
      clearInterval(bottomInterval);
    };
  }, []);

  return (
    <section className={`${styles.testimonialSection} py-32`}>
      <motion.h2 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="text-4xl font-thin text-center text-amber-200 mb-24"
      >
        What Our Users Say
      </motion.h2>

      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeIn}
        className={`${styles.scrollContainer} mt-8`}
      >
        <div className={styles.scrollTrack} ref={scrollTrackTopRef}>
          {[...topTestimonials, ...topTestimonials].map((testimonial, index) => (
            <motion.div 
              key={`top-${index}`} 
              className={styles.testimonialBox}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
        
        <div className={styles.scrollTrack} ref={scrollTrackBottomRef}>
          {[...bottomTestimonials, ...bottomTestimonials].map((testimonial, index) => (
            <motion.div 
              key={`bottom-${index}`} 
              className={styles.testimonialBox}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function TestimonialCard({ 
  quote, 
  author, 
  imageUrl,
  note 
}: { 
  quote: string;
  author: string;
  imageUrl: string;
  note: string;
}) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="transition-all duration-300 ease-in-out"
    >
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-amber-300/30">
          <Image
            src={imageUrl}
            alt={author}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
        <p className="text-amber-300 font-medium text-lg">{author}</p>
      </div>
      <p className="text-gray-200 text-lg leading-relaxed mb-2 italic">{quote}</p>
      <p className="text-amber-400/80 text-sm font-light">{note}</p>
    </motion.div>
  )
}

