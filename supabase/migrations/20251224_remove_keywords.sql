-- Remove keywords table and migrate search_results to store intent directly

-- 1) Add intent column to search_results
alter table public.search_results
  add column if not exists intent text;

-- 2) Drop foreign key from search_results.keyword_id if present, then drop column
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'search_results' and column_name = 'keyword_id'
  ) then
    begin
      alter table public.search_results drop constraint if exists search_results_keyword_id_fkey;
    exception when others then
      -- ignore
      null;
    end;
    alter table public.search_results drop column if exists keyword_id;
  end if;
end $$;

create index if not exists search_results_intent_idx on public.search_results (intent);

-- 3) Update scan_logs: drop FK/column referencing keywords
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'scan_logs' and column_name = 'keyword_id'
  ) then
    begin
      alter table public.scan_logs drop constraint if exists scan_logs_keyword_id_fkey;
    exception when others then
      null;
    end;
    alter table public.scan_logs drop column if exists keyword_id;
  end if;
end $$;

-- 4) Drop keywords table if exists (policies and indexes drop with it)
drop table if exists public.keywords cascade;


