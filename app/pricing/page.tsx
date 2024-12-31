'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { PLANS } from '@/config/pricing'
import { Check, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/hooks/use-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PricingPage() {
  const { user, loading: authLoading, subscriptionStatus, refreshSubscriptionStatus } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    if (success === 'true') {
      refreshSubscriptionStatus()
      toast({
        title: "Success",
        description: "Your subscription has been updated successfully.",
      })
      router.push('/dashboard')
    } else if (canceled === 'true') {
      toast({
        title: "Canceled",
        description: "Subscription process was canceled.",
        variant: "destructive",
      })
    }
  }, [success, canceled, refreshSubscriptionStatus, router])

  const handleSubscribe = async (priceId: string) => {
    try {
      if (!user) {
        router.push('/auth?returnUrl=/pricing')
        return
      }

      setLoading(true)
      setSelectedPlan(priceId)

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          returnUrl: window.location.origin + '/pricing?success=true',
          cancelUrl: window.location.origin + '/pricing?canceled=true',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-8 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered meditation with our flexible pricing options
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.priceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`
                flex flex-col relative p-8 rounded-3xl border backdrop-blur-xl shadow-2xl
                ${plan.highlighted
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/10'
                  : 'bg-white/5 border-white/10 shadow-white/5'
                }
              `}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-black px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-amber-500">{plan.name}</h3>
                <p className="text-white/60 mb-6">{plan.description}</p>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-white mb-1">
                    ${plan.price}
                  </div>
                  <div className="text-lg font-normal text-white/60">per month</div>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.1 }}
                    className="flex items-center text-white/80"
                  >
                    <div className="rounded-full bg-amber-500/10 p-1 mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-amber-500" />
                    </div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading || authLoading || selectedPlan === plan.priceId || 
                  (subscriptionStatus?.tier === plan.id && subscriptionStatus?.status === 'active')}
                className={`
                  w-full py-6 text-lg font-medium relative z-10 rounded-xl transition-all duration-200
                  ${plan.highlighted
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white shadow-lg shadow-white/5 hover:shadow-white/10'
                  }
                `}
              >
                {loading && selectedPlan === plan.priceId ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Please wait
                  </span>
                ) : subscriptionStatus?.tier === plan.id && subscriptionStatus?.status === 'active' ? (
                  'Current Plan'
                ) : (
                  'Subscribe'
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-amber-500 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
