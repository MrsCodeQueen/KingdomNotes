-- Track fellowship bonds
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  player_a uuid references public.characters(id),
  player_b uuid references public.characters(id),
  bond_level integer default 1,
  bond_xp integer default 0,
  bond_type text default 'Acquaintance', -- Acquaintance, Friend, Covenant Partner
  last_interaction timestamptz default now(),
  unique(player_a, player_b)
);

-- Add social stat to characters
alter table public.characters add column if not exists social_stat integer default 0;