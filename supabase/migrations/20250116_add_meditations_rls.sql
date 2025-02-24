-- Enable RLS
alter table public.meditations enable row level security;

-- Create policies
create policy "Users can view their own meditations"
  on public.meditations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meditations"
  on public.meditations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meditations"
  on public.meditations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own meditations"
  on public.meditations for delete
  using (auth.uid() = user_id);
