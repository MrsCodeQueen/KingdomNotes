-- Safe schema: all CREATE IF NOT EXISTS, never drops existing tables/data

CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  legal_name TEXT NOT NULL DEFAULT 'Unknown',
  artist_name TEXT NOT NULL DEFAULT 'Unknown',
  gender TEXT NOT NULL DEFAULT 'male',
  region TEXT NOT NULL DEFAULT 'north_america',
  energy INT NOT NULL DEFAULT 100,
  anointing INT NOT NULL DEFAULT 10,
  funds NUMERIC(12,2) NOT NULL DEFAULT 20.00,
  charisma INT NOT NULL DEFAULT 5,
  integrity_stat INT NOT NULL DEFAULT 50,
  leadership INT NOT NULL DEFAULT 1,
  influence INT NOT NULL DEFAULT 0,
  current_activity TEXT DEFAULT NULL,
  is_fasting BOOLEAN NOT NULL DEFAULT FALSE,
  fast_started_at TIMESTAMPTZ DEFAULT NULL,
  fast_duration_minutes INT NOT NULL DEFAULT 0,
  last_tick_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  last_daily_login DATE DEFAULT NULL,
  daily_streak INT NOT NULL DEFAULT 0,
  UNIQUE(user_id)
);
