import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const PRICE_TO_PLAN_MAP = {
  'price_1QSRCGIfIBf9ivekBp2fRf03': 'basic',
  'price_1QSRGeIfIBf9ivekryJ7zq49': 'premium',
  'price_1QSRGEIfIBf9iveko6Cj79JN': 'pro'
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('No stripe-signature in request');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('Processing checkout session:', {
            id: session.id,
            customer: session.customer,
            userId: session.metadata?.userId,
            subscription: session.subscription
          });

          if (!session.subscription) {
            throw new Error('No subscription in session');
          }

          if (!session.metadata?.userId) {
            throw new Error('No userId in session metadata');
          }

          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          console.log('Retrieved subscription:', {
            id: subscription.id,
            status: subscription.status,
            items: subscription.items.data
          });

          // Get customer record
          const { data: customerData, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('user_id', session.metadata.userId)
            .single();

          if (customerError) {
            console.error('Error fetching customer:', customerError);
            throw customerError;
          }

          // First, check for existing active subscriptions
          const { data: existingSubscriptions, error: fetchError } = await supabaseAdmin
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', session.metadata.userId)
            .eq('subscription_status', 'active');

          if (fetchError) {
            console.error('Error fetching existing subscriptions:', fetchError);
            throw fetchError;
          }

          // If there are existing active subscriptions, deactivate them
          if (existingSubscriptions && existingSubscriptions.length > 0) {
            const { error: deactivateError } = await supabaseAdmin
              .from('user_subscriptions')
              .update({ subscription_status: 'canceled', updated_at: new Date().toISOString() })
              .eq('user_id', session.metadata.userId)
              .eq('subscription_status', 'active');

            if (deactivateError) {
              console.error('Error deactivating existing subscriptions:', deactivateError);
              throw deactivateError;
            }
          }

          // Insert new subscription data into user_subscriptions
          const { error: userSubError } = await supabaseAdmin
            .from('user_subscriptions')
            .upsert({
              subscription_id: subscription.id,
              user_id: session.metadata.userId,
              subscription_status: subscription.status,
              subscription_tier: PRICE_TO_PLAN_MAP[subscription.items.data[0].price.id],
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (userSubError) {
            console.error('Error inserting user subscription:', userSubError);
            throw userSubError;
          }

          // Insert subscription data into customer_subscriptions
          const { error: customerSubError } = await supabaseAdmin
            .from('customer_subscriptions')
            .upsert({
              user_id: session.metadata.userId,
              customer_id: customerData.id,
              status: subscription.status,
              price_id: subscription.items.data[0].price.id,
              quantity: subscription.items.data[0].quantity,
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              subscription_id: subscription.id
            });

          if (customerSubError) {
            console.error('Error inserting customer subscription:', customerSubError);
            throw customerSubError;
          }

          break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const updatedSubscription = event.data.object as Stripe.Subscription;
          
          // Update user_subscriptions
          const { error: updateUserSubError } = await supabaseAdmin
            .from('user_subscriptions')
            .upsert({
              subscription_id: updatedSubscription.id,
              subscription_status: updatedSubscription.status,
              subscription_tier: PRICE_TO_PLAN_MAP[updatedSubscription.items.data[0].price.id],
              trial_end: updatedSubscription.trial_end ? new Date(updatedSubscription.trial_end * 1000).toISOString() : null,
              current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: updatedSubscription.cancel_at_period_end,
              updated_at: new Date().toISOString()
            });

          if (updateUserSubError) {
            console.error('Error updating user subscription:', updateUserSubError);
            throw updateUserSubError;
          }

          // Update customer_subscriptions
          const { error: updateCustomerSubError } = await supabaseAdmin
            .from('customer_subscriptions')
            .upsert({
              status: updatedSubscription.status,
              price_id: updatedSubscription.items.data[0].price.id,
              quantity: updatedSubscription.items.data[0].quantity,
              cancel_at_period_end: updatedSubscription.cancel_at_period_end,
              cancel_at: updatedSubscription.cancel_at ? new Date(updatedSubscription.cancel_at * 1000).toISOString() : null,
              canceled_at: updatedSubscription.canceled_at ? new Date(updatedSubscription.canceled_at * 1000).toISOString() : null,
              current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              ended_at: updatedSubscription.ended_at ? new Date(updatedSubscription.ended_at * 1000).toISOString() : null,
              trial_start: updatedSubscription.trial_start ? new Date(updatedSubscription.trial_start * 1000).toISOString() : null,
              trial_end: updatedSubscription.trial_end ? new Date(updatedSubscription.trial_end * 1000).toISOString() : null,
              subscription_id: updatedSubscription.id
            })
            .eq('subscription_id', updatedSubscription.id);

          if (updateCustomerSubError) {
            console.error('Error updating customer subscription:', updateCustomerSubError);
            throw updateCustomerSubError;
          }

          break;
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
