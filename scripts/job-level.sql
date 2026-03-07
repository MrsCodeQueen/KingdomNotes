alter table public.characters add column if not exists job_experience integer default 0;
alter table public.characters add column if not exists job_level integer default 1;