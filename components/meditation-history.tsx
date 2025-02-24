'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'
import { Play, Pause, Clock, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

interface Meditation {
  id: string
  title: string
  meditation_prompt: string
  music_prompt: string
  duration: number
  audio_url: string
  created_at: string
}

export function MeditationHistory() {
  const [meditations, setMeditations] = useState<Meditation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchMeditations()
  }, [])

  const fetchMeditations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('meditations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setMeditations(data || [])
    } catch (error) {
      console.error('Error fetching meditations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (meditationId: string) => {
    try {
      setDeletingId(meditationId)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: meditationData, error: fetchError } = await supabase
        .from('meditations')
        .select('id')
        .eq('id', meditationId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !meditationData) {
        throw new Error('Meditation not found or unauthorized')
      }

      const { error: deleteError } = await supabase
        .from('meditations')
        .delete()
        .eq('id', meditationId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setMeditations(meditations.filter(m => m.id !== meditationId))
      toast({
        title: "Meditation deleted",
        description: "Your meditation session has been deleted successfully."
      })
    } catch (error) {
      console.error('Error deleting meditation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete meditation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-pulse text-amber-200">Loading meditations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-light text-amber-200 mb-8">Your Meditation History</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {meditations.map((meditation) => (
            <motion.div
              key={meditation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="col-span-1"
            >
              <Card className="bg-black/30 border border-amber-500/20 overflow-hidden hover:border-amber-500/40 transition-all duration-300 h-[320px]">
                <div className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-light text-amber-200 flex-1 line-clamp-1">
                      {meditation.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-2 text-amber-400/70 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{meditation.duration}m</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/10"
                        onClick={() => handleDelete(meditation.id)}
                        disabled={deletingId === meditation.id}
                      >
                        {deletingId === meditation.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete meditation</span>
                      </Button>
                    </div>
                  </div>

                  <div className="text-amber-200/70 text-sm">
                    {formatDistanceToNow(new Date(meditation.created_at), { addSuffix: true })}
                  </div>

                  {/* Card Content with Centered Audio */}
                  <div className="flex-1 flex flex-col">
                    {/* Spacer */}
                    <div className="flex-1" />
                    
                    {/* Centered Audio Player */}
                    <div className="h-[54px] flex items-center justify-center">
                      <audio
                        src={meditation.audio_url}
                        controls
                        className="w-full"
                        onPlay={() => setCurrentlyPlaying(meditation.id)}
                        onPause={() => setCurrentlyPlaying(null)}
                      />
                    </div>
                    
                    {/* Spacer */}
                    <div className="flex-1" />
                  </div>

                  {/* Footer */}
                  <div className="text-amber-200/50 text-sm line-clamp-2">
                    {meditation.meditation_prompt}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {meditations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-amber-200/70 text-lg">
            You haven't created any meditations yet.
          </p>
        </div>
      )}
    </div>
  )
}
