-- Add niche description storage to profiles
alter table public.profiles
  add column if not exists niche_description text;


