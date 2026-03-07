-- Track which songs belong to which album
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references public.characters(id),
  title text not null,
  overall_quality integer,
  release_date timestamptz default now()
);

-- Update the songs table to link to an album
alter table public.songs add column if not exists album_id uuid references public.albums(id);