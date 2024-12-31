'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "@/components/hooks/use-toast"
import { createCheckoutSession } from '@/utils/subscription'

interface CheckoutButtonProps {
  priceId: string
  planName: string
  price: string
}

export function CheckoutButton({ priceId, planName, price }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const url = await createCheckoutSession(priceId) // Call createCheckoutSession from utils
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full bg-amber-500 hover:bg-amber-600 text-black"
    >
      {isLoading ? 'Processing...' : `Subscribe - ${price}`}
    </Button>
  )
}
