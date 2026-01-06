-- Ensure no duplicate conversations for the same user/platform/url
create unique index if not exists search_results_user_platform_url_uniq
  on public.search_results (user_id, platform, url);


