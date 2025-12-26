-- Add audience_intent to profiles to capture who the user wants to find
alter table public.profiles
  add column if not exists audience_intent text;


