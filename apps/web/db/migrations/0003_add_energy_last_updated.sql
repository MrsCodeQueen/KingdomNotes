-- Add column to track when energy was last updated
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS energy_last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();
