-- Create function to safely deduct meditation credits
CREATE OR REPLACE FUNCTION public.deduct_meditation_credits(
  p_minutes integer,
  p_user_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits_per_minute constant integer := 10;
  v_credits_needed integer;
  v_available_credits integer;
  v_available_minutes integer;
  v_total_minutes integer;
  v_result json;
BEGIN
  -- Calculate needed credits
  v_credits_needed := p_minutes * v_credits_per_minute;

  -- Get current credits
  SELECT available_credits INTO v_available_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;  -- Lock the row

  -- Get current minutes
  SELECT available_minutes, total_minutes INTO v_available_minutes, v_total_minutes
  FROM user_meditation_minutes
  WHERE user_id = p_user_id
  FOR UPDATE;  -- Lock the row

  -- Check if we have enough credits and minutes
  IF v_available_credits IS NULL OR v_available_credits < v_credits_needed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'available_credits', v_available_credits,
      'needed_credits', v_credits_needed
    );
  END IF;

  IF v_available_minutes IS NULL OR v_available_minutes < p_minutes THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient minutes',
      'available_minutes', v_available_minutes,
      'needed_minutes', p_minutes
    );
  END IF;

  -- Update credits
  UPDATE user_credits
  SET 
    available_credits = available_credits - v_credits_needed,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update minutes
  UPDATE user_meditation_minutes
  SET 
    available_minutes = available_minutes - p_minutes,
    total_minutes = total_minutes + p_minutes,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Return success result
  RETURN json_build_object(
    'success', true,
    'credits_deducted', v_credits_needed,
    'minutes_deducted', p_minutes,
    'new_available_credits', v_available_credits - v_credits_needed,
    'new_available_minutes', v_available_minutes - p_minutes,
    'new_total_minutes', v_total_minutes + p_minutes
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.deduct_meditation_credits(integer, uuid) TO authenticated;

-- Add RLS policy to allow function execution
CREATE POLICY "Allow users to deduct their own credits" 
  ON user_credits 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own minutes" 
  ON user_meditation_minutes 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);
