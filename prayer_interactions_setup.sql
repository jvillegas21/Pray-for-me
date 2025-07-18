-- Prayer Interactions Setup
-- This file creates tables for tracking encouragements and prayer actions

-- Create encouragements table
create table if not exists public.encouragements (
  id uuid primary key default gen_random_uuid(),
  prayer_request_id uuid not null references public.prayer_requests(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Ensure one encouragement per user per prayer request
  unique(prayer_request_id, user_id)
);

-- Create prayer_actions table (tracks who has prayed for what)
create table if not exists public.prayer_actions (
  id uuid primary key default gen_random_uuid(),
  prayer_request_id uuid not null references public.prayer_requests(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  
  -- Ensure one prayer action per user per prayer request
  unique(prayer_request_id, user_id)
);

-- Enable RLS on both tables
alter table public.encouragements enable row level security;
alter table public.prayer_actions enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view encouragements" on public.encouragements;
drop policy if exists "Users can create encouragements" on public.encouragements;
drop policy if exists "Users can update their own encouragements" on public.encouragements;
drop policy if exists "Users can delete their own encouragements" on public.encouragements;

drop policy if exists "Users can view prayer actions" on public.prayer_actions;
drop policy if exists "Users can create prayer actions" on public.prayer_actions;
drop policy if exists "Users can delete their own prayer actions" on public.prayer_actions;

-- RLS policies for encouragements
create policy "Users can view encouragements" on public.encouragements
  for select using (true); -- Anyone can view encouragements

create policy "Users can create encouragements" on public.encouragements
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own encouragements" on public.encouragements
  for update using (auth.uid() = user_id);

create policy "Users can delete their own encouragements" on public.encouragements
  for delete using (auth.uid() = user_id);

-- RLS policies for prayer_actions
create policy "Users can view prayer actions" on public.prayer_actions
  for select using (true); -- Anyone can view prayer actions (for counts)

create policy "Users can create prayer actions" on public.prayer_actions
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own prayer actions" on public.prayer_actions
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists encouragements_prayer_request_idx on public.encouragements(prayer_request_id);
create index if not exists encouragements_user_idx on public.encouragements(user_id);
create index if not exists encouragements_created_at_idx on public.encouragements(created_at);

create index if not exists prayer_actions_prayer_request_idx on public.prayer_actions(prayer_request_id);
create index if not exists prayer_actions_user_idx on public.prayer_actions(user_id);
create index if not exists prayer_actions_created_at_idx on public.prayer_actions(created_at);

-- Grant permissions
grant usage on schema public to authenticated;
grant all on public.encouragements to authenticated;
grant all on public.prayer_actions to authenticated;

-- Create functions to get counts for prayer requests
create or replace function public.get_encouragement_count(prayer_request_uuid uuid)
returns bigint as $$
begin
  return (
    select count(*) 
    from public.encouragements 
    where prayer_request_id = prayer_request_uuid
  );
end;
$$ language plpgsql security definer;

create or replace function public.get_prayer_count(prayer_request_uuid uuid)
returns bigint as $$
begin
  return (
    select count(*) 
    from public.prayer_actions 
    where prayer_request_id = prayer_request_uuid
  );
end;
$$ language plpgsql security definer;

-- Function to check if current user has prayed for a request
create or replace function public.has_user_prayed(prayer_request_uuid uuid)
returns boolean as $$
begin
  return exists(
    select 1 
    from public.prayer_actions 
    where prayer_request_id = prayer_request_uuid 
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Function to check if current user has encouraged a request
create or replace function public.has_user_encouraged(prayer_request_uuid uuid)
returns boolean as $$
begin
  return exists(
    select 1 
    from public.encouragements 
    where prayer_request_id = prayer_request_uuid 
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer; 