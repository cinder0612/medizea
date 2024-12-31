-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS customer_subscriptions CASCADE;

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
    subscription_id text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_status text,
    subscription_tier text,
    trial_end timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end bool,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Create customer_subscriptions table
CREATE TABLE customer_subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES customers(id),
    status text,
    price_id text,
    quantity int4,
    cancel_at_period_end bool,
    cancel_at timestamptz,
    canceled_at timestamptz,
    current_period_start timestamptz,
    current_period_end timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz DEFAULT timezone('utc'::text, now()),
    ended_at timestamptz,
    trial_start timestamptz,
    trial_end timestamptz,
    subscription_id text REFERENCES user_subscriptions(subscription_id)
);

-- Create RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for user_subscriptions
CREATE POLICY "Can view own user subscriptions" ON user_subscriptions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Policies for customer_subscriptions
CREATE POLICY "Can view own customer subscriptions" ON customer_subscriptions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Create function to check if a user has an active subscription
CREATE OR REPLACE FUNCTION public.is_subscription_active(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_subscriptions
        WHERE user_id = user_uuid
        AND subscription_status = 'active'
        AND (
            current_period_end > timezone('utc'::text, now())
            OR
            (trial_end IS NOT NULL AND trial_end > timezone('utc'::text, now()))
        )
    );
END;
$$;
