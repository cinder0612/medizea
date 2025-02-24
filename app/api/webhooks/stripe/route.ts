import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const CREDITS_PER_MINUTE = 10;

const priceToPlanMap = {
  'price_1QeLn1IfIBf9ivekghK86k8N': 'basic',    // Basic Plan - 10 minutes
  'price_1QeLoMIfIBf9ivekW9TQeFyt': 'pro',      // Pro Plan - 30 minutes
  'price_1QeLpLIfIBf9ivekvP58R4d6': 'premium',  // Premium Plan - 60 minutes
}

const planToMinutesMap = {
  'basic': 10,     // 10 minutes = 100 credits
  'pro': 30,       // 30 minutes = 300 credits
  'premium': 60    // 60 minutes = 600 credits
}

const creditPackagesMap = {
  'price_1QeLxDIfIBf9ivekXzPPzWdJ': 105,    // Starter Pack: 100 + 5 bonus
  'price_1QeLzJIfIBf9iveksuGECwBc': 320,    // Basic Pack: 300 + 20 bonus
  'price_1QeM0xIfIBf9ivekkIcojhow': 550,    // Pro Pack: 500 + 50 bonus
  'price_1QeM3gIfIBf9ivekcnA1qkSx': 1150,   // Advanced Pack: 1000 + 150 bonus
  'price_1QeM5eIfIBf9ivekvb8ZvDAI': 6000,   // Ultimate Pack: 5000 + 1000 bonus
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'payment_intent.succeeded'  // For one-time credit purchases
]);

function getPlanFromPriceId(priceId: string) {
  return priceToPlanMap[priceId];
}

