-- Create customer_subscriptions table
CREATE TABLE IF NOT EXISTS customer_subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text CHECK (status IN ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid')),
    price_id text,
    quantity integer,
    cancel_at_period_end boolean,
    created timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    ended_at timestamp with time zone,
    cancel_at timestamp with time zone,
    canceled_at timestamp with time zone,
    trial_start timestamp with time zone,
    trial_end timestamp with time zone,
    stripe_subscription_id text UNIQUE
);

-- Create prices table
CREATE TABLE IF NOT EXISTS prices (
    id text PRIMARY KEY,
    product_id text,
    active boolean,
    description text,
    unit_amount bigint,
    currency text,
    type text CHECK (type IN ('one_time', 'recurring')),
    interval text CHECK (interval IN ('day', 'week', 'month', 'year')),
    interval_count integer,
    trial_period_days integer,
    metadata jsonb
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id text PRIMARY KEY,
    active boolean,
    name text,
    description text,
    image text,
    metadata jsonb
);

-- Create RLS policies
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for customer_subscriptions
CREATE POLICY "Can view own subs" ON customer_subscriptions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Policies for prices
CREATE POLICY "Prices are viewable by everyone" ON prices
    FOR SELECT TO anon, authenticated
    USING (true);

-- Policies for products
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT TO anon, authenticated
    USING (true);

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
        FROM customer_subscriptions
        WHERE user_id = user_uuid
        AND status = 'active'
        AND (
            current_period_end > timezone('utc'::text, now())
            OR
            trial_end > timezone('utc'::text, now())
        )
    );
END;
$$;
