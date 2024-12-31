'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { EnhanceIcon } from "@/components/icons/enhance-icon"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AIPromptEnhancerProps {
  meditationPrompt: string
  musicPrompt: string
  onEnhancedPrompts: (enhancedMeditationPrompt: string, enhancedMusicPrompt: string) => void
}

export function AIPromptEnhancer({ meditationPrompt, musicPrompt, onEnhancedPrompts }: AIPromptEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)

  const enhancePrompts = async () => {
    if (!meditationPrompt.trim() && !musicPrompt.trim()) {
      toast({
        title: "No prompts to enhance",
        description: "Please enter at least one prompt.",
        variant: "destructive",
      })
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meditationPrompt: meditationPrompt.trim(),
          musicPrompt: musicPrompt.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance prompts')
      }

      if (!data.success) {
        throw new Error('No content received from server')
      }

      onEnhancedPrompts(
        data.meditationPrompt || meditationPrompt,
        data.musicPrompt || musicPrompt
      )

      toast({
        title: "Prompts enhanced",
        description: "Your prompts have been enhanced.",
      })
    } catch (error) {
      console.error('Error in enhancePrompts:', error)
      toast({
        title: "Enhancement failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -right-12 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
            onClick={enhancePrompts}
            disabled={isEnhancing || (!meditationPrompt.trim() && !musicPrompt.trim())}
          >
            {isEnhancing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <EnhanceIcon className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enhance prompts with AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
