'use client'

import * as React from "react"
import { Play, Pause, Volume2, MoreVertical, Square } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AudioPlayerProps {
  src: string
  onPlay?: () => void
  onPause?: () => void
}

export function AudioPlayer({ src, onPlay, onPause }: AudioPlayerProps) {
  const [playing, setPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause()
        onPause?.()
      } else {
        audioRef.current.play()
        onPlay?.()
      }
      setPlaying(!playing)
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      setPlaying(false)
      onPause?.()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - bounds.left) / bounds.width
    if (audioRef.current) {
      audioRef.current.currentTime = percent * duration
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="w-full bg-black/30 border border-amber-500/20 rounded-full shadow-lg p-4 flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-8 w-8 text-amber-400 hover:bg-amber-500/10 transition-colors"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="text-sm text-amber-400 min-w-[80px] font-light">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <div 
        className="relative flex-1 h-1.5 bg-amber-500/10 rounded-full cursor-pointer group"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div 
          className="absolute left-0 top-0 h-full bg-amber-500/30 rounded-full transition-all duration-100 group-hover:bg-amber-500/40"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleStop}
        className="h-8 w-8 text-amber-400 hover:bg-amber-500/10 transition-colors"
        aria-label="Stop"
      >
        <Square className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-amber-400 hover:bg-amber-500/10 transition-colors"
        aria-label="Volume"
      >
        <Volume2 className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-400 hover:bg-amber-500/10 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-black/90 border-amber-500/20">
          <DropdownMenuItem 
            onClick={() => window.open(src, '_blank')}
            className="text-amber-400 focus:bg-amber-500/10 focus:text-amber-300"
          >
            Download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
      />
    </div>
  )
}
