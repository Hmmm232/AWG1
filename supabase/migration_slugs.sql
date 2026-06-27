-- A Walled Garden — Pretty-URL slugs migration
-- Run this once in your Supabase SQL editor. It is safe to re-run.
--
-- Adds a `slug` to categories (unique per user) and works (unique per
-- category), backfills slugs for existing rows from their names/titles,
-- and adds the uniqueness indexes the app relies on.
--
-- Note: the backfill slugifies with plain SQL (lowercase, non-alphanumerics
-- → hyphens). Accented characters are not transliterated here the way the
-- app does on new inserts, but slugs are frozen once set, so existing rows
-- keep whatever they get here and stay stable.

-- 1. Add nullable slug columns
alter table categories add column if not exists slug text;
alter table works add column if not exists slug text;

-- 2. Backfill categories — slugify(name), de-duplicated per user
with base as (
  select
    id,
    user_id,
    coalesce(
      nullif(
        trim(both '-' from
          substring(
            trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
          from 1 for 60)
        ),
        ''),
      'untitled'
    ) as b
  from categories
),
numbered as (
  select id, b,
    row_number() over (partition by user_id, b order by created_at, id) as rn
  from base
)
update categories c
set slug = case when n.rn = 1 then n.b else n.b || '-' || n.rn end
from numbered n
where n.id = c.id
  and (c.slug is null or c.slug = '');

-- 3. Backfill works — slugify(title), de-duplicated per category
with base as (
  select
    id,
    category_id,
    coalesce(
      nullif(
        trim(both '-' from
          substring(
            trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
          from 1 for 60)
        ),
        ''),
      'untitled'
    ) as b
  from works
),
numbered as (
  select id, b,
    row_number() over (partition by category_id, b order by created_at, id) as rn
  from base
)
update works w
set slug = case when n.rn = 1 then n.b else n.b || '-' || n.rn end
from numbered n
where n.id = w.id
  and (w.slug is null or w.slug = '');

-- 4. Enforce uniqueness within scope (multiple NULLs are allowed, but every
--    row is backfilled above, and the app always sets a slug on insert)
create unique index if not exists categories_user_slug_idx on categories (user_id, slug);
create unique index if not exists works_category_slug_idx on works (category_id, slug);
