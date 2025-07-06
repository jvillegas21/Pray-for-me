create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- Table: prayers
create table if not exists public.prayers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  body text not null,
  location geography(Point,4326) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Spatial index for geo-queries
create index if not exists prayers_location_gix on public.prayers using gist (location);

-- Table: prayer_likes (many-to-many between users and prayers)
create table if not exists public.prayer_likes (
  prayer_id uuid references public.prayers on delete cascade,
  user_id   uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (prayer_id, user_id)
);

-- Row-level security
alter table public.prayers enable row level security;
alter table public.prayer_likes enable row level security;

-- Policies for prayers
create policy "Public read prayers" on public.prayers
  for select using (true);

create policy "Owner modify prayers" on public.prayers
  for update using (auth.uid() = user_id);

create policy "Owner insert prayers" on public.prayers
  for insert with check (auth.uid() = user_id);

create policy "Owner delete prayers" on public.prayers
  for delete using (auth.uid() = user_id);

-- Policies for prayer_likes
create policy "Public read prayer likes" on public.prayer_likes
  for select using (true);

create policy "Allow like own user" on public.prayer_likes
  for insert using (auth.uid() = user_id);

-- Make sure only owner can delete like
create policy "Owner delete like" on public.prayer_likes
  for delete using (auth.uid() = user_id);