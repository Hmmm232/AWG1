-- A Walled Garden — Data-layer hardening migration
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Until now, rate limits and content-size limits were enforced only in the
-- browser: anyone holding the (public) anon key could insert directly via
-- the Supabase API and skip them. This migration makes the database itself
-- enforce:
--   1. daily creation limits (categories 20, works/quotes/rerecs 50)
--   2. field length caps matching the app's form limits
--   3. slug shape (lowercase alphanumerics and hyphens)
--   4. handle shape + reserved route names (new signups only)
-- and it canonicalises any re-rec source URLs that were stored with a
-- localhost/preview origin.
--
-- All check constraints are added NOT VALID: they apply to new inserts and
-- updates but existing rows are not re-checked, so this cannot fail against
-- live data.

-- ────────────────────────────────────────────────────────────────
-- 1. Daily creation limits, enforced by trigger
-- ────────────────────────────────────────────────────────────────
create or replace function public.enforce_daily_insert_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  daily_limit int := tg_argv[0]::int;
  n int;
begin
  execute format(
    'select count(*) from %I where user_id = $1 and created_at >= date_trunc(''day'', now())',
    tg_table_name
  ) into n using new.user_id;

  if n >= daily_limit then
    raise exception 'Daily limit reached — you can add up to % % per day.',
      daily_limit, tg_table_name;
  end if;

  return new;
end;
$$;

drop trigger if exists categories_daily_limit on categories;
create trigger categories_daily_limit
  before insert on categories
  for each row execute function public.enforce_daily_insert_limit('20');

drop trigger if exists works_daily_limit on works;
create trigger works_daily_limit
  before insert on works
  for each row execute function public.enforce_daily_insert_limit('50');

drop trigger if exists quotes_daily_limit on quotes;
create trigger quotes_daily_limit
  before insert on quotes
  for each row execute function public.enforce_daily_insert_limit('50');

drop trigger if exists rerecs_daily_limit on rerecs;
create trigger rerecs_daily_limit
  before insert on rerecs
  for each row execute function public.enforce_daily_insert_limit('50');

-- ────────────────────────────────────────────────────────────────
-- 2. Field length caps (mirror the app's form maxLengths)
-- ────────────────────────────────────────────────────────────────
alter table profiles drop constraint if exists profiles_field_lengths;
alter table profiles add constraint profiles_field_lengths check (
  char_length(display_name) <= 100 and
  char_length(bio) <= 500
) not valid;

alter table categories drop constraint if exists categories_field_lengths;
alter table categories add constraint categories_field_lengths check (
  char_length(name) <= 200 and
  char_length(introduction) <= 2000
) not valid;

alter table works drop constraint if exists works_field_lengths;
alter table works add constraint works_field_lengths check (
  char_length(title) <= 300 and
  char_length(commentary) <= 5000
) not valid;

alter table quotes drop constraint if exists quotes_field_lengths;
alter table quotes add constraint quotes_field_lengths check (
  char_length(quote_text) <= 5000 and
  char_length(attribution) <= 300 and
  char_length(source) <= 300 and
  char_length(note) <= 2000
) not valid;

alter table rerecs drop constraint if exists rerecs_field_lengths;
alter table rerecs add constraint rerecs_field_lengths check (
  char_length(work_title) <= 300 and
  char_length(original_recommender) <= 200 and
  char_length(commentary) <= 5000 and
  char_length(source_url) <= 2000
) not valid;

-- ────────────────────────────────────────────────────────────────
-- 3. Slug shape (lowercase alphanumerics + hyphens, max 80 chars)
-- ────────────────────────────────────────────────────────────────
alter table categories drop constraint if exists categories_slug_format;
alter table categories add constraint categories_slug_format check (
  slug is null or (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80)
) not valid;

alter table works drop constraint if exists works_slug_format;
alter table works add constraint works_slug_format check (
  slug is null or (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80)
) not valid;

-- ────────────────────────────────────────────────────────────────
-- 4. Handle shape + reserved route names
--    (Keep the list in sync with lib/reservedHandles.js.
--     NOT VALID: existing handles are untouched.)
-- ────────────────────────────────────────────────────────────────
alter table profiles drop constraint if exists profiles_handle_format;
alter table profiles add constraint profiles_handle_format check (
  handle ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' and
  char_length(handle) between 2 and 30
) not valid;

alter table profiles drop constraint if exists profiles_handle_not_reserved;
alter table profiles add constraint profiles_handle_not_reserved check (
  handle not in (
    '404','about','admin','api','explore','index','lookup','privacy',
    'reset-password','saved','search','settings','signin','signup',
    'sitemap','terms','update-password',
    'account','app','auth','blog','docs','feed','help','home','login',
    'logout','mail','new','news','quotes','rss','static','status',
    'support','www',
    'awalledgarden','moderator','official','root','staff','team'
  )
) not valid;

-- ────────────────────────────────────────────────────────────────
-- 5. Canonicalise re-rec source URLs stored with a localhost or
--    preview-deployment origin
-- ────────────────────────────────────────────────────────────────
update rerecs
set source_url = regexp_replace(source_url, '^https?://[^/]+', 'https://awalledgarden.org')
where source_url <> ''
  and source_url !~ '^https://awalledgarden\.org(/|$)';
