'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()
  
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only handle scroll on home page
    if (pathname === '/') {
      e.preventDefault()
      const featuresSection = document.getElementById('features')
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="hidden md:flex ml-10 items-center space-x-4">
      <Link href={pathname === '/' ? '#features' : '/#features'} onClick={scrollToFeatures}>
        <Button variant="ghost" className="text-amber-100/70 hover:text-amber-200">
          Features
        </Button>
      </Link>
      <Link href="/about">
        <Button variant="ghost" className="text-amber-100/70 hover:text-amber-200">
          About
        </Button>
      </Link>
      <Link href="/pricing">
        <Button variant="ghost" className="text-amber-100/70 hover:text-amber-200">
          Pricing
        </Button>
      </Link>
    </div>
  )
}
