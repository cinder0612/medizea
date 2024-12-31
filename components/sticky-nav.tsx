'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function StickyNav() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > window.innerHeight) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 bg-black/70 border-b border-amber-200/20 z-50"
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="text-amber-200 font-light">Calm</Link>
        <button className="sm:hidden text-amber-200 hover:text-amber-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block space-x-4">
          <Link href="#features" className="text-amber-200 hover:text-amber-300">Features</Link>
          <Link href="#how-it-works" className="text-amber-200 hover:text-amber-300">How It Works</Link>
          <Link href="#start" className="text-amber-200 hover:text-amber-300">Start Now</Link>
        </div>
      </div>
    </motion.nav>
  )
}

