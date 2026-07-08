-- A Walled Garden — Draft works migration
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Adds draft entries for works: a work saved as a draft is visible only to
-- its owner, everywhere — the row-level security policy is what hides it,
-- so every public surface (explore, search, home, sub-pages, sitemap, OG
-- cards, counts) excludes drafts automatically via the anonymous client.

-- 1. The draft flag. Existing works stay published.
alter table works add column if not exists is_draft boolean not null default false;

-- 2. Visibility: published works are public; drafts only for their owner.
drop policy if exists "Works are publicly readable" on works;
drop policy if exists "Published works are publicly readable" on works;
create policy "Published works are publicly readable"
  on works for select
  using (is_draft = false or auth.uid() = user_id);
