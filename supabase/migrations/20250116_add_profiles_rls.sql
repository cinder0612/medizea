-- Enable Row Level Security for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read any profile
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);

-- Allow service role full access to all tables
CREATE POLICY "Service role can manage all profiles"
ON profiles FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all user_subscriptions"
ON user_subscriptions FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all customer_subscriptions"
ON customer_subscriptions FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all customers"
ON customers FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all user_credits"
ON user_credits FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all user_meditation_minutes"
ON user_meditation_minutes FOR ALL
USING (auth.role() = 'service_role');

-- Enable RLS for remaining tables
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Policies for credit_transactions
CREATE POLICY "Users can view their own credit transactions"
ON credit_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all credit_transactions"
ON credit_transactions FOR ALL
USING (auth.role() = 'service_role');

-- Policies for meditations
CREATE POLICY "Users can view their own meditations"
ON meditations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meditations"
ON meditations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all meditations"
ON meditations FOR ALL
USING (auth.role() = 'service_role');

-- Policies for subscription_history
CREATE POLICY "Users can view their own subscription history"
ON subscription_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscription_history"
ON subscription_history FOR ALL
USING (auth.role() = 'service_role');

-- Grant necessary permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
