-- Update Free plan caps: 1–2 conversations lifetime and no analysis
-- Adjust the existing function to both enforce 2-total limit and strip analysis fields

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
    -- Force no analysis for free
    new.why_matters := null;
    new.engagement_path := null;

    -- Enforce max of 2 lifetime results
    select count(*) into results_count
    from public.search_results
    where user_id = new.user_id;

    if results_count >= 2 then
      raise exception 'Free plan limit reached: maximum of 2 results lifetime' using errcode = 'P0001';
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


