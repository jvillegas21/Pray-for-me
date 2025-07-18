-- Supabase Auth Sync Setup
-- This file sets up triggers to keep your public.users table in sync with auth.users

-- First, ensure the users table exists with the correct structure
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;

-- Create RLS policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Function to handle user updates (like email changes)
create or replace function public.handle_user_update()
returns trigger as $$
begin
  update public.users 
  set 
    email = new.email,
    updated_at = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing triggers if they exist (to avoid conflicts)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create trigger for user updates (like email changes)
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

-- Create indexes for better performance
create index if not exists users_email_idx on public.users(email);
create index if not exists users_display_name_idx on public.users(display_name);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.users to authenticated;

-- Optional: Create a function to manually sync existing users
-- (Run this if you already have users in auth.users but not in public.users)
create or replace function public.sync_existing_users()
returns void as $$
begin
  insert into public.users (id, email, display_name, created_at, updated_at)
  select 
    au.id,
    au.email,
    coalesce(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
    au.created_at,
    au.updated_at
  from auth.users au
  left join public.users pu on au.id = pu.id
  where pu.id is null;
end;
$$ language plpgsql security definer;

-- Optional: Run this to sync any existing users
-- select public.sync_existing_users(); 