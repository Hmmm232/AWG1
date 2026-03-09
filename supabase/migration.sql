-- A Walled Garden — Database Migration
-- Run this in your Supabase SQL Editor

-- Profiles table (extends Supabase Auth users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  handle text unique not null,
  display_name text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now()
);

-- Categories (for the Garden tab)
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  introduction text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Works (items within categories)
create table works (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  commentary text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Quotes
create table quotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  quote_text text not null,
  attribution text not null default '',
  source text not null default '',
  note text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- NOTE: If the quotes table already exists, run this instead:
-- alter table quotes add column note text not null default '';

-- Re-recs
create table rerecs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  original_recommender text not null default '',
  work_title text not null,
  commentary text not null default '',
  source_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Follows
create table follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

-- Prevent self-follows
alter table follows add constraint no_self_follow check (follower_id != following_id);

-- Indexes
create index idx_categories_user on categories(user_id);
create index idx_works_category on works(category_id);
create index idx_works_user on works(user_id);
create index idx_quotes_user on quotes(user_id);
create index idx_rerecs_user on rerecs(user_id);
create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);
create index idx_profiles_handle on profiles(handle);

-- Row Level Security
alter table profiles enable row level security;
alter table categories enable row level security;
alter table works enable row level security;
alter table quotes enable row level security;
alter table rerecs enable row level security;
alter table follows enable row level security;

-- Profiles: anyone can read, only the owner can update
create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

-- Categories: anyone can read, only the owner can modify
create policy "Categories are publicly readable"
  on categories for select using (true);

create policy "Users can insert their own categories"
  on categories for insert with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on categories for update using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on categories for delete using (auth.uid() = user_id);

-- Works: anyone can read, only the owner can modify
create policy "Works are publicly readable"
  on works for select using (true);

create policy "Users can insert their own works"
  on works for insert with check (auth.uid() = user_id);

create policy "Users can update their own works"
  on works for update using (auth.uid() = user_id);

create policy "Users can delete their own works"
  on works for delete using (auth.uid() = user_id);

-- Quotes: anyone can read, only the owner can modify
create policy "Quotes are publicly readable"
  on quotes for select using (true);

create policy "Users can insert their own quotes"
  on quotes for insert with check (auth.uid() = user_id);

create policy "Users can update their own quotes"
  on quotes for update using (auth.uid() = user_id);

create policy "Users can delete their own quotes"
  on quotes for delete using (auth.uid() = user_id);

-- Rerecs: anyone can read, only the owner can modify
create policy "Rerecs are publicly readable"
  on rerecs for select using (true);

create policy "Users can insert their own rerecs"
  on rerecs for insert with check (auth.uid() = user_id);

create policy "Users can update their own rerecs"
  on rerecs for update using (auth.uid() = user_id);

create policy "Users can delete their own rerecs"
  on rerecs for delete using (auth.uid() = user_id);

-- Follows: anyone can read, users manage their own follows
create policy "Follows are publicly readable"
  on follows for select using (true);

create policy "Users can follow others"
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete using (auth.uid() = follower_id);

-- Likes (favourites — public)
create table likes (
  user_id uuid references profiles(id) on delete cascade not null,
  item_id uuid not null,
  item_type text not null check (item_type in ('work', 'quote', 'category')),
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Saves (bookmarks — private to the user)
create table saves (
  user_id uuid references profiles(id) on delete cascade not null,
  item_id uuid not null,
  item_type text not null check (item_type in ('work', 'quote', 'category')),
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Indexes for likes and saves
create index idx_likes_user on likes(user_id);
create index idx_likes_item on likes(item_id);
create index idx_likes_type on likes(item_type);
create index idx_saves_user on saves(user_id);

-- RLS for likes and saves
alter table likes enable row level security;
alter table saves enable row level security;

-- Likes: anyone can read (public counts), users manage their own
create policy "Likes are publicly readable"
  on likes for select using (true);

create policy "Users can like items"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike items"
  on likes for delete using (auth.uid() = user_id);

-- Saves: only the owner can read/manage (private bookmarks)
create policy "Users can read their own saves"
  on saves for select using (auth.uid() = user_id);

create policy "Users can save items"
  on saves for insert with check (auth.uid() = user_id);

create policy "Users can unsave items"
  on saves for delete using (auth.uid() = user_id);

-- Function to automatically create a profile on signup
-- You'll set this up as a database trigger in Supabase
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'handle',
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: create profile when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
