-- Track Quest Progress
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references public.characters(id),
  quest_key text not null, -- e.g. 'write_3_songs'
  title text not null,
  description text,
  target_value integer not null,
  current_value integer default 0,
  reward_xp integer default 500,
  reward_funds numeric default 100,
  is_claimed boolean default false,
  created_at timestamptz default now()
);

-- Add Chapter tracking to character
alter table public.characters add column if not exists current_chapter integer default 1;