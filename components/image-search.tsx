'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageSearchProps {
  query: string
}

export function ImageSearch({ query }: ImageSearchProps) {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const searchImage = async () => {
      if (!query) return
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          setImage(data.results[0].urls.regular)
        } else {
          setError('No image found for the given prompt.')
        }
      } catch (err) {
        console.error('Error fetching image:', err)
        setError('An error occurred while fetching the image. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    searchImage()
  }, [query])

  if (loading) return <p className="text-amber-200">Loading image...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="image-search">
      <h3 className="text-xl font-light text-amber-200 mb-4">Meditation Image:</h3>
      {image && (
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          <Image
            src={image}
            alt="Meditation-related image"
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
      )}
    </div>
  )
}

