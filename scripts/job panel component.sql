-- 1. Create Lodgings Table (Real Estate)
create table if not exists public.lodgings (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  name text not null,
  type text not null check (type in ('nomadic', 'boarding', 'hotel', 'sanctuary')),
  daily_rent numeric(12, 2) default 0.00,
  energy_regen_bonus integer default 0,
  anointing_bonus integer default 0,
  description text,
  created_at timestamptz not null default now()
);

-- 2. Update Characters Table Structure
-- Note: If columns already exist, this will safely skip or you can run them individually
alter table public.characters add column if not exists last_work_at timestamptz;
alter table public.characters add column if not exists current_job_id text default 'unemployed';
alter table public.characters add column if not exists current_lodging_id uuid references public.lodgings(id);

-- 3. Seed Realistic Lodging Data (Removing Church Pews)
-- This provides the "In-Between" options you requested
insert into public.lodgings (region, name, type, daily_rent, energy_regen_bonus, anointing_bonus, description)
values 
('na', 'Community Shelter', 'nomadic', 0.00, 8, 2, 'Safe, shared space provided by local outreach.'),
('na', 'Studio Apartment (Inkster)', 'boarding', 120.00, 25, 5, 'Your own space. Provides stability for your ministry.'),
('na', 'High-Rise Loft (Detroit)', 'hotel', 250.00, 35, 10, 'Professional living with a view. Great for rest.'),
('af', 'Believers Hospitality', 'boarding', 0.00, 15, 10, 'A room offered by a local family. Rely on God for your needs.'),
('af', 'Shared Music House', 'boarding', 40.00, 20, 15, 'Creative living with other artists.'),
('sa', 'Missionary Base', 'sanctuary', 100.00, 40, 25, 'Private sanctuary for deep prayer.');