import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get customer data
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()
    
    if (customerError || !customerData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Customer not found. Please subscribe to a plan first.' },
        { status: 404 }
      )
    }

    // Get all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerData.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method']
    });

    // If there are multiple active subscriptions, cancel all but the most recent
    if (subscriptions.data.length > 1) {
      console.log(`Found ${subscriptions.data.length} active subscriptions. Cleaning up duplicates...`);
      
      // Sort subscriptions by creation date, newest first
      const sortedSubs = subscriptions.data.sort((a, b) => b.created - a.created);
      
      // Keep the first (most recent) subscription and cancel others
      for (let i = 1; i < sortedSubs.length; i++) {
        await stripe.subscriptions.cancel(sortedSubs[i].id, {
          prorate: true
        });
        console.log(`Cancelled duplicate subscription: ${sortedSubs[i].id}`);
      }
    }

    // Create Stripe portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error managing subscriptions:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to manage subscriptions' },
      { status: 500 }
    )
  }
}
