export interface Character {
  id: string
  user_id: string
  legal_name: string
  artist_name: string
  gender: string
  region: string
  energy: number
  anointing: number
  funds: number
  charisma: number
  integrity_stat: number
  leadership: number
  influence: number
  current_activity: string
  is_fasting: boolean
  fast_started_at: string | null
  fast_duration_minutes: number
  last_tick_at: string
  created_at: string
  xp: number
  level: number
  last_daily_login: string | null
  daily_streak: number
  last_royalty_claim: string | null
  last_offering_claim: string | null
  followers: number
  favor: number
}

export interface DailyChallenge {
  id: string
  character_id: string
  user_id: string
  challenge_key: string
  challenge_date: string
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface CharacterSkill {
  id: string
  character_id: string
  user_id: string
  skill_key: string
  skill_level: number
  xp_in_skill: number
  times_trained: number
  last_trained_at: string | null
  created_at: string
}

export interface Buff {
  id: string
  character_id: string
  user_id: string
  buff_type: string
  stat_affected: string
  bonus: number
  expires_at: string
  created_at: string
}

export interface InventoryItem {
  id: string
  character_id: string
  user_id: string
  item_type: string
  item_name: string
  stat_bonus: Record<string, number>
  equipped: boolean
  purchased_at: string
}

export interface ShopItem {
  id: string
  item_name: string
  item_type: string
  description: string
  price: number
  stat_bonus: Record<string, number>
  level_required: number
}

export interface Song {
  id: string
  character_id: string
  user_id: string
  title: string
  quality: "mediocre" | "good" | "great" | "masterpiece"
  recorded: boolean
  tags: string[]
  created_at: string
}

export interface Achievement {
  id: string
  character_id: string
  user_id: string
  achievement_key: string
  unlocked_at: string
}

export interface Royalty {
  id: string
  character_id: string
  user_id: string
  song_name: string
  income_per_tick: number
  total_earned: number
  created_at: string
}

export interface ActivityLogEntry {
  id: string
  character_id: string
  user_id: string
  action_type: string
  result_text: string
  stat_changes: Record<string, number>
  created_at: string
}

export interface StoryProgress {
  id: string
  character_id: string
  user_id: string
  chapter_key: string
  status: "locked" | "available" | "active" | "completed"
  choice_made: string | null
  completed_at: string | null
  created_at: string
}

export interface RandomEventResult {
  event_id: string
  text: string
  effects: Record<string, number>
}

export interface TemptationEvent {
  id: string
  text: string
  yield_label: string // e.g., "Sign the secular contract"
  yield_description: string // e.g., "Gain $500 immediately, but lose 20 Anointing."
  yieldReward: Record<string, number>
  yieldPenalty: Record<string, number>
  resist_label: string // e.g., "Wait for God's timing"
  resistReward: Record<string, number>
}
