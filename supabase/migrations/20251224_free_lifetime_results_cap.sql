-- Switch Free plan enforcement from weekly pulls to lifetime results cap
-- 1) Drop previous weekly-pull trigger (if present)
drop trigger if exists trg_check_free_pull_limit on public.scan_logs;
drop function if exists public.check_free_pull_limit();

-- 2) Enforce: Free plan can have only 3 total search_results lifetime
-- Reuse helper is_free_user(user_id) introduced earlier
create or replace function public.check_free_results_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  results_count int;
begin
  if public.is_free_user(new.user_id) then
    select count(*) into results_count
    from public.search_results
    where user_id = new.user_id;

    if results_count >= 3 then
      raise exception 'Free plan limit reached: maximum of 3 results lifetime' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_free_results_limit on public.search_results;
create trigger trg_check_free_results_limit
before insert on public.search_results
for each row
execute procedure public.check_free_results_limit();


