-- Runs table: one row per scan execution per user
create table if not exists public.runs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'started' check (status in ('started','succeeded','failed')),
  tier text not null default 'free' check (tier in ('free','early','builder')),
  inserted_count integer not null default 0,
  duration_ms integer,
  error text
);

-- Indexes for quota checks and retrieval
create index if not exists runs_user_created_at_idx on public.runs (user_id, created_at desc);
create index if not exists runs_user_status_idx on public.runs (user_id, status);

-- Enable Row Level Security
alter table public.runs enable row level security;

-- Policies: users may see and insert their own runs
drop policy if exists "Runs are viewable by owner" on public.runs;
create policy "Runs are viewable by owner"
  on public.runs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own runs" on public.runs;
create policy "Users can insert their own runs"
  on public.runs
  for insert
  with check (auth.uid() = user_id);

-- Optional: allow owners to update their own runs (e.g., client-side progress)
-- Server with service role bypasses RLS anyway.
drop policy if exists "Users can update their own runs" on public.runs;
create policy "Users can update their own runs"
  on public.runs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


