import { Star, Crown, Sparkles } from 'lucide-react'

export interface PlanConfig {
  id: string
  name: string
  description: string
  price: number
  priceId: string
  features: string[]
  icon: any
  highlighted: boolean
}

export const PLANS: PlanConfig[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for getting started with meditation',
    price: 9.99,
    priceId: 'price_1QSRCGIfIBf9ivekBp2fRf03',
    features: [
      'Basic meditation generator',
      '5 meditations per month',
      'Standard audio quality',
      'Email support'
    ],
    icon: Star,
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Most popular for meditation enthusiasts',
    price: 19.99,
    priceId: 'price_1QSRGeIfIBf9ivekryJ7zq49',
    features: [
      'Advanced meditation generator',
      'Unlimited meditations',
      'High-quality audio',
      'Priority email support',
      'Custom meditation length',
      'Background music library'
    ],
    icon: Crown,
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for serious practitioners',
    price: 29.99,
    priceId: 'price_1QSRGEIfIBf9iveko6Cj79JN',
    features: [
      'Everything in Premium',
      'Guided meditation library',
      'Meditation progress tracking',
      'Personal meditation coach',
      'Custom meditation scripts',
      'API access'
    ],
    icon: Sparkles,
    highlighted: false,
  }
]

export const getPlanByPriceId = (priceId: string): PlanConfig | undefined => {
  return PLANS.find(plan => plan.priceId === priceId)
}

export const getPlanByName = (name: string): PlanConfig | undefined => {
  return PLANS.find(plan => plan.name.toLowerCase() === name.toLowerCase())
}
