-- Enable RLS
ALTER TABLE IF EXISTS public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
    DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
    DROP POLICY IF EXISTS "Users can insert their own credits" ON public.user_credits;
END $$;

CREATE POLICY "Users can view their own credits"
    ON public.user_credits FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
    ON public.user_credits FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
    ON public.user_credits FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;

CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_credits_updated_at();

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.deduct_meditation_credits(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.refund_meditation_credits(UUID, INTEGER);

-- Function to deduct meditation credits
CREATE OR REPLACE FUNCTION public.deduct_meditation_credits(
    p_user_id UUID,
    p_minutes INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_credits_required INTEGER;
    v_available_credits INTEGER;
    v_result JSONB;
    v_minutes_available INTEGER;
BEGIN
    -- Verify the user is deducting their own credits
    IF p_user_id != auth.uid() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized operation'
        );
    END IF;

    -- Calculate required credits (10 credits per minute)
    v_credits_required := p_minutes * 10;
    
    -- Get current available credits and minutes
    SELECT uc.available_credits, um.available_minutes 
    INTO v_available_credits, v_minutes_available
    FROM public.user_credits uc
    LEFT JOIN public.user_meditation_minutes um ON um.user_id = uc.user_id
    WHERE uc.user_id = p_user_id;
    
    -- Check if user has enough credits
    IF v_available_credits IS NULL OR v_available_credits < v_credits_required THEN
        RETURN jsonb_build_object(
            'success', false,
            'remaining_credits', COALESCE(v_available_credits, 0),
            'error', 'Insufficient credits'
        );
    END IF;
    
    -- Begin transaction
    BEGIN
        -- Deduct credits
        UPDATE public.user_credits
        SET 
            available_credits = available_credits - v_credits_required,
            updated_at = NOW()
        WHERE user_id = p_user_id
        RETURNING available_credits INTO v_available_credits;
        
        -- Update meditation minutes
        UPDATE public.user_meditation_minutes
        SET 
            available_minutes = available_minutes + p_minutes,
            total_minutes = total_minutes + p_minutes,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- If no row exists in meditation_minutes, insert one
        IF NOT FOUND THEN
            INSERT INTO public.user_meditation_minutes 
                (user_id, available_minutes, total_minutes)
            VALUES 
                (p_user_id, p_minutes, p_minutes);
        END IF;
        
        RETURN jsonb_build_object(
            'success', true,
            'remaining_credits', v_available_credits,
            'minutes_available', COALESCE(v_minutes_available, 0) + p_minutes,
            'error', NULL
        );
    EXCEPTION WHEN OTHERS THEN
        -- Rollback will happen automatically
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
    END;
END;
$$;

-- Function to refund meditation credits
CREATE OR REPLACE FUNCTION public.refund_meditation_credits(
    p_user_id UUID,
    p_minutes INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_credits_to_refund INTEGER;
    v_refunded_credits INTEGER;
    v_minutes_available INTEGER;
    v_result JSONB;
BEGIN
    -- Verify the user is refunding their own credits
    IF p_user_id != auth.uid() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized operation'
        );
    END IF;

    -- Calculate credits to refund (10 credits per minute)
    v_credits_to_refund := p_minutes * 10;
    
    -- Begin transaction
    BEGIN
        -- Add credits back
        UPDATE public.user_credits
        SET 
            available_credits = available_credits + v_credits_to_refund,
            updated_at = NOW()
        WHERE user_id = p_user_id
        RETURNING available_credits INTO v_refunded_credits;
        
        -- Remove minutes
        UPDATE public.user_meditation_minutes
        SET 
            available_minutes = GREATEST(available_minutes - p_minutes, 0),
            updated_at = NOW()
        WHERE user_id = p_user_id
        RETURNING available_minutes INTO v_minutes_available;
        
        -- Check if update was successful
        IF v_refunded_credits IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'refunded_credits', 0,
                'error', 'Failed to refund credits'
            );
        END IF;
        
        RETURN jsonb_build_object(
            'success', true,
            'refunded_credits', v_credits_to_refund,
            'remaining_credits', v_refunded_credits,
            'minutes_available', COALESCE(v_minutes_available, 0),
            'error', NULL
        );
    EXCEPTION WHEN OTHERS THEN
        -- Rollback will happen automatically
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
    END;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON public.user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_meditation_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_meditation_credits(UUID, INTEGER) TO authenticated;
