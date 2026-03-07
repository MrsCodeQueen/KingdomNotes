-- Kingdom Notes: Core Database Schema
-- This migration creates all the tables needed for the game

-- =============================================
-- 1. Player Characters
-- =============================================
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legal_name text not null,
  artist_name text not null,
  gender text not null check (gender in ('male', 'female', 'non-binary')),
  region text not null default 'north_america',
  energy integer not null default 100 check (energy >= 0 and energy <= 100),
  anointing integer not null default 20 check (anointing >= 0 and anointing <= 100),
  funds numeric(12, 2) not null default 50.00,
  charisma integer not null default 5 check (charisma >= 0 and charisma <= 100),
  integrity integer not null default 10 check (integrity >= 0 and integrity <= 100),
  leadership integer not null default 1 check (leadership >= 0 and leadership <= 100),
  influence integer not null default 0,
  current_activity text default 'idle',
  is_fasting boolean not null default false,
  fast_started_at timestamptz,
  fast_duration_minutes integer default 0,
  last_tick_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists idx_characters_user_id on public.characters (user_id);

alter table public.characters enable row level security;

create policy "characters_select_own" on public.characters for select using (auth.uid() = user_id);
create policy "characters_insert_own" on public.characters for insert with check (auth.uid() = user_id);
create policy "characters_update_own" on public.characters for update using (auth.uid() = user_id);
create policy "characters_delete_own" on public.characters for delete using (auth.uid() = user_id);

-- =============================================
-- 2. Active Buffs
-- =============================================
create table if not exists public.buffs (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  buff_type text not null,
  buff_name text not null,
  multiplier numeric(4, 2) not null default 1.0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.buffs enable row level security;

create policy "buffs_select_own" on public.buffs
  for select using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );
create policy "buffs_insert_own" on public.buffs
  for insert with check (
    character_id in (select id from public.characters where user_id = auth.uid())
  );
create policy "buffs_delete_own" on public.buffs
  for delete using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

-- =============================================
-- 3. Inventory
-- =============================================
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  item_type text not null,
  item_name text not null,
  quality integer not null default 1 check (quality >= 1 and quality <= 10),
  acquired_at timestamptz not null default now()
);

alter table public.inventory enable row level security;

create policy "inventory_select_own" on public.inventory
  for select using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );
create policy "inventory_insert_own" on public.inventory
  for insert with check (
    character_id in (select id from public.characters where user_id = auth.uid())
  );
create policy "inventory_delete_own" on public.inventory
  for delete using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

-- =============================================
-- 4. Royalties Ledger
-- =============================================
create table if not exists public.royalties (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  album_name text not null,
  anointing_at_recording integer not null,
  daily_payout numeric(10, 2) not null default 0.00,
  decay_rate numeric(6, 4) not null default 0.02,
  total_earned numeric(12, 2) not null default 0.00,
  created_at timestamptz not null default now()
);

alter table public.royalties enable row level security;

create policy "royalties_select_own" on public.royalties
  for select using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );
create policy "royalties_insert_own" on public.royalties
  for insert with check (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

-- =============================================
-- 5. Activity Log
-- =============================================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  action_type text not null,
  description text not null,
  energy_change integer default 0,
  anointing_change integer default 0,
  funds_change numeric(10, 2) default 0.00,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "activity_log_select_own" on public.activity_log
  for select using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );
create policy "activity_log_insert_own" on public.activity_log
  for insert with check (
    character_id in (select id from public.characters where user_id = auth.uid())
  );
