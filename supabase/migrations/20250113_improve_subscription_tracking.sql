-- Add fields to user_subscriptions table to track subscription changes
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS previous_tier text,
ADD COLUMN IF NOT EXISTS tier_change_date timestamptz,
ADD COLUMN IF NOT EXISTS cancellation_date timestamptz,
ADD COLUMN IF NOT EXISTS cancellation_effective_date timestamptz;

-- Add trigger to update tier change tracking
CREATE OR REPLACE FUNCTION update_subscription_tracking()
RETURNS TRIGGER AS $$
BEGIN
    -- Track tier changes
    IF (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier) THEN
        NEW.previous_tier = OLD.subscription_tier;
        NEW.tier_change_date = NOW();
    END IF;

    -- Track cancellation
    IF (OLD.subscription_status != 'canceled' AND NEW.subscription_status = 'canceled') THEN
        NEW.cancellation_date = NOW();
        NEW.cancellation_effective_date = NEW.current_period_end;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS subscription_tracking_trigger ON user_subscriptions;
CREATE TRIGGER subscription_tracking_trigger
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_tracking();
