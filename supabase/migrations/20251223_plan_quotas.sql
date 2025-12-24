-- Plan quotas: add scan_logs and trigger to enforce free weekly pull limit (3/week)
-- Note: We distinguish 'free' users as profiles without an active/trialing subscription.
-- Core/Pro have unlimited pulls. Keyword limits are enforced in application code.

create table if not exists public.scan_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  keyword_id uuid references public.keywords(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.scan_logs enable row level security;

create policy "Users can manage own scan logs"
  on public.scan_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists scan_logs_user_week_idx on public.scan_logs (user_id, created_at desc);

-- Helper: is_free_user(user_id) -> boolean
create or replace function public.is_free_user(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not (
    coalesce(subscription_status, '') in ('active','trialing')
    and price_id is not null
  )
  from public.profiles
  where id = p_user_id
$$;

-- Trigger: prevent more than 3 scan_logs in the past 7 days for free users
create or replace function public.check_free_pull_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pulls_count int;
begin
  if public.is_free_user(new.user_id) then
    select count(*) into pulls_count
    from public.scan_logs
    where user_id = new.user_id
      and created_at >= (now() - interval '7 days');

    if pulls_count >= 3 then
      raise exception 'Free plan limit reached: 3 pulls per 7 days' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_free_pull_limit on public.scan_logs;
create trigger trg_check_free_pull_limit
before insert on public.scan_logs
for each row
execute procedure public.check_free_pull_limit();


