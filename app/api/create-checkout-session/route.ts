import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { supabaseAdmin } from '@/lib/supabase-admin'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
})

// Valid price IDs for subscription plans
const VALID_PRICE_IDS = [
  'price_1QeLn1IfIBf9ivekghK86k8N',  // Basic plan
  'price_1QeLoMIfIBf9ivekW9TQeFyt',  // Pro plan
  'price_1QeLpLIfIBf9ivekvP58R4d6'   // Premium plan
]

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json()
    console.log('API: Received request with priceId:', priceId)

    if (!priceId) {
      console.error('API: No priceId provided')
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Validate price ID format
    if (!VALID_PRICE_IDS.includes(priceId)) {
      console.error('API: Invalid price ID format:', priceId)
      return NextResponse.json({ error: 'Invalid Price ID format' }, { status: 400 })
    }

    // Verify price exists in Stripe
    let price;
    try {
      console.log('API: Retrieving price from Stripe:', priceId)
      price = await stripe.prices.retrieve(priceId)
      console.log('API: Retrieved price:', price.id)
    } catch (error) {
      console.error('API: Error retrieving price from Stripe:', error)
      return NextResponse.json({ 
        error: 'Invalid Price ID or Stripe error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 })
    }

    // Get user session
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('API: Authentication error:', userError)
      return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 })
    }

    console.log('API: Authenticated user:', user.id)
    const userId = user.id
    const customerEmail = user.email

    if (!customerEmail) {
      console.error('API: No customer email found')
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Get or create customer
    let customerId: string
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id, stripe_customer_id')
      .eq('user_id', userId)
      .single()

    console.log('API: Customer lookup result:', { customerData, customerError })

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('API: Error fetching customer:', customerError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!customerData?.stripe_customer_id) {
      // Create new customer in Stripe
      console.log('API: Creating new Stripe customer')
      const stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          supabaseUUID: userId
        }
      })
      console.log('API: Created Stripe customer:', stripeCustomer.id)

      // Create customer record in database
      const { data: newCustomer, error: insertError } = await supabaseAdmin
        .from('customers')
        .insert([
          {
            user_id: userId,
            stripe_customer_id: stripeCustomer.id,
            email: customerEmail
          }
        ])
        .select('id, stripe_customer_id')
        .single()

      if (insertError) {
        console.error('API: Error creating customer record:', insertError)
        return NextResponse.json({ error: 'Failed to create customer record' }, { status: 500 })
      }

      console.log('API: Created customer record:', newCustomer)
      customerId = stripeCustomer.id
    } else {
      console.log('API: Using existing customer:', customerData.stripe_customer_id)
      customerId = customerData.stripe_customer_id
    }

    // Get current subscription if exists
    const { data: currentSub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('subscription_tier, current_period_end, minutes_per_month, credits_per_month')
      .eq('user_id', userId)
      .single();

    // Create Stripe checkout session
    console.log('API: Creating checkout session with:', {
      customerId,
      priceId,
      userId,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
    });

    // Check if this is a credit purchase
    const isCreditPurchase = [
      'price_1QeLxDIfIBf9ivekXzPPzWdJ',  // 105 credits
      'price_1QeLzJIfIBf9iveksuGECwBc',  // 320 credits
      'price_1QeM0xIfIBf9ivekkIcojhow',  // 550 credits
      'price_1QeM3gIfIBf9ivekcnA1qkSx',  // 1150 credits
      'price_1QeM5eIfIBf9ivekvb8ZvDAI'   // 6000 credits
    ].includes(priceId);

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isCreditPurchase ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
      metadata: {
        userId,
        priceId,
        type: isCreditPurchase ? 'credit_purchase' : 'subscription'
      },
      subscription_data: {
        metadata: {
          userId,
          currentMinutes: currentSub?.minutes_per_month || 0,
          currentCredits: currentSub?.credits_per_month || 0,
          currentPeriodEnd: currentSub?.current_period_end || '',
        },
      },
    })

    if (!session.url) {
      console.error('API: No URL in session response')
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    console.log('API: Created session:', session.id)
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('API: Checkout session error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
