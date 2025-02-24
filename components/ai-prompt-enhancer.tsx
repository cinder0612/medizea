'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { EnhanceIcon } from "./icons/enhance-icon"
import { Loader2 } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)

  const enhancePrompts = async () => {
    if (!meditationPrompt && !musicPrompt) {
      toast({
        title: "Error",
        description: "Please enter at least one prompt to enhance",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meditationPrompt, musicPrompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance prompts')
      }

      onEnhancedPrompts(
        data.enhancedMeditationPrompt || meditationPrompt,
        data.enhancedMusicPrompt || musicPrompt
      )

      toast({
        title: "Success",
        description: "Prompts enhanced successfully",
      })
    } catch (error) {
      console.error('Error enhancing prompts:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to enhance prompts',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
            disabled={isLoading || (!meditationPrompt && !musicPrompt)}
          >
            {isLoading ? (
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
