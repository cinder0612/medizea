'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { Check, X, Clock, Coins, Sparkles, Settings, History, Download, HeadphonesIcon, Palette, BarChart, LineChart, Mic, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function PricingComparison() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth?mode=signin')
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-thin text-amber-200 mb-6">
            Choose Your Medizea Plan
          </h2>
          <p className="text-xl text-amber-100/80 mb-12 max-w-3xl mx-auto">
            Find the perfect plan to enhance your meditation journey
          </p>
        </motion.div>

        {/* Enhanced Comparison Table */}
        <motion.div className="max-w-6xl mx-auto overflow-x-auto pt-8" {...fadeInUp}>
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-4 pt-8 text-left text-amber-200">Features</th>
                <th className="p-4 pt-8 text-center text-amber-200">
                  <div className="text-xl mb-2">Basic</div>
                  <div className="text-3xl font-light mb-2">$29.99</div>
                  <div className="text-sm text-amber-100/70">per month</div>
                </th>
                <th className="p-4 pt-8 text-center text-amber-200 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-400 text-black text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 rounded-2xl p-4">
                    <div className="text-xl mb-2">Pro</div>
                    <div className="text-3xl font-light mb-2">$99.99</div>
                    <div className="text-sm text-amber-100/70">per month</div>
                  </div>
                </th>
                <th className="p-4 pt-8 text-center text-amber-200">
                  <div className="text-xl mb-2">Premium</div>
                  <div className="text-3xl font-light mb-2">$299.99</div>
                  <div className="text-sm text-amber-100/70">per month</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-amber-500/5 transition-colors"
                >
                  <td className="p-4 text-amber-100">
                    <div className="flex items-center gap-2">
                      {feature.icon}
                      <span>{feature.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {renderFeatureValue(feature.basic)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 rounded-xl py-2">
                      {renderFeatureValue(feature.pro)}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {renderFeatureValue(feature.premium)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Value Props */}
        <motion.div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" {...fadeInUp}>
          <div className="text-center">
            <div className="text-2xl text-amber-400 mb-2">30-Day Guarantee</div>
            <p className="text-amber-100/70">Try risk-free with our money-back guarantee</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-amber-400 mb-2">Cancel Anytime</div>
            <p className="text-amber-100/70">No long-term contracts or commitments</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-amber-400 mb-2">24/7 Support</div>
            <p className="text-amber-100/70">Get help whenever you need it</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div className="text-center mt-16" {...fadeInUp}>
          <Button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black px-12 py-6 text-xl font-medium rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Start Your Transformation Today
          </Button>
          <p className="mt-4 text-amber-100/70">
            Join thousands of satisfied users who have transformed their lives
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// Helper function to render feature values
const renderFeatureValue = (value: boolean | string) => {
  if (typeof value === 'string') {
    return <span className="text-amber-400">{value}</span>
  }
  return value ? (
    <Check className="w-5 h-5 text-amber-400 mx-auto" />
  ) : (
    <X className="w-5 h-5 text-amber-100/30 mx-auto" />
  )
}

// Enhanced features array with icons
const features = [
  {
    name: "Monthly Meditation Time",
    icon: <Clock className="w-5 h-5 text-amber-400" />,
    basic: "10 minutes",
    pro: "30 minutes",
    premium: "60 minutes"
  },
  {
    name: "Monthly Credits",
    icon: <Coins className="w-5 h-5 text-amber-400" />,
    basic: "100 credits",
    pro: "300 credits",
    premium: "600 credits"
  },
  {
    name: "AI-Generated Sessions",
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    basic: "Basic",
    pro: "Advanced",
    premium: "Premium"
  },
  {
    name: "Personalization",
    icon: <Settings className="w-5 h-5 text-amber-400" />,
    basic: "Limited",
    pro: "Enhanced",
    premium: "Full"
  },
  {
    name: "Session History",
    icon: <History className="w-5 h-5 text-amber-400" />,
    basic: "7 days",
    pro: "30 days",
    premium: "Unlimited"
  },
  {
    name: "Download Sessions",
    icon: <Download className="w-5 h-5 text-amber-400" />,
    basic: false,
    pro: true,
    premium: true
  },
  {
    name: "Priority Support",
    icon: <HeadphonesIcon className="w-5 h-5 text-amber-400" />,
    basic: false,
    pro: true,
    premium: true
  },
  {
    name: "Custom Themes",
    icon: <Palette className="w-5 h-5 text-amber-400" />,
    basic: false,
    pro: true,
    premium: true
  },
  {
    name: "Progress Analytics",
    icon: <BarChart className="w-5 h-5 text-amber-400" />,
    basic: false,
    pro: true,
    premium: true
  },
  {
    name: "Meditation Insights",
    icon: <LineChart className="w-5 h-5 text-amber-400" />,
    basic: false,
    pro: false,
    premium: true
  },
  {
    name: "Custom Voice Options",
    icon: <Mic className="w-5 h-5 text-amber-400" />,
    basic: false,
    pro: false,
    premium: true
  },
  {
    name: "Early Access Features",
    icon: <Star className="w-5 h-5 text-amber-400" />,
    basic: false,
    pro: false,
    premium: true
  }
]