export async function POST(req: Request) {
  console.log('💰 Stripe webhook received at:', new Date().toISOString());
  
  const requestBody = await req.text();
  const headersList = await headers();
  const stripeSignature = headersList.get('stripe-signature');

  console.log('🔍 Webhook request details:', {
    bodyLength: requestBody.length,
    hasSignature: !!stripeSignature,
    contentType: headersList.get('content-type'),
    method: req.method
  });

  console.log('Webhook endpoint hit');
  console.log('Webhook headers:', {
    'stripe-signature': stripeSignature?.substring(0, 20) + '...',
    'content-type': headersList.get('content-type'),
  });

  if (!stripeSignature) {
    console.error('No stripe-signature in request');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let stripeEvent: Stripe.Event;

  try {
    console.log('Verifying webhook with secret:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 5) + '...');
    stripeEvent = stripe.webhooks.constructEvent(
      requestBody,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Webhook verified. Event:', stripeEvent.type);
    
    console.log('Raw webhook request:', {
      body: requestBody.substring(0, 100) + '...', // Log first 100 chars of body
      headers: Object.fromEntries(headersList.entries()),
      stripeSignature,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 5) + '...'
    });
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    }
    
    console.log('Webhook received:', {
      hasSignature: !!stripeSignature,
      signatureLength: stripeSignature?.length,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length,
      bodyLength: requestBody.length
    });
    console.log('Verifying webhook signature with secret length:', process.env.STRIPE_WEBHOOK_SECRET?.length);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Received webhook event:', {
    type: stripeEvent.type,
    id: stripeEvent.id,
    object: stripeEvent.data.object.object,
    created: new Date(stripeEvent.created * 1000).toISOString()
  });

  if (relevantEvents.has(stripeEvent.type)) {
    try {
      switch (stripeEvent.type) {
        case 'checkout.session.completed': {
          const checkoutSession = stripeEvent.data.object as Stripe.Checkout.Session;
          console.log('Processing checkout session:', {
            id: checkoutSession.id,
            customer: checkoutSession.customer,
            userId: checkoutSession.metadata?.userId,
            subscription: checkoutSession.subscription,
            priceId: checkoutSession.metadata?.priceId
          });

          // Handle one-time credit purchases
          if (!checkoutSession.subscription && checkoutSession.metadata?.type === 'credit_purchase') {
            const priceId = checkoutSession.metadata.priceId;
            const purchasedCredits = creditPackagesMap[priceId] || 0;
            
            if (purchasedCredits > 0) {
              console.log('Processing credit purchase:', {
                userId: checkoutSession.metadata.userId,
                priceId,
                purchasedCredits
              });

              // Get current credits and minutes
              const { data: currentCredits, error: fetchError } = await supabaseAdmin
                .from('user_credits')
                .select('available_credits, total_credits')
                .eq('user_id', checkoutSession.metadata.userId)
                .single();

              if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching current credits:', fetchError);
                throw fetchError;
              }

              // Calculate new credit values
              const newAvailableCredits = (currentCredits?.available_credits || 0) + purchasedCredits;
              const newTotalCredits = (currentCredits?.total_credits || 0) + purchasedCredits;

              // Calculate meditation minutes (10 credits = 1 minute)
              const purchasedMinutes = Math.floor(purchasedCredits / CREDITS_PER_MINUTE);

              // Get current meditation minutes
              const { data: currentMinutes, error: minutesFetchError } = await supabaseAdmin
                .from('user_meditation_minutes')
                .select('available_minutes, total_minutes')
                .eq('user_id', checkoutSession.metadata.userId)
                .single();

              if (minutesFetchError && minutesFetchError.code !== 'PGRST116') {
                console.error('Error fetching current minutes:', minutesFetchError);
                throw minutesFetchError;
              }

              // Calculate new minute values
              const newAvailableMinutes = (currentMinutes?.available_minutes || 0) + purchasedMinutes;
              // total_minutes stays the same - it only increases when minutes are used (credits spent)
              const totalMinutesUsed = currentMinutes?.total_minutes || 0;

              console.log('Processing minutes update:', {
                currentAvailable: currentMinutes?.available_minutes || 0,
                minutesUsed: totalMinutesUsed,
                purchasedMinutes,
                newAvailableMinutes
              });

              // Update credits
              const { error: creditsError } = await supabaseAdmin
                .from('user_credits')
                .upsert({
                  user_id: checkoutSession.metadata.userId,
                  available_credits: newAvailableCredits,
                  total_credits: newTotalCredits,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (creditsError) {
                console.error('Error updating credits:', creditsError);
                throw creditsError;
              }

              // Update minutes
              const { error: minutesError } = await supabaseAdmin
                .from('user_meditation_minutes')
                .upsert({
                  user_id: checkoutSession.metadata.userId,
                  available_minutes: newAvailableMinutes,
                  total_minutes: totalMinutesUsed,  // This tracks how many minutes have been used
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (minutesError) {
                console.error('Error updating minutes:', minutesError);
                throw minutesError;
              }

              console.log('Successfully processed credit purchase:', {
                userId: checkoutSession.metadata.userId,
                newAvailableCredits,
                newTotalCredits,
                newAvailableMinutes,
                totalMinutesUsed
              });
            }
          }

          // Handle subscriptions
          else if (checkoutSession.subscription || checkoutSession.metadata?.type === 'subscription') {
            console.log('Processing subscription checkout:', {
              sessionId: checkoutSession.id,
              subscription: checkoutSession.subscription,
              type: checkoutSession.metadata?.type
            });

            const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
            
            if (!subscription) {
              throw new Error('No subscription found');
            }

            // Get or create customer record
            const { data: customer, error: customerError } = await supabaseAdmin
              .from('customers')
              .upsert({
                user_id: checkoutSession.metadata.userId,
                stripe_customer_id: checkoutSession.customer as string,
                email: checkoutSession.customer_details?.email || '',
              }, {
                onConflict: 'user_id',
                update_columns: ['stripe_customer_id', 'email']
              })
              .select()
              .single();

            if (customerError || !customer) {
              throw customerError || new Error('Failed to create customer record');
            }

            // Get current subscription to determine if this is an upgrade/downgrade
            const { data: currentSub } = await supabaseAdmin
              .from('user_subscriptions')
              .select('subscription_tier, current_minutes_per_month, current_credits_per_month')
              .eq('user_id', checkoutSession.metadata.userId)
              .eq('subscription_status', 'active')
              .single();

            const isNewSubscription = !currentSub;
            const plan = priceToPlanMap[subscription.items.data[0].price.id];
            const minutes = planToMinutesMap[plan];

            // For upgrades/downgrades: keep current values, set new values for next period
            // For new subscriptions: set both current and next values to the new plan
            const { error: userSubError } = await supabaseAdmin
              .from('user_subscriptions')
              .insert({
                user_id: checkoutSession.metadata.userId,
                subscription_status: 'active',
                subscription_tier: isNewSubscription ? plan : currentSub.subscription_tier,
                stripe_subscription_id: subscription.id,
                current_minutes_per_month: isNewSubscription ? minutes : currentSub.current_minutes_per_month,
                current_credits_per_month: isNewSubscription ? (minutes * CREDITS_PER_MINUTE) : currentSub.current_credits_per_month,
                next_minutes_per_month: minutes,
                next_credits_per_month: minutes * CREDITS_PER_MINUTE,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end
              });

            if (userSubError) {
              console.error('Error inserting user subscription:', userSubError);
              throw userSubError;
            }

            // Update customer_subscriptions - this should always reflect the new plan
            const { error: customerSubError } = await supabaseAdmin
              .from('customer_subscriptions')
              .insert({
                customer_id: customer.id,
                subscription_id: subscription.id,
                price_id: subscription.items.data[0].price.id,
                status: 'active',
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                plan_type: plan
              });

            if (customerSubError) {
              console.error('Error inserting customer subscription:', customerSubError);
              throw customerSubError;
            }

            // Deactivate old subscriptions after creating the new one
            if (!isNewSubscription) {
              // Record subscription change in history
              const { error: historyError } = await supabaseAdmin
                .from('subscription_history')
                .insert({
                  user_id: checkoutSession.metadata.userId,
                  subscription_id: subscription.id,
                  previous_status: 'active',
                  new_status: 'inactive',
                  metadata: { reason: 'upgrade_or_change' },
                  changed_at: new Date().toISOString()
                });

              if (historyError) {
                console.error('Error recording subscription history:', historyError);
                throw historyError;
              }

              const { error: deactivateError } = await supabaseAdmin
                .from('user_subscriptions')
                .update({ subscription_status: 'inactive' })
                .eq('user_id', checkoutSession.metadata.userId)
                .eq('subscription_status', 'active')
                .neq('stripe_subscription_id', subscription.id);

              if (deactivateError) {
                console.error('Error deactivating old subscriptions:', deactivateError);
                throw deactivateError;
              }

              const { error: deactivateCustomerSubError } = await supabaseAdmin
                .from('customer_subscriptions')
                .update({ status: 'inactive' })
                .eq('customer_id', customer.id)
                .eq('status', 'active')
                .neq('subscription_id', subscription.id);

              if (deactivateCustomerSubError) {
                console.error('Error deactivating old customer subscriptions:', deactivateCustomerSubError);
                throw deactivateCustomerSubError;
              }
            }

            // Initialize or update user_meditation_minutes
            const { error: minutesError } = await supabaseAdmin
              .from('user_meditation_minutes')
              .upsert({
                user_id: checkoutSession.metadata.userId,
                available_minutes: minutes,
                total_minutes: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
              });

            if (minutesError) {
              console.error('Error upserting meditation minutes:', minutesError);
              throw minutesError;
            }

            // Initialize or update user_credits
            const { error: creditsError } = await supabaseAdmin
              .from('user_credits')
              .upsert({
                user_id: checkoutSession.metadata.userId,
                available_credits: minutes * CREDITS_PER_MINUTE,
                total_credits: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
              });

            if (creditsError) {
              console.error('Error upserting credits:', creditsError);
              throw creditsError;
            }

            break;
          }

          // Continue with subscription handling if not a credit purchase
          if (!checkoutSession.subscription) {
            throw new Error('No subscription in session');
          }

          if (!checkoutSession.metadata?.userId) {
            throw new Error('No userId in session metadata');
          }

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
            
          if (!subscription) {
            throw new Error('No subscription found');
          }

          // Get or create customer record
          const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .upsert({
              user_id: checkoutSession.metadata.userId,
              stripe_customer_id: checkoutSession.customer as string,
              email: checkoutSession.customer_details?.email || '',
            }, {
              onConflict: 'user_id',
              update_columns: ['stripe_customer_id', 'email']
            })
            .select()
            .single();

          if (customerError || !customer) {
            throw customerError || new Error('Failed to create customer record');
          }

          // Get current subscription to determine if this is an upgrade/downgrade
          const { data: currentSub } = await supabaseAdmin
            .from('user_subscriptions')
            .select('subscription_tier, current_minutes_per_month, current_credits_per_month')
            .eq('user_id', checkoutSession.metadata.userId)
            .eq('subscription_status', 'active')
            .single();

          const isNewSubscription = !currentSub;
          const plan = priceToPlanMap[subscription.items.data[0].price.id];
          const minutes = planToMinutesMap[plan];

          // For upgrades/downgrades: keep current values, set new values for next period
          // For new subscriptions: set both current and next values to the new plan
          const { error: userSubError } = await supabaseAdmin
            .from('user_subscriptions')
            .insert({
              user_id: checkoutSession.metadata.userId,
              subscription_status: 'active',
              subscription_tier: isNewSubscription ? plan : currentSub.subscription_tier,
              stripe_subscription_id: subscription.id,
              current_minutes_per_month: isNewSubscription ? minutes : currentSub.current_minutes_per_month,
              current_credits_per_month: isNewSubscription ? (minutes * CREDITS_PER_MINUTE) : currentSub.current_credits_per_month,
              next_minutes_per_month: minutes,
              next_credits_per_month: minutes * CREDITS_PER_MINUTE,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end
            });

          if (userSubError) {
            console.error('Error inserting user subscription:', userSubError);
            throw userSubError;
          }

          // Update customer_subscriptions - this should always reflect the new plan
          const { error: customerSubError } = await supabaseAdmin
            .from('customer_subscriptions')
            .insert({
              customer_id: customer.id,
              subscription_id: subscription.id,
              price_id: subscription.items.data[0].price.id,
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              plan_type: plan
            });

          if (customerSubError) {
            console.error('Error inserting customer subscription:', customerSubError);
            throw customerSubError;
          }

          // Deactivate old subscriptions after creating the new one
          if (!isNewSubscription) {
            // Record subscription change in history
            const { error: historyError } = await supabaseAdmin
              .from('subscription_history')
              .insert({
                user_id: checkoutSession.metadata.userId,
                subscription_id: subscription.id,
                previous_status: 'active',
                new_status: 'inactive',
                metadata: { reason: 'upgrade_or_change' },
                changed_at: new Date().toISOString()
              });

            if (historyError) {
              console.error('Error recording subscription history:', historyError);
              throw historyError;
            }

            const { error: deactivateError } = await supabaseAdmin
              .from('user_subscriptions')
              .update({ subscription_status: 'inactive' })
              .eq('user_id', checkoutSession.metadata.userId)
              .eq('subscription_status', 'active')
              .neq('stripe_subscription_id', subscription.id);

            if (deactivateError) {
              console.error('Error deactivating old subscriptions:', deactivateError);
              throw deactivateError;
            }

            const { error: deactivateCustomerSubError } = await supabaseAdmin
              .from('customer_subscriptions')
              .update({ status: 'inactive' })
              .eq('customer_id', customer.id)
              .eq('status', 'active')
              .neq('subscription_id', subscription.id);

            if (deactivateCustomerSubError) {
              console.error('Error deactivating old customer subscriptions:', deactivateCustomerSubError);
              throw deactivateCustomerSubError;
            }
          }

          // Initialize or update user_meditation_minutes
          const { error: minutesError } = await supabaseAdmin
            .from('user_meditation_minutes')
            .upsert({
              user_id: checkoutSession.metadata.userId,
              available_minutes: minutes,
              total_minutes: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });

          if (minutesError) {
            console.error('Error upserting meditation minutes:', minutesError);
            throw minutesError;
          }

          // Initialize or update user_credits
          const { error: creditsError } = await supabaseAdmin
            .from('user_credits')
            .upsert({
              user_id: checkoutSession.metadata.userId,
              available_credits: minutes * CREDITS_PER_MINUTE,
              total_credits: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });

          if (creditsError) {
            console.error('Error upserting credits:', creditsError);
            throw creditsError;
          }

          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = stripeEvent.data.object as Stripe.Subscription;
          const priceId = subscription.items.data[0].price.id;
          const newTier = getPlanFromPriceId(priceId);
          const userId = subscription.metadata.userId;
          
          // First, check if subscription exists
          const { data: existingSub } = await supabaseAdmin
            .from('user_subscriptions')
            .select('subscription_tier, current_minutes_per_month, current_credits_per_month')
            .eq('user_id', userId)
            .single();

          if (existingSub) {
            // This is an upgrade/downgrade - keep current limits until next period
            const newLimits = {
              basic: 10,
              pro: 30,
              premium: 60
            }[newTier] || 0;

            // Keep current limits for this period, set new limits for next period
            await supabaseAdmin
              .from('user_subscriptions')
              .update({
                subscription_status: 'active',
                subscription_tier: existingSub.subscription_tier, // Keep current tier
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                stripe_subscription_id: subscription.id,
                current_minutes_per_month: existingSub.current_minutes_per_month, // Keep current limits
                current_credits_per_month: existingSub.current_credits_per_month, // Keep current limits
                next_minutes_per_month: newLimits, // Set new limits for next period
                next_credits_per_month: newLimits * CREDITS_PER_MINUTE // Set new limits for next period
              })
              .eq('user_id', userId);

            // Keep current meditation minutes and credits
            await supabaseAdmin
              .from('user_meditation_minutes')
              .upsert({
                user_id: userId,
                available_minutes: existingSub.current_minutes_per_month,
                total_minutes: 0
              });

            await supabaseAdmin
              .from('user_credits')
              .upsert({
                user_id: userId,
                available_credits: existingSub.current_credits_per_month,
                total_credits: 0
              });

            console.log('Updated subscription for upgrade/downgrade:', {
              userId,
              currentTier: existingSub.subscription_tier,
              nextTier: newTier,
              currentMinutes: existingSub.current_minutes_per_month,
              nextMinutes: newLimits,
              currentCredits: existingSub.current_credits_per_month,
              nextCredits: newLimits * CREDITS_PER_MINUTE
            });
          } else {
            // Create new subscription with initial limits
            const initialLimits = {
              basic: 10,
              pro: 30,
              premium: 60
            }[newTier] || 0;

            await supabaseAdmin
              .from('user_subscriptions')
              .insert({
                user_id: userId,
                subscription_status: 'active', // Always set to active for new subscription
                subscription_tier: newTier,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                stripe_subscription_id: subscription.id,
                current_minutes_per_month: initialLimits,
                current_credits_per_month: initialLimits * CREDITS_PER_MINUTE, 
                next_minutes_per_month: initialLimits,
                next_credits_per_month: initialLimits * CREDITS_PER_MINUTE
              });

            // Initialize meditation minutes and credits
            await supabaseAdmin
              .from('user_meditation_minutes')
              .upsert({
                user_id: userId,
                available_minutes: initialLimits,
                total_minutes: 0
              });

            await supabaseAdmin
              .from('user_credits')
              .upsert({
                user_id: userId,
                available_credits: initialLimits * CREDITS_PER_MINUTE,
                total_credits: 0
              });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const updatedSubscription = stripeEvent.data.object as Stripe.Subscription;
          console.log('Processing subscription event:', {
            id: updatedSubscription.id,
            status: updatedSubscription.status,
            metadata: updatedSubscription.metadata
          });

          if (!updatedSubscription.metadata?.userId) {
            throw new Error('No userId in subscription metadata');
          }

          const updatedPlan = priceToPlanMap[updatedSubscription.items.data[0].price.id];
          const updatedMinutes = planToMinutesMap[updatedPlan];
          
          // Get the customer from Stripe
          const stripeCustomer = await stripe.customers.retrieve(updatedSubscription.customer as string);
          
          // First create or update the customer record
          const { data: customer, error: customerUpsertError } = await supabaseAdmin
            .from('customers')
            .upsert(
              {
                user_id: updatedSubscription.metadata.userId,
                stripe_customer_id: updatedSubscription.customer as string,
                email: stripeCustomer.email || '',
              },
              {
                onConflict: 'user_id',
                update_columns: ['stripe_customer_id', 'email'],
                returning: true
              }
            )
            .select()
            .single();

          if (customerUpsertError || !customer) {
            console.error('Error upserting customer:', customerUpsertError);
            throw customerUpsertError || new Error('Failed to create customer record');
          }

          // Get customer record
          const { data: customerRecord, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('id, stripe_customer_id')
            .eq('user_id', updatedSubscription.metadata.userId)
            .single();

          if (customerError || !customerRecord) {
            console.error('Error getting customer:', customerError);
            throw customerError || new Error('Customer not found');
          }

          // Update user_subscriptions
          const { error: updateUserSubError } = await supabaseAdmin
            .from('user_subscriptions')
            .upsert(
              {
                user_id: updatedSubscription.metadata.userId,
                subscription_status: 'inactive', // Always set to inactive for deleted subscription
                subscription_tier: updatedPlan,
                minutes_per_month: updatedMinutes,
                credits_per_month: updatedMinutes * CREDITS_PER_MINUTE,
                current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: updatedSubscription.cancel_at_period_end,
              },
              {
                onConflict: 'user_id',
                update_columns: [
                  'subscription_status', 
                  'subscription_tier', 
                  'minutes_per_month', 
                  'credits_per_month', 
                  'current_period_start', 
                  'current_period_end',
                  'cancel_at_period_end'
                ]
              }
            );

          if (updateUserSubError) {
            console.error('Error updating user subscription:', updateUserSubError);
            throw updateUserSubError;
          }

          // Update customer_subscriptions
          const { error: updateCustomerSubError } = await supabaseAdmin
            .from('customer_subscriptions')
            .upsert(
              {
                customer_id: customerRecord.id,
                subscription_id: updatedSubscription.id,
                price_id: updatedSubscription.items.data[0].price.id,
                status: 'inactive', // Always set to inactive for deleted subscription
                current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: updatedSubscription.cancel_at_period_end,
              },
              {
                onConflict: 'subscription_id',
                update_columns: ['status', 'current_period_start', 'current_period_end', 'cancel_at_period_end']
              }
            );

          if (updateCustomerSubError) {
            console.error('Error updating customer subscription:', updateCustomerSubError);
            throw updateCustomerSubError;
          }

          // Update meditation minutes based on new plan
          const { error: updateMinutesError } = await supabaseAdmin
            .from('user_meditation_minutes')
            .upsert(
              {
                user_id: updatedSubscription.metadata.userId,
                available_minutes: updatedMinutes
              },
              {
                onConflict: 'user_id',
                update_columns: ['available_minutes']
              }
            );

          if (updateMinutesError) {
            console.error('Error updating meditation minutes:', updateMinutesError);
            throw updateMinutesError;
          }

          // Update credits based on new plan
          const { error: updateCreditsError } = await supabaseAdmin
            .from('user_credits')
            .upsert(
              {
                user_id: updatedSubscription.metadata.userId,
                available_credits: updatedMinutes * CREDITS_PER_MINUTE
              },
              {
                onConflict: 'user_id',
                update_columns: ['available_credits']
              }
            );

          if (updateCreditsError) {
            console.error('Error updating credits:', updateCreditsError);
            throw updateCreditsError;
          }

          break;
        }
        case 'customer.subscription.updated': {
          const subscription = stripeEvent.data.object as Stripe.Subscription;
          const priceId = subscription.items.data[0].price.id;
          const newTier = priceToPlanMap[priceId];
          
          // Update subscription - the trigger will handle setting next_minutes and next_credits
          await supabaseAdmin
            .from('user_subscriptions')
            .update({
              subscription_status: 'active', // Always set to active for updated subscription
              subscription_tier: newTier,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              stripe_subscription_id: subscription.id
            })
            .eq('user_id', subscription.metadata.userId);

          // Get the updated subscription with new limits
          const { data: updatedSub } = await supabaseAdmin
            .from('user_subscriptions')
            .select('current_minutes_per_month, current_credits_per_month')
            .eq('user_id', subscription.metadata.userId)
            .single();

          // Update available minutes/credits based on current limits
          if (updatedSub) {
            await supabaseAdmin
              .from('user_meditation_minutes')
              .upsert({
                user_id: subscription.metadata.userId,
                available_minutes: updatedSub.current_minutes_per_month
              });

            await supabaseAdmin
              .from('user_credits')
              .upsert({
                user_id: subscription.metadata.userId,
                available_credits: updatedSub.current_credits_per_month
              });
          }
          break;
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return NextResponse.json(
        { error: 'Webhook handler failed' },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
