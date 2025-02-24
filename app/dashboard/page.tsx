'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BaseLayout } from '@/components/layouts/base-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { CreditCard, Clock, Diamond, LogOut, Settings, ArrowRight, Coins } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/providers/AuthProvider'
import { GradientBackground } from '@/components/shared/gradient-background'
import { motion } from 'framer-motion'
import { Progress } from "@/components/ui/progress"
import { SubscriptionManager } from '@/components/subscription-manager'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import AvatarUpload from '@/components/avatar-upload'
import { MeditationHistory } from '@/components/meditation-history'
import { fadeInUp } from '@/lib/animations'

const PLAN_LIMITS = {
  'basic': 10,     // 10 minutes = 100 credits
  'pro': 30,       // 30 minutes = 300 credits
  'premium': 60    // 60 minutes = 600 credits
}

const CREDITS_PER_MINUTE = 10
const MONTHLY_CREDITS = {
  'basic': 100,    // 10 minutes worth
  'pro': 300,      // 30 minutes worth
  'premium': 600   // 60 minutes worth
}

const formatDate = (dateString: string) => {
  // Split the timestamp into date components
  const date = dateString.split('T')[0];
  const [year, month, day] = date.split('-');
  return `${month}/${day}/${year}`;
};

export default function Dashboard() {
  const router = useRouter()
  const { user, isSubscribed } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [subscriptionData, setSubscriptionData] = useState<{
    status: string;
    currentPlan: string;
    previousPlan?: string;
    tierChangeDate?: string;
    cancellationDate?: string;
    cancellationEffectiveDate?: string;
    nextPlan?: string;
    currentPeriodEnd: string;
    currentMinutesPerMonth?: number;
    nextMinutesPerMonth?: number;
    currentCreditsPerMonth?: number;
    nextCreditsPerMonth?: number;
    cancelAtPeriodEnd?: boolean;
  } | null>(null);
  const [minutes, setMinutes] = useState({ available: 0, total: 0 })
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isManagingSubscription, setIsManagingSubscription] = useState(false)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true)
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      if (!data.url) {
        throw new Error('No portal URL received')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Subscription Management Error",
        description: error instanceof Error ? error.message : 'Failed to access subscription management. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsManagingSubscription(false)
    }
  }

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Fetch subscription status
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select(`
            id,
            user_id,
            subscription_status,
            subscription_tier,
            current_period_end,
            current_minutes_per_month,
            current_credits_per_month,
            next_minutes_per_month,
            next_credits_per_month,
            stripe_subscription_id,
            cancel_at_period_end,
            created_at,
            updated_at
          `)
          .eq('user_id', user.id)
          .single()

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subscriptionError)
        }

        // Fetch actual credits and minutes regardless of subscription status
        // Get actual available credits
        const { data: creditsData, error: creditsError } = await supabase
          .from('user_credits')
          .select('available_credits')
          .eq('user_id', user.id)
          .single()

        if (creditsError && creditsError.code !== 'PGRST116') {
          console.error('Error fetching credits:', creditsError)
        }
        setCredits(creditsData?.available_credits || 0)

        // Get actual available minutes
        const { data: minutesData, error: minutesError } = await supabase
          .from('user_meditation_minutes')
          .select('available_minutes, total_minutes')
          .eq('user_id', user.id)
          .single()

        if (minutesError && minutesError.code !== 'PGRST116') {
          console.error('Error fetching minutes:', minutesError)
        }
        setMinutes({
          available: minutesData?.available_minutes || 0,
          total: minutesData?.total_minutes || 0
        })

        // Set subscription data
        if (subscriptionData) {
          console.log('Raw subscription data:', subscriptionData);
          
          // Check subscription status
          const isSubscriptionCanceled = 
            subscriptionData.subscription_status === 'canceled' || 
            subscriptionData.subscription_status === 'cancelled' || 
            (subscriptionData.cancel_at_period_end === true);
            
          // Check if subscription is active (not canceled and not expired)
          const isActive = 
            subscriptionData.subscription_status === 'active' && 
            !subscriptionData.cancel_at_period_end &&
            new Date(subscriptionData.current_period_end) > new Date();
            
          console.log('Is subscription canceled:', isSubscriptionCanceled);
          console.log('Is subscription active:', isActive);
          
          setSubscriptionData({
            status: isActive ? 'active' : 'canceled',
            currentPlan: subscriptionData.subscription_tier,
            currentPeriodEnd: subscriptionData.current_period_end,
            currentMinutesPerMonth: subscriptionData.current_minutes_per_month || 0,
            currentCreditsPerMonth: subscriptionData.current_credits_per_month || 0,
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            // Only set next plan info if there's a planned change AND subscription is active
            ...((isActive && subscriptionData.next_minutes_per_month) ? {
              nextMinutesPerMonth: subscriptionData.next_minutes_per_month,
              nextCreditsPerMonth: subscriptionData.next_credits_per_month,
              nextPlan: subscriptionData.next_minutes_per_month ? 
                (subscriptionData.next_minutes_per_month === 10 ? 'Basic' :
                 subscriptionData.next_minutes_per_month === 30 ? 'Pro' :
                 subscriptionData.next_minutes_per_month === 60 ? 'Business' : undefined) : 
                undefined
            } : {})
          })
        }

        setLoading(false)
      } catch (error) {
        console.error('Error in loadDashboardData:', error)
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, supabase])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      // Get profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      // Create profile if it doesn't exist
      if (error?.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }
      } else if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const handleAvatarUpdate = (url: string) => {
    setAvatarUrl(url);
  };

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Fetch subscription status
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select(`
            id,
            user_id,
            subscription_status,
            subscription_tier,
            current_period_end,
            current_minutes_per_month,
            current_credits_per_month,
            next_minutes_per_month,
            next_credits_per_month,
            stripe_subscription_id,
            cancel_at_period_end,
            created_at,
            updated_at
          `)
          .eq('user_id', user.id)
          .single()

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subscriptionError)
        }

        // Fetch actual credits and minutes regardless of subscription status
        // Get actual available credits
        const { data: creditsData, error: creditsError } = await supabase
          .from('user_credits')
          .select('available_credits')
          .eq('user_id', user.id)
          .single()

        if (creditsError && creditsError.code !== 'PGRST116') {
          console.error('Error fetching credits:', creditsError)
        }
        setCredits(creditsData?.available_credits || 0)

        // Get actual available minutes
        const { data: minutesData, error: minutesError } = await supabase
          .from('user_meditation_minutes')
          .select('available_minutes, total_minutes')
          .eq('user_id', user.id)
          .single()

        if (minutesError && minutesError.code !== 'PGRST116') {
          console.error('Error fetching minutes:', minutesError)
        }
        setMinutes({
          available: minutesData?.available_minutes || 0,
          total: minutesData?.total_minutes || 0
        })

        // Set subscription data
        if (subscriptionData) {
          console.log('Raw subscription data:', subscriptionData);
          
          // Check subscription status
          const isSubscriptionCanceled = 
            subscriptionData.subscription_status === 'canceled' || 
            subscriptionData.subscription_status === 'cancelled' || 
            (subscriptionData.cancel_at_period_end === true);
            
          // Check if subscription is active (not canceled and not expired)
          const isActive = 
            subscriptionData.subscription_status === 'active' && 
            !subscriptionData.cancel_at_period_end &&
            new Date(subscriptionData.current_period_end) > new Date();
            
          console.log('Is subscription canceled:', isSubscriptionCanceled);
          console.log('Is subscription active:', isActive);
          
          setSubscriptionData({
            status: isActive ? 'active' : 'canceled',
            currentPlan: subscriptionData.subscription_tier,
            currentPeriodEnd: subscriptionData.current_period_end,
            currentMinutesPerMonth: subscriptionData.current_minutes_per_month || 0,
            currentCreditsPerMonth: subscriptionData.current_credits_per_month || 0,
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            // Only set next plan info if there's a planned change AND subscription is active
            ...((isActive && subscriptionData.next_minutes_per_month) ? {
              nextMinutesPerMonth: subscriptionData.next_minutes_per_month,
              nextCreditsPerMonth: subscriptionData.next_credits_per_month,
              nextPlan: subscriptionData.next_minutes_per_month ? 
                (subscriptionData.next_minutes_per_month === 10 ? 'Basic' :
                 subscriptionData.next_minutes_per_month === 30 ? 'Pro' :
                 subscriptionData.next_minutes_per_month === 60 ? 'Business' : undefined) : 
                undefined
            } : {})
          })
        }

        setLoading(false)
      } catch (error) {
        console.error('Error in loadDashboardData:', error)
        setLoading(false)
      }
    }

    loadDashboardData()

    // Set up realtime subscription for updates
    const subscriptionChannel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Subscription changed:', payload)
          loadDashboardData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_meditation_minutes',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Minutes changed:', payload)
          loadDashboardData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Credits changed:', payload)
          loadDashboardData()
        }
      )
      .subscribe()

    return () => {
      subscriptionChannel.unsubscribe()
    }
  }, [user, supabase])

  // Add subscription CTA if user is not subscribed
  const renderSubscriptionCTA = () => {
    // Only show CTA if user has no subscription at all
    if (!subscriptionData?.currentPlan) {
      return (
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="w-full p-6 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/20 text-center mb-8"
        >
          <h3 className="text-xl text-amber-200 mb-3">Upgrade Your Meditation Journey</h3>
          <p className="text-amber-100/70 mb-4">Get unlimited access to all premium features and personalized meditation sessions.</p>
          <Button
            onClick={() => router.push('/pricing')}
            className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black px-8 py-4 rounded-lg font-medium"
          >
            View Pricing Plans
          </Button>
        </motion.div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </BaseLayout>
    )
  }

  const availableMinutes = minutes.available;
  const availableCredits = credits;
  const minutesUsed = minutes.total;  // total_minutes directly represents minutes used
  const minutesPercentage = Math.min(100, (minutes.available / (subscriptionData?.currentMinutesPerMonth || 1)) * 100);

  return (
    <BaseLayout hideVideo={true}>
      <div className="min-h-screen relative">
        <div className="relative container max-w-4xl mx-auto px-4 py-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Top Buttons */}
            <div className="flex justify-end items-center">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleManageSubscription}
                  disabled={isManagingSubscription}
                  variant="outline"
                  className="bg-black/40 border border-amber-500/20 text-amber-400 hover:bg-amber-400/10 transition-colors flex items-center gap-2"
                >
                  {isManagingSubscription ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      <span>Manage Subscription</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="bg-black/40 border border-amber-500/20 text-amber-400 hover:bg-amber-400/10 transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>

            {renderSubscriptionCTA()}

            <div className="flex flex-col space-y-6">
              {/* Profile Section */}
              <div className="w-full backdrop-blur-xl rounded-xl border border-amber-500/20 p-6 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <AvatarUpload 
                      initialAvatarUrl={avatarUrl} 
                      onAvatarUpdate={handleAvatarUpdate}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-lg text-amber-400 truncate">{user?.email}</span>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {subscriptionData?.currentPlan || 'Free'}
                      </Badge>
                      {cancelAtPeriodEnd && (
                        <Badge variant="destructive">Cancels at period end</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Minutes and Credits Cards */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="backdrop-blur-md bg-black/40 border border-amber-500/20 rounded-lg p-6 flex flex-col h-[200px]">
                  <div className="flex items-center gap-2 text-amber-400 mb-8">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg">Monthly Minutes</span>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-grow">
                    <div className="flex justify-between w-full mb-2">
                      <div>
                        <div className="text-3xl font-light text-amber-400">{availableMinutes}m</div>
                        <div className="text-sm text-amber-200">Available</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-light text-amber-400">{minutesUsed}m</div>
                        <div className="text-sm text-amber-200">Total Used</div>
                      </div>
                    </div>
                    <div className="w-full bg-amber-900/20 rounded-full h-2 mb-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full"
                        style={{
                          width: `${minutesPercentage}%`,
                        }}
                      />
                    </div>
                    <div className="text-sm text-amber-200">{minutesPercentage}% remaining</div>
                  </div>
                </div>

                <div className="backdrop-blur-md bg-black/40 border border-amber-500/20 rounded-lg p-6 flex flex-col h-[200px]">
                  <div className="flex items-center gap-2 text-amber-400 mb-4">
                    <Coins className="h-5 w-5" />
                    <span className="text-lg">Meditation Credits</span>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="text-4xl font-light text-amber-400 mb-2">{availableCredits}</div>
                    <div className="text-sm text-amber-200 text-center">Credits available for meditation</div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="border-amber-500/20 text-amber-400 hover:bg-amber-400/10"
                        onClick={() => router.push('/credits')}
                      >
                        Get More Credits
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Details Card */}
              <div className="w-full backdrop-blur-xl rounded-xl border border-amber-500/20 p-8 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-medium text-amber-400">Subscription Details</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Current Plan Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-amber-200">Status</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant="outline" 
                          className={
                            subscriptionData?.status === 'active'
                              ? 'bg-green-500/20 text-green-400 border-green-500/20'
                              : 'bg-red-500/20 text-red-400 border-red-500/20'
                          }
                        >
                          {subscriptionData?.status === 'active' ? 'Active' : 'Canceled'}
                        </Badge>
                        {subscriptionData?.cancelAtPeriodEnd && (
                          <div className="mt-2 text-sm text-amber-200">
                            Your subscription will end on {formatDate(subscriptionData.currentPeriodEnd)}
                          </div>
                        )}
                        {subscriptionData?.status === 'active' && (
                          <div className="mt-2 text-sm text-green-400">
                            Your subscription is active and will renew on {formatDate(subscriptionData.currentPeriodEnd)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-amber-200">Current Plan</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 capitalize">
                          {subscriptionData?.currentPlan || 'Free'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-amber-200">Current Period Ends</div>
                      <div className="text-amber-400">{formatDate(subscriptionData?.currentPeriodEnd || '')}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-amber-200">Current Plan Includes</div>
                      <ul className="text-amber-400 space-y-1 list-none">
                        <li>{subscriptionData?.currentMinutesPerMonth} minutes per month</li>
                        <li>{subscriptionData?.currentCreditsPerMonth} credits per month</li>
                      </ul>
                    </div>
                  </div>

                  {/* Next Period Details - Only show if there's a next plan and subscription is not canceled */}
                  {subscriptionData?.nextPlan && subscriptionData?.status !== 'canceled' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-sm text-amber-200">Next Plan</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/20 capitalize">
                            {subscriptionData.nextPlan}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-amber-200">Next Plan Includes</div>
                        <ul className="text-amber-400 space-y-1 list-none">
                          <li>{subscriptionData.nextMinutesPerMonth} minutes per month</li>
                          <li>{subscriptionData.nextCreditsPerMonth} credits per month</li>
                        </ul>
                      </div>

                      <div className="mt-4 p-4 bg-amber-400/10 rounded-lg border border-amber-400/20">
                        <p className="text-amber-200">
                          Your plan will change to {subscriptionData.nextPlan} at the end of your current period.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Meditation Generator Card */}
              <div className="w-full backdrop-blur-xl rounded-xl border border-amber-500/20 p-8 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span role="img" aria-label="meditation" className="text-2xl">🧘</span>
                    <h3 className="text-xl font-medium text-amber-400">Meditation Generator</h3>
                  </div>
                  <Badge variant="outline" className="text-amber-400">Ready</Badge>
                </div>
                <p className="text-amber-200 mb-4 text-center">Generate personalized meditations using AI</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-amber-200">Cost per meditation:</span>
                  <span className="text-amber-400 font-medium">10 credits</span>
                </div>
                <Button 
                  className="w-full bg-amber-400 text-black hover:bg-amber-500"
                  onClick={() => router.push('/meditation-generator')}
                  disabled={credits < 10}
                >
                  {credits < 10 ? `Need ${10 - credits} more credits` : 'Generate Meditation'}
                </Button>
              </div>

              {/* Meditation History */}
              <div className="w-full">
                <h2 className="text-2xl font-semibold text-amber-400 mb-6">Your Meditation History</h2>
                <MeditationHistory />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </BaseLayout>
  )
}
