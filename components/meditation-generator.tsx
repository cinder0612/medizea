'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { AIPromptEnhancer } from './ai-prompt-enhancer'
import { Loader2, RotateCcw, Clock, Diamond } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MeditationImageCarousel } from './meditation-image-carousel'

async function callEndpoint(meditationPrompt: string, musicPrompt: string, duration: number) {
  const url = 'https://gkjtt9.buildship.run/meditate-gpt-7e3f26e83a6d'
  const data = { 
    meditationPrompt, 
    musicPrompt, 
    duration: Math.max(60, Math.min(3600, duration * 60)) // Convert minutes to seconds, min 60s, max 3600s
  }

  console.log('Sending request to Buildship:', data)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Buildship API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    throw new Error(`Meditation generation failed: ${errorText || response.statusText}`)
  }

  const responseData = await response.text()
  console.log('Buildship response:', responseData)
  return responseData
}

const MeditationGenerator = () => {
  const [meditationPrompt, setMeditationPrompt] = useState('')
  const [musicPrompt, setMusicPrompt] = useState('')
  const [duration, setDuration] = useState('5') // Default to 5 minutes
  const [audioUrl, setAudioUrl] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [availableCredits, setAvailableCredits] = useState(0)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [meditationImages, setMeditationImages] = useState<string[]>([])
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth')
          return
        }

        // Fetch credits
        const { data: creditsData, error: creditsError } = await supabase
          .from('user_credits')
          .select('available_credits')
          .eq('user_id', user.id)
          .single()

        if (creditsError && creditsError.code !== 'PGRST116') {
          console.error('Error fetching credits:', creditsError)
        } else {
          setAvailableCredits(creditsData?.available_credits || 0)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchUserData()
  }, [supabase, router])

  const handleCleanup = async (userId: string, minutes: number) => {
    if (isGenerating) {
      try {
        console.log('Attempting to refund credits for user:', userId, 'minutes:', minutes)
        const { data: refundResult, error: refundError } = await supabase
          .rpc('refund_meditation_credits', {
            p_minutes: minutes,
            p_user_id: userId
          })

        console.log('Refund result:', refundResult, 'Error:', refundError)

        if (refundError) {
          console.error('Failed to refund credits during cleanup:', refundError)
          toast({
            title: "Error",
            description: "Failed to refund credits. Please contact support.",
            variant: "destructive",
          })
          return
        }

        if (!refundResult || !refundResult.success) {
          const errorMsg = refundResult?.error || 'Unknown error'
          console.error('Refund failed:', errorMsg)
          toast({
            title: "Error",
            description: `Failed to refund credits: ${errorMsg}`,
            variant: "destructive",
          })
          return
        }

        setAvailableCredits(refundResult.remaining_credits)
        toast({
          title: "Generation Cancelled",
          description: `${refundResult.credits_refunded} credits have been refunded.`,
        })
      } catch (error) {
        console.error('Cleanup error:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred during cleanup. Please contact support.",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [abortController])

  const handleCancel = async () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
      setIsGenerating(false)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const minutes = Math.ceil(Number(duration))
        await handleCleanup(user.id, minutes)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (audioUrl || isPlaying || isGenerating) {
      console.log('Already playing, has audio, or generation in progress, skipping...')
      return
    }

    if (!meditationPrompt || !musicPrompt || !duration) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const controller = new AbortController()
    setAbortController(controller)

    try {
      setIsGenerating(true)
      console.log('Starting meditation generation...')
      
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Auth error:', userError)
        throw new Error('Please log in to continue')
      }

      // Fetch meditation images right away
      const images = await fetchMeditationImages(meditationPrompt)
      setMeditationImages(images)

      // Check if user has enough credits first
      const requestedMinutes = Math.ceil(Number(duration))
      const requiredCredits = requestedMinutes * 10

      const { data: userCredits, error: creditCheckError } = await supabase
        .from('user_credits')
        .select('available_credits')
        .eq('user_id', user.id)
        .single()

      if (creditCheckError) {
        console.error('Error checking credits:', creditCheckError)
        throw new Error(`Failed to check credits: ${creditCheckError.message}`)
      }

      if (!userCredits || userCredits.available_credits < requiredCredits) {
        const availableMinutes = Math.floor((userCredits?.available_credits || 0) / 10);
        const requestedMinutes = Math.ceil(Number(duration));
        toast({
          title: "⚠️ Not Enough Credits",
          description: `You can only generate up to ${availableMinutes} minutes of meditation with your current credits (${userCredits?.available_credits || 0} credits). Please try a shorter duration or get more credits from the dashboard.`,
          variant: "destructive",
          duration: 6000,
        })
        setIsGenerating(false)
        return
      }

      setIsLoading(true)

      let creditResult;
      try {
        // First deduct the credits
        const { data: deductResult, error: creditError } = await supabase
          .rpc('deduct_meditation_credits', {
            p_user_id: user.id,
            p_minutes: requestedMinutes
          })

        if (creditError || !deductResult?.success) {
          throw new Error(`Failed to deduct meditation credits: ${creditError?.message || deductResult?.error}`)
        }

        creditResult = deductResult;
        
        // Then try to generate the meditation
        const durationInMinutes = Math.max(1, Math.min(60, Number(duration) || 5));
        const audioData = await callEndpoint(meditationPrompt, musicPrompt, durationInMinutes)
        
        // Store the meditation in the database
        const { error: saveMeditationError } = await supabase
          .from('meditations')
          .insert({
            user_id: user.id,
            meditation_prompt: meditationPrompt,
            music_prompt: musicPrompt,
            duration: durationInMinutes,
            audio_url: audioData
          })

        if (saveMeditationError) {
          console.error('Error saving meditation:', saveMeditationError)
          throw new Error('Failed to save meditation. Please try again.')
        }
        
        // If successful, update UI
        setAudioUrl(audioData)
        setIsLoading(false)
        setAvailableCredits(creditResult.remaining_credits)

        toast({
          title: "Meditation Generated",
          description: "Your meditation is ready to play!",
        })
      } catch (error) {
        console.error('Error:', error)
        setIsLoading(false)

        // If we successfully deducted credits but the generation failed, refund them
        if (creditResult?.success) {
          try {
            const { data: refundResult, error: refundError } = await supabase
              .rpc('refund_meditation_credits', {
                p_user_id: user.id,
                p_minutes: requestedMinutes
              })

            if (refundError || !refundResult?.success) {
              console.error('Failed to refund credits:', refundError || refundResult?.error)
              toast({
                title: "Critical Error",
                description: "Meditation generation failed and credit refund failed. Our team has been notified and will assist you.",
                variant: "destructive",
              })
              // TODO: Add error logging/reporting here
              return
            }

            // Update credits display after refund
            setAvailableCredits(refundResult.refunded_credits)
          } catch (refundError) {
            console.error('Refund error:', refundError)
            toast({
              title: "Critical Error",
              description: "Failed to refund credits after meditation generation error. Our team has been notified and will assist you.",
              variant: "destructive",
            })
            // TODO: Add error logging/reporting here
            return
          }
        }

        // Show the original error to the user
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to generate meditation. Your credits have been refunded.',
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setIsLoading(false)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to process request. Please try again.',
        variant: "destructive",
      })
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
    setIsGenerating(false)
  }

  const fetchMeditationImages = async (prompt: string) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt + ' meditation zen peaceful')}&per_page=10`,
        {
          headers: {
            'Authorization': `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
          }
        }
      )
      
      if (!response.ok) throw new Error('Failed to fetch images')
      
      const data = await response.json()
      return data.results.map((img: any) => img.urls.regular)
    } catch (error) {
      console.error('Error fetching images:', error)
      return []
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-20 px-4">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <Image
          src="/brands/meditation.png"
          alt="Meditation Background"
          fill
          className="opacity-20 object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto transition-all duration-500">
        <Card className="relative bg-black/40 backdrop-blur-xl border border-amber-500/20 transition-all duration-500 shadow-2xl rounded-xl overflow-hidden hover:bg-black/50 shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_-5px_rgba(251,191,36,0.5)]">
          <CardHeader className="space-y-6 p-6 sm:p-8 transition-all duration-500 group-hover:text-amber-100">
            <CardTitle className="text-5xl font-extralight text-center text-amber-200">
              Your Personal Meditation Guide
            </CardTitle>
            <CardDescription className="text-amber-100 text-center text-lg leading-relaxed font-extralight tracking-wide">
              Experience tranquility with Calm's AI-powered meditation creator. Craft a unique and immersive session tailored to your preferences for a peaceful mind and relaxed body.
            </CardDescription>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-amber-400">
                <Diamond className="w-4 h-4" />
                <span>Credits: {availableCredits}</span>
              </div>
            </div>
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
                  Duration (in minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  min="1"
                  max="60"
                  className="w-full bg-black/30 border border-amber-500/20 text-amber-100 placeholder:text-amber-200/30 rounded-lg p-6 mx-auto block transition-shadow duration-300 focus:ring-2 focus:ring-amber-500/50 text-lg font-extralight h-16"
                  placeholder="Enter duration (1-60 minutes)"
                />
              </div>

              <div className="flex justify-center mt-6">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex items-center gap-4 bg-black/30 px-6 py-3 rounded-lg">
                      <Loader2 className="animate-spin w-5 h-5 text-amber-400" />
                      <span className="text-amber-200">Generating your meditation...</span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-white px-6"
                    >
                      Cancel Generation
                    </Button>
                    <p className="text-amber-200/70 text-center text-sm mt-2">
                      This may take a few minutes. You can cancel at any time.
                    </p>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || isPlaying || isGenerating}
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
                )}
              </div>

              {isLoading && !isGenerating && (
                <p className="text-amber-200/70 text-center text-lg font-extralight mt-6">
                  This process may take a few minutes. Please be patient while we create your personalized meditation.
                </p>
              )}

              {meditationImages.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full mx-auto mt-8 space-y-8"
                >
                  <MeditationImageCarousel images={meditationImages} />
                </motion.div>
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
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MeditationGenerator
