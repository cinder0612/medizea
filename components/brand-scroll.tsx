'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import aurio from './brands/aurio.svg'
import bytedance from './brands/bytedance.svg'
import delphi from './brands/delphi.svg'
import forbes from './brands/forbes.svg'
import journal from './brands/journal.svg'
import newYork from './brands/new york.svg'
const brands = [
  { name: 'Aurio', src: aurio },
  { name: 'ByteDance', src: bytedance },
  { name: 'Delphi', src: delphi },
  { name: 'Forbes', src: forbes },
  { name: 'Journal', src: journal },
  { name: 'New York', src: newYork },
]

export function BrandScroll() {
  return (
    <div className="w-full overflow-hidden py-8">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-lg font-light text-white/30 mb-8">
          Featured In
        </h3>
        
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-scroll gap-16 py-4">
            {/* First set of brands */}
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="relative h-12 w-32 flex-shrink-0 opacity-30 hover:opacity-60 transition-all duration-300"
              >
                <div className="mix-blend-screen">
                  <Image
                    src={brand.src}
                    alt={`${brand.name} logo`}
                    width={128}
                    height={48}
                    className="object-contain brightness-0 invert"
                    priority
                  />
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless scrolling */}
            {brands.map((brand) => (
              <div
                key={`${brand.name}-duplicate`}
                className="relative h-12 w-32 flex-shrink-0 opacity-30 hover:opacity-60 transition-all duration-300"
              >
                <div className="mix-blend-screen">
                  <Image
                    src={brand.src}
                    alt={`${brand.name} logo`}
                    width={128}
                    height={48}
                    className="object-contain brightness-0 invert"
                    priority
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
