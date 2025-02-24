-- Drop existing tables if they exist
drop table if exists user_meditation_minutes cascade;
drop table if exists user_credits cascade;
drop table if exists user_subscriptions cascade;
drop table if exists customer_subscriptions cascade;
drop table if exists customers cascade;

-- Create customers table
create table if not exists customers (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    stripe_customer_id text unique,
    email text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(user_id)
);

-- Create customer_subscriptions table
create table if not exists customer_subscriptions (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references customers(id) on delete cascade not null,
    subscription_id text unique not null,
    price_id text not null,
    status text not null,
    subscription_tier text not null,
    current_period_start timestamptz not null,
    current_period_end timestamptz not null,
    cancel_at_period_end boolean default false,
    canceled_at timestamptz,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Create user_subscriptions table
create table if not exists user_subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    subscription_status text not null default 'inactive',
    subscription_tier text not null default 'basic',
    stripe_subscription_id text,
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean default false,
    current_minutes_per_month integer default 0,
    current_credits_per_month integer default 0,
    next_minutes_per_month integer default 0,
    next_credits_per_month integer default 0,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(user_id)
);

-- Create user_meditation_minutes table
create table if not exists user_meditation_minutes (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    available_minutes integer default 0,
    total_minutes integer default 0,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(user_id)
);

-- Create user_credits table
create table if not exists user_credits (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    available_credits integer default 0,
    total_credits integer default 0,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(user_id)
);

-- Function to handle subscription changes
create or replace function handle_subscription_change()
returns trigger as $$
begin
    -- On subscription tier change, update next period limits
    if (TG_OP = 'UPDATE' AND (OLD.subscription_tier IS NULL OR OLD.subscription_tier != NEW.subscription_tier)) then
        -- Set next period limits based on tier
        NEW.next_minutes_per_month := 
            case NEW.subscription_tier
                when 'basic' then 10
                when 'pro' then 30
                when 'premium' then 60
                else 0
            end;
        NEW.next_credits_per_month := NEW.next_minutes_per_month * 10;
        
        -- For new subscriptions, also set current limits
        if (OLD.subscription_tier IS NULL) then
            NEW.current_minutes_per_month := NEW.next_minutes_per_month;
            NEW.current_credits_per_month := NEW.next_credits_per_month;
        end if;
    end if;

    -- On period rollover, apply next period limits
    if (TG_OP = 'UPDATE' AND OLD.current_period_start != NEW.current_period_start) then
        NEW.current_minutes_per_month := NEW.next_minutes_per_month;
        NEW.current_credits_per_month := NEW.next_credits_per_month;
    end if;

    return NEW;
end;
$$ language plpgsql;

-- Function to create user resources
create or replace function handle_new_user()
returns trigger as $$
begin
    -- Create subscription record
    insert into user_subscriptions (user_id)
    values (NEW.id);

    -- Create meditation minutes record
    insert into user_meditation_minutes (user_id)
    values (NEW.id);

    -- Create credits record
    insert into user_credits (user_id)
    values (NEW.id);

    return NEW;
end;
$$ language plpgsql;

-- Drop existing triggers if exists
drop trigger if exists subscription_change_trigger on user_subscriptions;
drop trigger if exists auth_user_created on auth.users;
drop trigger if exists handle_updated_at_customers on customers;
drop trigger if exists handle_updated_at_customer_subscriptions on customer_subscriptions;

-- Create trigger for subscription changes
create trigger subscription_change_trigger
    before update on user_subscriptions
    for each row
    execute function handle_subscription_change();

-- Create trigger for new users
create trigger auth_user_created
    after insert on auth.users
    for each row
    execute function handle_new_user();

-- Enable RLS
alter table customers enable row level security;
alter table customer_subscriptions enable row level security;
alter table user_subscriptions enable row level security;
alter table user_meditation_minutes enable row level security;
alter table user_credits enable row level security;

-- Create policies
create policy "Users can view their own customer data"
    on customers for select
    using (auth.uid() = user_id);

create policy "Service role can manage customers"
    on customers for all
    using (auth.jwt()->>'role' = 'service_role');

create policy "Users can view their customer subscriptions"
    on customer_subscriptions for select
    using (
        exists (
            select 1 from customers c
            where c.id = customer_subscriptions.customer_id
            and c.user_id = auth.uid()
        )
    );

create policy "Service role can manage customer subscriptions"
    on customer_subscriptions for all
    using (auth.jwt()->>'role' = 'service_role');

create policy "Users can view their own subscription"
    on user_subscriptions for select
    using (auth.uid() = user_id);

create policy "Users can update their own subscription"
    on user_subscriptions for update
    using (auth.uid() = user_id);

create policy "Service role can manage user subscriptions"
    on user_subscriptions for all
    using (auth.jwt()->>'role' = 'service_role');

create policy "Users can view their own meditation minutes"
    on user_meditation_minutes for select
    using (auth.uid() = user_id);

create policy "Users can update their own meditation minutes"
    on user_meditation_minutes for update
    using (auth.uid() = user_id);

create policy "Service role can manage meditation minutes"
    on user_meditation_minutes for all
    using (auth.jwt()->>'role' = 'service_role');

create policy "Users can view their own credits"
    on user_credits for select
    using (auth.uid() = user_id);

create policy "Users can update their own credits"
    on user_credits for update
    using (auth.uid() = user_id);

create policy "Service role can manage credits"
    on user_credits for all
    using (auth.jwt()->>'role' = 'service_role');

-- Function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at_customers
    before update on customers
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at_customer_subscriptions
    before update on customer_subscriptions
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at_user_subscriptions
    before update on user_subscriptions
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at_user_meditation_minutes
    before update on user_meditation_minutes
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at_user_credits
    before update on user_credits
    for each row
    execute function handle_updated_at();
