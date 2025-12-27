-- Extend platform checks to include 'hackernews'

do $$
begin
  -- search_results.platform check
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.search_results'::regclass
      and contype = 'c'
      and conname = 'search_results_platform_check'
  ) then
    alter table public.search_results drop constraint search_results_platform_check;
  end if;
exception when others then
  null;
end $$;

alter table public.search_results
  add constraint search_results_platform_check
  check (platform in ('reddit','instagram','twitter','hackernews'));

do $$
begin
  -- keywords.platform array check
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.keywords'::regclass
      and contype = 'c'
      and conname = 'keywords_platform_check'
  ) then
    alter table public.keywords drop constraint keywords_platform_check;
  end if;
exception when others then
  null;
end $$;

alter table public.keywords
  add constraint keywords_platform_check
  check (platform <@ array['reddit','instagram','twitter','hackernews','all']);