-- Add Stripe-related billing columns to profiles
alter table public.profiles
  add column if not exists stripe_customer_id text unique,
  add column if not exists subscription_status text,
  add column if not exists price_id text,
  add column if not exists current_period_end timestamptz;


