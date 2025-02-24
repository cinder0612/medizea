-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_user_subscription_status(uuid);
DROP FUNCTION IF EXISTS public.get_user_credits(uuid);
DROP FUNCTION IF EXISTS public.get_user_meditation_minutes(uuid);
DROP FUNCTION IF EXISTS public.update_user_profile(uuid, text);
DROP FUNCTION IF EXISTS public.log_credit_transaction(uuid, integer, text, text, jsonb);

-- Function to get user's subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'subscription_tier', subscription_tier,
        'subscription_status', subscription_status,
        'current_period_end', current_period_end,
        'cancel_at_period_end', cancel_at_period_end,
        'current_minutes_per_month', current_minutes_per_month,
        'current_credits_per_month', current_credits_per_month
    )
    INTO v_result
    FROM user_subscriptions
    WHERE user_id = p_user_id;

    RETURN COALESCE(v_result, jsonb_build_object(
        'subscription_tier', 'basic',
        'subscription_status', 'inactive',
        'current_period_end', NULL,
        'cancel_at_period_end', false,
        'current_minutes_per_month', 0,
        'current_credits_per_month', 0
    ));
END;
$$;

-- Function to get user's credit balance
CREATE OR REPLACE FUNCTION public.get_user_credits(
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'available_credits', available_credits,
        'total_credits', total_credits,
        'credit_expiry', credit_expiry,
        'last_credit_update', last_credit_update
    )
    INTO v_result
    FROM user_credits
    WHERE user_id = p_user_id;

    RETURN COALESCE(v_result, jsonb_build_object(
        'available_credits', 0,
        'total_credits', 0,
        'credit_expiry', NULL,
        'last_credit_update', NULL
    ));
END;
$$;

-- Function to get user's meditation minutes
CREATE OR REPLACE FUNCTION public.get_user_meditation_minutes(
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'available_minutes', available_minutes,
        'total_minutes', total_minutes
    )
    INTO v_result
    FROM user_meditation_minutes
    WHERE user_id = p_user_id;

    RETURN COALESCE(v_result, jsonb_build_object(
        'available_minutes', 0,
        'total_minutes', 0
    ));
END;
$$;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_user_id UUID,
    p_avatar_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    UPDATE profiles
    SET 
        avatar_url = p_avatar_url,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING jsonb_build_object(
        'id', id,
        'avatar_url', avatar_url,
        'updated_at', updated_at
    ) INTO v_result;

    RETURN COALESCE(v_result, jsonb_build_object(
        'error', 'Profile not found'
    ));
END;
$$;

-- Function to log credit transactions
CREATE OR REPLACE FUNCTION public.log_credit_transaction(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    INSERT INTO credit_transactions (
        user_id,
        amount,
        transaction_type,
        description,
        metadata
    )
    VALUES (
        p_user_id,
        p_amount,
        p_transaction_type,
        p_description,
        p_metadata
    )
    RETURNING id INTO v_transaction_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_meditation_minutes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_credit_transaction(UUID, INTEGER, TEXT, TEXT, JSONB) TO authenticated;
