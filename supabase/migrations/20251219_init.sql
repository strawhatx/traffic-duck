-- Profiles table (user profile linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text
);

alter table public.profiles enable row level security;

create policy "profiles select own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles insert own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles update own"
on public.profiles for update
using (auth.uid() = id);

-- Platforms reference data
create table if not exists public.platforms (
  id serial primary key,
  slug text not null unique,
  name text not null,
  is_pro_only boolean not null default false
);

alter table public.platforms enable row level security;

-- Allow read-only access to platforms for all
create policy "platforms read"
on public.platforms for select
to anon, authenticated
using (true);

-- Seed default platforms (idempotent)
insert into public.platforms (slug, name, is_pro_only)
values
  ('reddit', 'Reddit', false),
  ('instagram', 'Instagram', false),
  ('twitter', 'Twitter / X', true)
on conflict (slug) do update set
  name = excluded.name,
  is_pro_only = excluded.is_pro_only;

-- Keywords owned by users
create table if not exists public.keywords (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  phrase text not null,
  created_at timestamptz not null default now(),
  constraint unique_user_phrase unique (user_id, phrase)
);

alter table public.keywords enable row level security;

create policy "keywords select own"
on public.keywords for select
using (auth.uid() = user_id);

create policy "keywords insert own"
on public.keywords for insert
with check (auth.uid() = user_id);

create policy "keywords update own"
on public.keywords for update
using (auth.uid() = user_id);

create policy "keywords delete own"
on public.keywords for delete
using (auth.uid() = user_id);

-- Join table: which platforms are tracked for a keyword
create table if not exists public.keyword_platforms (
  keyword_id bigint not null references public.keywords(id) on delete cascade,
  platform_id integer not null references public.platforms(id) on delete restrict,
  primary key (keyword_id, platform_id)
);

alter table public.keyword_platforms enable row level security;

create policy "keyword_platforms own via keyword"
on public.keyword_platforms for select
using (
  exists (
    select 1 from public.keywords k
    where k.id = keyword_id and k.user_id = auth.uid()
  )
);

create policy "keyword_platforms insert own via keyword"
on public.keyword_platforms for insert
with check (
  exists (
    select 1 from public.keywords k
    where k.id = keyword_id and k.user_id = auth.uid()
  )
);

create policy "keyword_platforms update own via keyword"
on public.keyword_platforms for update
using (
  exists (
    select 1 from public.keywords k
    where k.id = keyword_id and k.user_id = auth.uid()
  )
);

create policy "keyword_platforms delete own via keyword"
on public.keyword_platforms for delete
using (
  exists (
    select 1 from public.keywords k
    where k.id = keyword_id and k.user_id = auth.uid()
  )
);


