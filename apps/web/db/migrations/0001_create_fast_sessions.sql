-- Create table to persist fasting sessions
CREATE TABLE IF NOT EXISTS fast_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
  required_game_minutes INTEGER NOT NULL,
  anointing_boost INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Optional index for queries
CREATE INDEX IF NOT EXISTS idx_fast_sessions_user_id ON fast_sessions (user_id);
