'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { AIPromptEnhancer } from './ai-prompt-enhancer'
import { AudioPlayer } from './audio-player'
import { Loader2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

async function callEndpoint(meditationPrompt: string, musicPrompt: string, duration: number) {
  const url = 'https://gkjtt9.buildship.run/meditate-gpt-7e3f26e83a6d'
  const data = { meditationPrompt, musicPrompt, duration }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.text()
}

const MeditationGenerator = () => {
  const [meditationPrompt, setMeditationPrompt] = useState('')
  const [musicPrompt, setMusicPrompt] = useState('')
  const [duration, setDuration] = useState('300')
  const [audioUrl, setAudioUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (audioUrl || isPlaying) {
      return
    }

    setIsLoading(true)

    try {
      // Fetch image from Unsplash
      const imageResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(meditationPrompt)}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`
      )
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image')
      }
      const imageData = await imageResponse.json()
      if (imageData.results && imageData.results.length > 0) {
        setImageUrl(imageData.results[0].urls.regular)
      }

      // Fetch meditation audio
      const result = await callEndpoint(meditationPrompt, musicPrompt, Number(duration))
      if (result && result.startsWith('https://')) {
        setAudioUrl(result.trim())
      } else {
        throw new Error('Invalid audio URL received from the API: ' + result)
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to generate meditation. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnhancedPrompts = (enhancedMeditationPrompt: string, enhancedMusicPrompt: string) => {
    setMeditationPrompt(enhancedMeditationPrompt)
    setMusicPrompt(enhancedMusicPrompt)
  }

  const handleReset = () => {
    setMeditationPrompt('')
    setMusicPrompt('')
    setDuration('')
    setAudioUrl('')
    setIsPlaying(false)
    setIsLoading(false)
    setImageUrl(null)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/10 backdrop-blur-xl border border-amber-500/20 transition-all duration-500 shadow-2xl rounded-xl overflow-hidden hover:bg-black/20">
      <CardHeader className="space-y-6 p-6 sm:p-8">
        <CardTitle className="text-5xl font-extralight text-center text-amber-200">
          Your Personal Meditation Guide
        </CardTitle>
        <CardDescription className="text-amber-100 text-center text-lg leading-relaxed font-extralight tracking-wide">
          Experience tranquility with Calm's AI-powered meditation creator. Craft a unique and immersive session tailored to your preferences for a peaceful mind and relaxed body.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-4 sm:px-8 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="space-y-10 w-full max-w-2xl mx-auto relative bg-black/10 p-6 rounded-lg">
          <Button
            type="button"
            onClick={handleReset}
            className="absolute top-0 right-0 bg-transparent hover:bg-amber-800/20 text-amber-400 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <div className="space-y-4">
            <Label htmlFor="meditationPrompt" className="text-amber-200 block text-xl font-extralight tracking-wide">
              Meditation Theme
            </Label>
            <textarea
              id="meditationPrompt"
              value={meditationPrompt}
              onChange={(e) => setMeditationPrompt(e.target.value)}
              required
              className="w-full bg-black/30 border border-amber-500/20 text-amber-100 placeholder:text-amber-200/30 rounded-lg p-6 resize-none mx-auto block min-h-[140px] transition-shadow duration-300 focus:ring-2 focus:ring-amber-500/50 text-lg font-extralight"
              placeholder="e.g., Forest tranquility, Ocean waves"
            />
          </div>

          <div className="space-y-4 relative">
            <Label htmlFor="musicPrompt" className="text-amber-200 block text-xl font-extralight tracking-wide">
              Music Atmosphere
            </Label>
            <textarea
              id="musicPrompt"
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              required
              className="w-full bg-black/30 border border-amber-500/20 text-amber-100 placeholder:text-amber-200/30 rounded-lg p-6 resize-none mx-auto block min-h-[140px] transition-shadow duration-300 focus:ring-2 focus:ring-amber-500/50 text-lg font-extralight"
              placeholder="e.g., Gentle nature sounds, Soft piano"
            />
            <AIPromptEnhancer
              meditationPrompt={meditationPrompt}
              musicPrompt={musicPrompt}
              onEnhancedPrompts={handleEnhancedPrompts}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="duration" className="text-amber-200 block text-xl font-extralight tracking-wide">
              Duration (in seconds)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              min="1"
              max="600"
              className="w-full bg-black/30 border border-amber-500/20 text-amber-100 placeholder:text-amber-200/30 rounded-lg p-6 mx-auto block transition-shadow duration-300 focus:ring-2 focus:ring-amber-500/50 text-lg font-extralight h-16"
              placeholder="Enter duration (1-600 seconds)"
            />
          </div>

          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              disabled={isLoading || isPlaying}
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black w-[200px] h-12 flex items-center justify-center gap-2 text-base font-medium rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 text-black" />
                  <span className="ml-2 text-black font-medium">Creating...</span>
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>

          {isLoading && (
            <p className="text-amber-200/70 text-center text-lg font-extralight mt-6">
              This process may take a few minutes. Please be patient while we create your personalized meditation.
            </p>
          )}

          {imageUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full mx-auto mt-8 space-y-8"
            >
              <div className="relative w-full overflow-hidden rounded-lg shadow-lg" style={{ aspectRatio: '16/9' }}>
                <img
                  src={imageUrl}
                  alt="Meditation-related image"
                  className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          )}

          {audioUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full mx-auto mt-8"
            >
              <AudioPlayer 
                src={audioUrl} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </motion.div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default MeditationGenerator
