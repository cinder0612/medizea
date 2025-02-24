-- Create or replace the deduct_meditation_credits function
create or replace function deduct_meditation_credits(
  p_user_id uuid,
  p_minutes integer
)
returns json
language plpgsql
security definer
as $$
declare
  v_available_credits integer;
  v_required_credits integer;
  v_remaining_credits integer;
begin
  -- Calculate required credits (10 credits per minute)
  v_required_credits := p_minutes * 10;
  
  -- Get current available credits
  select available_credits into v_available_credits
  from user_credits
  where user_id = p_user_id;
  
  -- Check if user has enough credits
  if v_available_credits < v_required_credits then
    return json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'available_credits', v_available_credits,
      'required_credits', v_required_credits
    );
  end if;
  
  -- Deduct credits
  v_remaining_credits := v_available_credits - v_required_credits;
  
  update user_credits
  set 
    available_credits = v_remaining_credits,
    minutes_used = minutes_used + p_minutes,
    last_meditation_at = now()
  where user_id = p_user_id;
  
  return json_build_object(
    'success', true,
    'remaining_credits', v_remaining_credits,
    'minutes_used', p_minutes
  );
end;
$$;

-- Create or replace the refund_meditation_credits function
create or replace function refund_meditation_credits(
  p_user_id uuid,
  p_minutes integer
)
returns json
language plpgsql
security definer
as $$
declare
  v_current_credits integer;
  v_refund_amount integer;
  v_refunded_credits integer;
begin
  -- Calculate refund amount (10 credits per minute)
  v_refund_amount := p_minutes * 10;
  
  -- Get current credits
  select available_credits into v_current_credits
  from user_credits
  where user_id = p_user_id;
  
  -- Add refund
  v_refunded_credits := v_current_credits + v_refund_amount;
  
  update user_credits
  set 
    available_credits = v_refunded_credits,
    minutes_used = greatest(minutes_used - p_minutes, 0),  -- Ensure we don't go below 0
    last_refund_at = now()
  where user_id = p_user_id;
  
  -- Log the refund for auditing
  insert into credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    created_at
  ) values (
    p_user_id,
    'refund',
    v_refund_amount,
    format('Refund for failed %s minute meditation', p_minutes),
    now()
  );
  
  return json_build_object(
    'success', true,
    'refunded_credits', v_refunded_credits,
    'refund_amount', v_refund_amount
  );
end;
$$;

-- Add credit_transactions table if it doesn't exist
create table if not exists credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  transaction_type text not null,
  amount integer not null,
  description text,
  created_at timestamp with time zone default now(),
  
  constraint valid_transaction_type check (transaction_type in ('deduct', 'refund', 'add'))
);

-- Add indexes for better performance
create index if not exists idx_credit_transactions_user_id on credit_transactions(user_id);
create index if not exists idx_credit_transactions_created_at on credit_transactions(created_at);

-- Add last_refund_at column to user_credits if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
    where table_name = 'user_credits' and column_name = 'last_refund_at') 
  then
    alter table user_credits add column last_refund_at timestamp with time zone;
  end if;
end $$;
