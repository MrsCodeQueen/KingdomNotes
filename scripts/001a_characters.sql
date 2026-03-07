create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legal_name text not null,
  artist_name text not null,
  gender text not null,
  region text not null default 'north_america',
  energy integer not null default 100,
  anointing integer not null default 20,
  funds numeric(12, 2) not null default 50.00,
  charisma integer not null default 5,
  integrity_stat integer not null default 10,
  leadership integer not null default 1,
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
