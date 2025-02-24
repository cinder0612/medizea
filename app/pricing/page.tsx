'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { motion } from 'framer-motion'
import { BaseLayout } from '@/components/layouts/base-layout'
import { toast } from "@/components/ui/use-toast"
import { useState } from 'react'
import { Loader2 } from "lucide-react"
import { GradientBackground } from "@/components/shared/gradient-background"

const pricingPlans = [
  {
    name: 'Basic Plan',
    price: 29.99,
    features: [
      '10 minutes per month',
      '100 credits per month',
      'Basic meditation features',
      'Email support',
      'Access to meditation library'
    ],
    priceId: 'price_1QeLn1IfIBf9ivekghK86k8N'
  },
  {
    name: 'Pro Plan',
    price: 99.99,
    features: [
      '30 minutes per month',
      '300 credits per month',
      'Advanced meditation features',
      'Priority support',
      'Custom meditation settings',
      'Progress tracking'
    ],
    highlight: true,
    priceId: 'price_1QeLoMIfIBf9ivekW9TQeFyt'
  },
  {
    name: 'Premium Plan',
    price: 299.99,
    features: [
      '60 minutes per month',
      '600 credits per month',
      'All premium features',
      '24/7 Premium support',
      'Custom meditation solutions',
      'Advanced analytics',
      'Priority access to new features'
    ],
    priceId: 'price_1QeLpLIfIBf9ivekvP58R4d6'
  }
]

export default function PricingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push('/auth')
      return
    }

    setLoadingPriceId(priceId)

    try {
      console.log('Creating checkout session with priceId:', priceId)
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Checkout session error:', errorData)
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      if (!url) {
        throw new Error('No checkout URL received')
      }

      console.log('Redirecting to checkout:', url)
      window.location.href = url
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingPriceId(null)
    }
  }

  return (
    <BaseLayout>
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
        <GradientBackground />
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light text-amber-200 mb-4">
                Choose Your Journey
              </h1>
              <p className="text-amber-100/70 max-w-2xl mx-auto">
                Select the plan that best fits your meditation practice. Upgrade or downgrade anytime.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: pricingPlans.indexOf(plan) * 0.1 }}
                  className={`relative backdrop-blur-md bg-black/40 border ${
                    plan.highlight ? 'border-amber-400/50' : 'border-amber-500/20'
                  } rounded-lg p-6 flex flex-col shadow-xl`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-amber-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-light text-amber-200 mb-2">{plan.name}</h3>
                    <p className="text-3xl font-light text-amber-100 mb-4">
                      ${plan.price}
                      <span className="text-sm text-amber-100/70"> /month</span>
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center text-amber-100/70">
                          <span className="text-amber-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <Button
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={loadingPriceId !== null}
                      className={`w-full ${
                        plan.highlight
                          ? 'bg-amber-400 text-black hover:bg-amber-300'
                          : 'bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-black hover:from-orange-400 hover:to-amber-400 transition-all duration-300'
                      }`}
                    >
                      {loadingPriceId === plan.priceId ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Get Started'
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* FAQ or Additional Info */}
            <div className="text-center mt-12">
              <p className="text-amber-100/70">
                Questions? Contact our support team for assistance.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </BaseLayout>
  )
}
