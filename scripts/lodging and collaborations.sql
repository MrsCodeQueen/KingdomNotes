{
  "project_id": "dwmvbowpdhfktkbwpzys",
  "name": "add_lodgings_and_housing",
  "query": "
-- Create lodgings table if it doesn't exist
CREATE TABLE IF NOT EXISTS lodgings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  daily_rent INT NOT NULL DEFAULT 0,
  energy_regen_bonus INT NOT NULL DEFAULT 0,
  anointing_bonus INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add current_lodging column to characters
ALTER TABLE characters ADD COLUMN IF NOT EXISTS current_lodging UUID DEFAULT NULL;

-- Seed default lodgings for each region (only if empty)
INSERT INTO lodgings (region, name, daily_rent, energy_regen_bonus, anointing_bonus, description)
SELECT * FROM (VALUES
  ('na', 'Church Shelter', 0, 5, 1, 'A humble place of rest by grace.'),
  ('na', 'Motel Room', 15, 15, 0, 'A basic room with hot water.'),
  ('na', 'Ministry House', 35, 25, 3, 'Shared housing with fellow believers.'),
  ('na', 'Artist Loft', 60, 35, 5, 'A creative space in the city.'),
  ('af', 'Village Hut', 0, 5, 3, 'Simple living close to the earth.'),
  ('af', 'Mission Compound', 20, 20, 5, 'A compound with prayer rooms.'),
  ('af', 'Pastor''s Guest House', 40, 30, 8, 'Warm hospitality and fellowship.'),
  ('eu', 'Hostel Bunk', 0, 5, 0, 'A shared dorm room. Basic but free.'),
  ('eu', 'Flatshare', 25, 15, 2, 'A cozy flat with roommates.'),
  ('eu', 'Cathedral Quarters', 50, 30, 6, 'Historic quarters near the cathedral.'),
  ('sa', 'Beach Hammock', 0, 5, 2, 'Sleep under the stars by the sea.'),
  ('sa', 'Community Center', 20, 15, 4, 'A lively center full of fellowship.'),
  ('sa', 'Revival House', 45, 30, 7, 'A house dedicated to worship retreats.')
) AS v(region, name, daily_rent, energy_regen_bonus, anointing_bonus, description)
WHERE NOT EXISTS (SELECT 1 FROM lodgings LIMIT 1);

-- Also create collaborations table for collab system
CREATE TABLE IF NOT EXISTS collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  sender_name TEXT DEFAULT '',
  project_name TEXT DEFAULT 'Collab Project',
  collab_type TEXT DEFAULT 'duet',
  progress INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
"
}