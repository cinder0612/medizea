'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function GallerySection() {
  const [images, setImages] = useState([])

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=meditation,yoga&per_page=6&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
      )
      const data = await response.json()
      setImages(data.results)
    }
    fetchImages()
  }, [])

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-thin text-center text-amber-200 mb-16">Meditation Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image: any) => (
            <motion.div 
              key={image.id} 
              className="relative h-64 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={image.urls.regular}
                alt={image.alt_description}
                layout="fill"
                objectFit="cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

