create table if not exists public.prayer_ai_suggestions (
  prayer_id uuid primary key references public.prayers(id) on delete cascade,
  verses jsonb not null,
  study jsonb,
  created_at timestamptz default now()
);