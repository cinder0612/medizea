-- Update subscription status function
CREATE OR REPLACE FUNCTION update_subscription_status(
  p_user_id UUID,
  p_customer_id UUID,
  p_subscription_id TEXT,
  p_subscription_tier TEXT,
  p_price_id TEXT,
  p_minutes INTEGER,
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE,
  p_cancel_at_period_end BOOLEAN
) RETURNS void AS $$
BEGIN
  -- First, deactivate any existing active subscriptions
  UPDATE user_subscriptions 
  SET subscription_status = 'inactive'
  WHERE user_id = p_user_id 
  AND subscription_status = 'active';

  UPDATE customer_subscriptions
  SET status = 'inactive'
  WHERE customer_id = p_customer_id
  AND status = 'active';

  -- Insert new user subscription
  INSERT INTO user_subscriptions (
    user_id,
    subscription_status,
    subscription_tier,
    stripe_subscription_id,
    current_minutes_per_month,
    current_credits_per_month,
    next_minutes_per_month,
    next_credits_per_month,
    current_period_start,
    current_period_end,
    cancel_at_period_end
  ) VALUES (
    p_user_id,
    'active',
    p_subscription_tier,
    p_subscription_id,
    p_minutes,
    p_minutes * 2, -- CREDITS_PER_MINUTE constant
    p_minutes,
    p_minutes * 2,
    p_current_period_start,
    p_current_period_end,
    p_cancel_at_period_end
  );

  -- Insert new customer subscription
  INSERT INTO customer_subscriptions (
    customer_id,
    subscription_id,
    price_id,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    plan_type
  ) VALUES (
    p_customer_id,
    p_subscription_id,
    p_price_id,
    'active',
    p_current_period_start,
    p_current_period_end,
    p_cancel_at_period_end,
    p_subscription_tier
  );
END;
$$ LANGUAGE plpgsql;
