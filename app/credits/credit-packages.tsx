'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Crown, Zap, Check, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

const creditPackages = [
  {
    name: 'Starter Pack',
    credits: 100,
    bonus: 5,
    totalCredits: 105,
    price: 10.00,
    features: ['Perfect for beginners', '24/7 Support'],
    priceId: 'price_1QeLxDIfIBf9ivekXzPPzWdJ'
  },
  {
    name: 'Basic Pack',
    credits: 300,
    bonus: 20,
    totalCredits: 320,
    price: 28.00,
    features: ['Enhanced processing speed', '24/7 Priority support'],
    priceId: 'price_1QeLzJIfIBf9iveksuGECwBc'
  },
  {
    name: 'Pro Pack',
    credits: 500,
    bonus: 50,
    totalCredits: 550,
    price: 45.00,
    features: ['Valid for 3 months', '15% faster processing', 'Premium support'],
    priceId: 'price_1QeM0xIfIBf9ivekkIcojhow',
    highlight: true
  },
  {
    name: 'Advanced Pack',
    credits: 1000,
    bonus: 150,
    totalCredits: 1150,
    price: 90.00,
    features: ['20% faster processing', 'Priority queue access', 'Premium support'],
    priceId: 'price_1QeM3gIfIBf9ivekcnA1qkSx'
  },
  {
    name: 'Ultimate Pack',
    credits: 5000,
    bonus: 750,
    totalCredits: 5750,
    price: 400.00,
    features: ['30% faster processing', 'Instant priority access', 'Dedicated support line'],
    priceId: 'price_1QeM5eIfIBf9ivekvb8ZvDAI'
  }
]

interface Props {
  userId: string
}

export default function CreditPackages({ userId }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  const handlePurchase = async (priceId: string) => {
    if (loading || isNavigating) return
    
    try {
      setLoading(priceId)
      const response = await fetch('/api/create-credits-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to create checkout session');
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      if (data.url) {
        setIsNavigating(true)
        router.push(data.url)
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create checkout session. Please try again.',
        variant: 'destructive'
      })
      setIsNavigating(false)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {creditPackages.map((pack) => (
          <Card
            key={pack.priceId}
            className={`relative flex flex-col min-h-[440px] bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl overflow-hidden transform-gpu hover:shadow-amber-500/10 transition-all duration-300 ${
              pack.highlight ? 'ring-2 ring-amber-500 bg-black/40' : ''
            }`}
          >
            {pack.highlight && (
              <div className="absolute -right-[4.5rem] top-7 rotate-45 bg-amber-500 px-14 py-1 text-sm font-medium text-black">
                Most Popular
              </div>
            )}
            
            <CardHeader className="pb-6 pt-5 px-5">
              <div className="flex items-center gap-2 mb-3">
                {pack.name === 'Ultimate Pack' ? <Crown className="h-5 w-5 text-amber-500" /> :
                 pack.name === 'Pro Pack' ? <Zap className="h-5 w-5 text-amber-500" /> :
                 <Sparkles className="h-5 w-5 text-amber-500" />}
                <h3 className="text-lg font-medium text-amber-200">{pack.name}</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">${pack.price.toFixed(2)}</span>
                <span className="text-sm text-zinc-500">USD</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-6 px-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Base Credits</span>
                  <span className="font-medium text-white">{pack.credits.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Bonus Credits</span>
                  <span className="text-amber-500">+{pack.bonus.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-medium text-zinc-300">Total Credits</span>
                  <span className="font-bold text-white">{pack.totalCredits.toLocaleString()}</span>
                </div>
              </div>

              {pack.features.length > 0 && (
                <div className="space-y-3">
                  {pack.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="h-4 w-4 text-amber-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="p-5">
              <Button
                variant="default"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium py-3 rounded-lg transition-colors"
                onClick={() => handlePurchase(pack.priceId)}
                disabled={loading === pack.priceId || isNavigating}
              >
                {loading === pack.priceId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : isNavigating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Redirecting...
                  </>
                ) : (
                  'Purchase'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
