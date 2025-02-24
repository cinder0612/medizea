import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Check if STRIPE_SECRET_KEY is set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Check if NEXT_PUBLIC_SITE_URL is set
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Credit package price IDs
const CREDIT_PRICE_IDS = {
  starter: 'price_1QeLxDIfIBf9ivekXzPPzWdJ',   // 100 Credits
  basic: 'price_1QeLzJIfIBf9iveksuGECwBc',     // 300 Credits
  pro: 'price_1QeM0xIfIBf9ivekkIcojhow',       // 500 Credits
  advanced: 'price_1QeM3gIfIBf9ivekcnA1qkSx',  // 1000 Credits
  ultimate: 'price_1QeM5eIfIBf9ivekvb8ZvDAI'   // 5000 Credits
};

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    console.log('Received credit package request:', { priceId });

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Validate price ID
    if (!Object.values(CREDIT_PRICE_IDS).includes(priceId)) {
      console.error('Invalid credit package price ID:', priceId);
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      );
    }

    // Get user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/credits?canceled=true`,
        metadata: {
          userId: user.id,
          type: 'credit_purchase',
          priceId
        },
        payment_method_types: ['card'],
        currency: 'usd',
      });

      console.log('Credit package checkout session created:', { sessionId: session.id });
      return NextResponse.json({ url: session.url });
    } catch (stripeError) {
      console.error('Stripe API Error:', stripeError);
      return NextResponse.json(
        { error: 'Error creating checkout session' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
