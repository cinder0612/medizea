-- Create function to safely refund meditation credits
CREATE OR REPLACE FUNCTION public.refund_meditation_credits(
  p_minutes integer,
  p_user_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits_per_minute constant integer := 10;
  v_credits_to_refund integer;
  v_current_credits integer;
  v_total_credits integer;
  v_current_minutes integer;
  v_total_minutes integer;
  v_result json;
BEGIN
  -- Calculate refund amount
  v_credits_to_refund := p_minutes * v_credits_per_minute;

  -- Get current credits and lock the row
  SELECT available_credits, total_credits INTO v_current_credits, v_total_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;  -- Lock the row

  -- Check if user has a credit record
  IF v_current_credits IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User credit record not found'
    );
  END IF;

  -- Get current minutes and lock the row
  SELECT available_minutes, total_minutes INTO v_current_minutes, v_total_minutes
  FROM user_meditation_minutes
  WHERE user_id = p_user_id
  FOR UPDATE;  -- Lock the row

  -- Check if user has a minutes record
  IF v_current_minutes IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User meditation minutes record not found'
    );
  END IF;

  BEGIN
    -- Update credits
    UPDATE user_credits
    SET 
      available_credits = available_credits + v_credits_to_refund,
      total_credits = total_credits - v_credits_to_refund, -- Decrease total credits since meditation failed
      updated_at = NOW(),
      last_credit_update = NOW()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Failed to update user credits'
      );
    END IF;

    -- Update minutes (subtract from total since the meditation didn't complete)
    UPDATE user_meditation_minutes
    SET 
      available_minutes = available_minutes + p_minutes,
      total_minutes = GREATEST(total_minutes - p_minutes, 0), -- Ensure we don't go below 0
      updated_at = NOW()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Failed to update user minutes'
      );
    END IF;

    -- Return success result with all updated values
    RETURN json_build_object(
      'success', true,
      'credits_refunded', v_credits_to_refund,
      'minutes_refunded', p_minutes,
      'remaining_credits', v_current_credits + v_credits_to_refund,
      'total_credits', v_total_credits - v_credits_to_refund,
      'remaining_minutes', v_current_minutes + p_minutes,
      'total_minutes', GREATEST(v_total_minutes - p_minutes, 0),
      'updated_at', NOW()
    );

  EXCEPTION WHEN OTHERS THEN
    -- Log the error details
    RAISE WARNING 'Error in refund_meditation_credits: %', SQLERRM;
    
    RETURN json_build_object(
      'success', false,
      'error', format('Database error: %s', SQLERRM)
    );
  END;
END;
$$;

-- Grant execute permission to authenticated users
REVOKE EXECUTE ON FUNCTION public.refund_meditation_credits(integer, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.refund_meditation_credits(integer, uuid) TO authenticated;
