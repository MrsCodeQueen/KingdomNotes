-- Add columns to fast_sessions to track accumulated game minutes and speed metadata
ALTER TABLE IF EXISTS fast_sessions
  ADD COLUMN IF NOT EXISTS accumulated_game_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_speed_factor INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_update_ts TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create table to store per-user time state (current speed)
CREATE TABLE IF NOT EXISTS user_time_state (
  user_id INTEGER PRIMARY KEY,
  user_email TEXT NOT NULL,
  current_speed INTEGER NOT NULL DEFAULT 1,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_time_state_user_id ON user_time_state (user_id);
