import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's credits, subscription, and meditation minutes
    const [creditsResponse, subscriptionResponse, meditationResponse] = await Promise.all([
      supabase
        .from('user_credits')
        .select('available_credits, total_credits')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('user_subscriptions')
        .select('subscription_status, subscription_tier, current_minutes_per_month, current_credits_per_month, next_minutes_per_month, next_credits_per_month')
        .eq('user_id', user.id)
        .eq('subscription_status', 'active')
        .single(),
      supabase
        .from('user_meditation_minutes')
        .select('available_minutes, total_minutes')
        .eq('user_id', user.id)
        .single()
    ])

    // Handle credits response
    if (creditsResponse.error && creditsResponse.error.code !== 'PGRST116') {
      throw creditsResponse.error
    }

    // Handle subscription response
    if (subscriptionResponse.error && subscriptionResponse.error.code !== 'PGRST116') {
      throw subscriptionResponse.error
    }

    // Handle meditation minutes response
    if (meditationResponse.error && meditationResponse.error.code !== 'PGRST116') {
      throw meditationResponse.error
    }

    return NextResponse.json({
      available_credits: creditsResponse.data?.available_credits || 0,
      total_credits: creditsResponse.data?.total_credits || 0,
      subscription: {
        status: subscriptionResponse.data?.subscription_status,
        tier: subscriptionResponse.data?.subscription_tier,
        credits: {
          current: subscriptionResponse.data?.current_credits_per_month || 0,
          next: subscriptionResponse.data?.next_credits_per_month || 0
        },
        minutes: {
          current: subscriptionResponse.data?.current_minutes_per_month || 0,
          next: subscriptionResponse.data?.next_minutes_per_month || 0
        }
      },
      meditation_minutes: {
        available: meditationResponse.data?.available_minutes || 0,
        total: meditationResponse.data?.total_minutes || 0
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error fetching credits' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { amount, type = 'add' } = await req.json()

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current credits
    const { data: currentCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('available_credits, total_credits')
      .eq('user_id', user.id)
      .single()

    if (creditsError && creditsError.code !== 'PGRST116') {
      throw creditsError
    }

    const currentAvailable = currentCredits?.available_credits || 0
    const currentTotal = currentCredits?.total_credits || 0

    // Calculate new amounts based on operation type
    let newAvailable = currentAvailable
    let newTotal = currentTotal

    if (type === 'add') {
      newAvailable = currentAvailable + amount
      newTotal = currentTotal + amount
    } else if (type === 'subtract') {
      if (currentAvailable < amount) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 400 }
        )
      }
      newAvailable = currentAvailable - amount
    }

    // Update or insert credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        available_credits: newAvailable,
        total_credits: newTotal,
        updated_at: new Date().toISOString(),
      })

    if (updateError) throw updateError

    return NextResponse.json({
      available_credits: newAvailable,
      total_credits: newTotal
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error updating credits' },
      { status: 500 }
    )
  }
}
