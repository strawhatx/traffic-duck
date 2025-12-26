-- Restore keywords table and link search_results to keyword_id; remove 'intent'
create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  keyword text not null,
  platform text[] not null default array['reddit']
    check (platform <@ array['reddit','instagram','twitter','all']),
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, keyword, platform)
);

alter table public.keywords enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='keywords' and policyname='Users can manage own keywords'
  ) then
    create policy "Users can manage own keywords"
      on public.keywords
      for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Link search_results to keywords; drop 'intent'
alter table public.search_results
  add column if not exists keyword_id uuid references public.keywords(id) on delete cascade;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'search_results' and column_name = 'intent'
  ) then
    alter table public.search_results drop column intent;
  end if;
end $$;

create index if not exists search_results_keyword_id_idx on public.search_results(keyword_id);


