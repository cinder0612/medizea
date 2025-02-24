import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Settings } from 'lucide-react'

export function SubscriptionManager() {
  const [isLoading, setIsLoading] = useState(false)

  const redirectToCustomerPortal = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create portal session')
      }

      const data = await response.json()
      
      if (!data.url) {
        throw new Error('No portal URL received')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Portal session error:', error)
      toast({
        title: 'Subscription Management Error',
        description: error instanceof Error ? error.message : 'Failed to open subscription management. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={redirectToCustomerPortal}
      disabled={isLoading}
      variant="outline"
      className="bg-black/10 hover:bg-black/20 border-amber-500/20 text-amber-100 hover:text-amber-50"
    >
      <Settings className="mr-2 h-4 w-4" />
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  )
}
