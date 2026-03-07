-- Story Progression table: tracks which chapters a character has completed
CREATE TABLE IF NOT EXISTS story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  chapter_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked', -- locked, available, active, completed
  choice_made TEXT DEFAULT NULL, -- stores which choice the player made
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(character_id, chapter_key)
);

-- Add RLS policies
ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'story_progress_user_select' AND tablename = 'story_progress'
  ) THEN
    CREATE POLICY story_progress_user_select ON story_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'story_progress_user_insert' AND tablename = 'story_progress'
  ) THEN
    CREATE POLICY story_progress_user_insert ON story_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'story_progress_user_update' AND tablename = 'story_progress'
  ) THEN
    CREATE POLICY story_progress_user_update ON story_progress FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
