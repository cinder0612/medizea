--Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id TEXT PRIMARY KEY,  --This will be the Stripe subscription ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status TEXT NOT NULL,
  subscription_tier TEXT NOT NULL,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--Enable RLS for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

--Create policy to allow users to view their own subscription data
CREATE POLICY "Users can view own subscription data" ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

--Create trigger for user_subscriptions table
CREATE TRIGGER handle_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
