export type ActivityKey =
  | "busking"
  | "worship"
  | "soaking"
  | "scripture"
  | "nap"
  | "songwriting"
  | "jam_session"
  | "recording"
  | "teach_class"
  | "mentor"
  | "conference"
  | "church_service"
  | "bible_study"
  | "choir_rehearsal"
  | "praise_team"
  | "testimony"
  | "youth_revival"
  | "live_album"
  | "street_performance"
  | "church_concert"
  | "venue_concert"
  | "multi_city_tour"
  | "lead_worship_team"
  | "organize_outreach"
  | "train_musicians"
  | "elder_meeting"
  | "plant_ministry";

export interface Activity {
  label: string;
  description: string;
  energyCost: number;
  anointingGain: number;
  xpGain: number;
  fundsCost?: number;
  influenceRequirement?: number;
  charismaRequirement?: number;
  leadershipRequirement?: number;
}

export const ACTIVITIES: Record<ActivityKey, Activity> = {
  nap: { label: "Take a Nap", description: "Rest your body for a quick energy boost.", energyCost: -20, anointingGain: 2, xpGain: 5 },
  worship: { label: "Private Worship", description: "Deepen your connection. High anointing gain.", energyCost: -10, anointingGain: 15, xpGain: 10 },
  soaking: { label: "Soaking Music", description: "Rest in the atmosphere.", energyCost: -15, anointingGain: 8, xpGain: 8 },
  scripture: { label: "Read the Word", description: "Build your foundation. Boosts stats.", energyCost: 5, anointingGain: 10, xpGain: 15 },
  busking: { label: "Street Busking", description: "Perform for startup funds.", energyCost: 15, anointingGain: 2, xpGain: 10 },
  songwriting: { label: "Write a Song", description: "Draft new lyrics.", energyCost: 20, anointingGain: 5, xpGain: 20 },
  jam_session: { label: "Jam Session", description: "Collab with others.", energyCost: 25, anointingGain: 3, xpGain: 25 },
  recording: { label: "Record Album", description: "Requires $25.", energyCost: 40, anointingGain: 10, xpGain: 50, fundsCost: 25 },
  teach_class: { label: "Teach Sunday School", description: "Build local influence.", energyCost: 20, anointingGain: 5, xpGain: 30, influenceRequirement: 2, charismaRequirement: 15 },
  mentor: { label: "Mentor Artist", description: "Boost global influence.", energyCost: 30, anointingGain: 2, xpGain: 40, influenceRequirement: 5, leadershipRequirement: 3 },
  conference: { label: "Host Conference", description: "Massive influence. High drain.", energyCost: 80, anointingGain: -10, xpGain: 150, fundsCost: 100, leadershipRequirement: 10, influenceRequirement: 20 },
  church_service: { label: "Attend Church Service", description: "Worship with the body. Restores spirit.", energyCost: 10, anointingGain: 10, xpGain: 15 },
  bible_study: { label: "Lead Bible Study", description: "Teach the Word to a small group.", energyCost: 15, anointingGain: 8, xpGain: 20, leadershipRequirement: 2 },
  choir_rehearsal: { label: "Choir Rehearsal", description: "Practice harmonies with the choir.", energyCost: 20, anointingGain: 5, xpGain: 15 },
  praise_team: { label: "Praise Team Practice", description: "Tighten up with your worship team.", energyCost: 20, anointingGain: 6, xpGain: 20 },
  testimony: { label: "Share Testimony", description: "Tell your story to bless others.", energyCost: 10, anointingGain: 8, xpGain: 25, charismaRequirement: 10 },
  youth_revival: { label: "Youth Revival", description: "Lead an energetic youth service.", energyCost: 35, anointingGain: 12, xpGain: 40, leadershipRequirement: 5, charismaRequirement: 15 },
  live_album: { label: "Live Album Recording", description: "Record a live worship album. High risk, high reward.", energyCost: 50, anointingGain: 15, xpGain: 80, fundsCost: 75, charismaRequirement: 25 },
  // Performance Actions
  street_performance: { label: "Street Performance", description: "Sing on the corner. Small but honest work.", energyCost: 10, anointingGain: 3, xpGain: 12 },
  church_concert: { label: "Church Service Concert", description: "Lead worship at a local church. Build your reputation.", energyCost: 20, anointingGain: 8, xpGain: 25 },
  venue_concert: { label: "Venue Concert", description: "Headline a venue. Requires Charisma 20 and $50.", energyCost: 40, anointingGain: 10, xpGain: 60, fundsCost: 50, charismaRequirement: 20 },
  multi_city_tour: { label: "Multi-City Tour", description: "Major tour. Massive earnings. Requires Charisma 40, Leadership 10, $200.", energyCost: 80, anointingGain: 15, xpGain: 120, fundsCost: 200, charismaRequirement: 40, leadershipRequirement: 10 },
  // Leadership Building Activities
  lead_worship_team: { label: "Lead Worship Team", description: "Direct rehearsal and guide your team. Builds leadership.", energyCost: 25, anointingGain: 5, xpGain: 35, leadershipRequirement: 5 },
  organize_outreach: { label: "Organize Outreach", description: "Plan and execute a community outreach event.", energyCost: 35, anointingGain: 8, xpGain: 45, fundsCost: 25, leadershipRequirement: 8, charismaRequirement: 15 },
  train_musicians: { label: "Train Musicians", description: "Mentor young musicians in your ministry.", energyCost: 30, anointingGain: 4, xpGain: 40, leadershipRequirement: 12 },
  elder_meeting: { label: "Elder Meeting", description: "Attend leadership meetings to grow in wisdom.", energyCost: 20, anointingGain: 3, xpGain: 30, leadershipRequirement: 15, charismaRequirement: 20 },
  plant_ministry: { label: "Plant Ministry", description: "Start a new ministry branch. Major leadership milestone.", energyCost: 60, anointingGain: 10, xpGain: 100, fundsCost: 150, leadershipRequirement: 25, charismaRequirement: 30 },
};

export const REGIONS = [
  {
    id: "na",
    name: "North America",
    description: "The industry hub. High royalties, but intense competition.",
    costOfLiving: 1.5,
    spiritualHunger: 1.0,
    travelCost: 150,
    specialty: "Mega-Conferences",
    localActivities: [
      { name: "Nashville Open Mic", stat: "charisma", boost: 3, funds: 20 },
      { name: "Gospel Radio Interview", stat: "influence", boost: 5, funds: 0 },
      { name: "Megachurch Guest Worship", stat: "anointing", boost: 4, funds: 30 },
    ],
  },
  {
    id: "af",
    name: "Africa",
    description: "The fire center. Anointing grows 1.5x faster here.",
    costOfLiving: 0.8,
    spiritualHunger: 1.5,
    travelCost: 200,
    specialty: "High Anointing",
    localActivities: [
      { name: "Village Crusade", stat: "anointing", boost: 8, funds: 5 },
      { name: "Drum Circle Prayer", stat: "anointing", boost: 5, funds: 0 },
      { name: "Mission School Concert", stat: "integrity", boost: 4, funds: 10 },
    ],
  },
  {
    id: "eu",
    name: "Europe",
    description: "The indie scene. Focus on deep integrity.",
    costOfLiving: 1.2,
    spiritualHunger: 0.9,
    travelCost: 180,
    specialty: "Integrity Builds",
    localActivities: [
      { name: "Cathedral Acoustic Set", stat: "integrity", boost: 5, funds: 15 },
      { name: "Underground Worship Night", stat: "charisma", boost: 4, funds: 10 },
      { name: "Theology Lecture Series", stat: "leadership", boost: 4, funds: 25 },
    ],
  },
  {
    id: "sa",
    name: "South America",
    description: "The celebration hub. High charisma boosts.",
    costOfLiving: 1.0,
    spiritualHunger: 1.2,
    travelCost: 160,
    specialty: "Charisma Bonus",
    localActivities: [
      { name: "Carnival Worship Parade", stat: "charisma", boost: 6, funds: 15 },
      { name: "Favela Outreach Concert", stat: "integrity", boost: 5, funds: 5 },
      { name: "Beach Revival Service", stat: "anointing", boost: 5, funds: 20 },
    ],
  },
] as const;

export const FASTING_DURATIONS = [
  { label: "30 Min Fast", minutes: 30, energyDrain: 10, anointingBonus: 15 },
  { label: "1 Hour Fast", minutes: 60, energyDrain: 25, anointingBonus: 35 },
  { label: "3 Hour Fast", minutes: 180, energyDrain: 50, anointingBonus: 75 },
  { label: "6 Hour Fast", minutes: 360, energyDrain: 90, anointingBonus: 150 },
];

export function getRegion(id: string) {
  return REGIONS.find(r => r.id === id) || REGIONS[0];
}

export function getLevelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const xpInCurrentLevel = xp - (Math.pow(level - 1, 2) * 100);
  const xpNeededForNextLevel = (Math.pow(level, 2) * 100) - (Math.pow(level - 1, 2) * 100);
  return { level, currentXp: xpInCurrentLevel, xpNeeded: xpNeededForNextLevel };
}

// Local jobs for the Marketplace
export const LOCAL_JOBS = [
  { id: "barista", title: "Local Barista", pay: 25, energy: 35, req: "none" as const, val: 0 },
  { id: "office", title: "Admin Assistant", pay: 60, energy: 45, req: "leadership" as const, val: 10 },
  { id: "tutor", title: "Music Tutor", pay: 110, energy: 30, req: "charisma" as const, val: 20 },
] as const

// University classes for stat growth
export const UNIVERSITY_CLASSES = [
  { id: "vocal_101", name: "Vocal Training", cost: 100, stat: "charisma" as const, boost: 5 },
  { id: "theo_101", name: "Biblical Foundations", cost: 150, stat: "anointing" as const, boost: 8 },
  { id: "biz_101", name: "Music Business", cost: 200, stat: "leadership" as const, boost: 5 },
  { id: "comm_101", name: "Public Fellowship", cost: 120, stat: "charisma" as const, boost: 10 },
] as const

// ========== CHARACTER SKILLS (Popmundo-style) ==========
// Skills are trained through activities and level from 0.00 to 100.00
// Each activity trains 1-3 skills. XP needed per level increases as skill grows.

export interface SkillDef {
  key: string
  name: string
  category: "music" | "ministry" | "business" | "spiritual"
  description: string
  icon: string // lucide icon name
  maxLevel: number
}

export const CHARACTER_SKILLS: SkillDef[] = [
  // Music Skills
  { key: "vocals", name: "Vocals", category: "music", description: "Singing ability, tone control, and vocal range.", icon: "mic", maxLevel: 100 },
  { key: "songwriting", name: "Songwriting", category: "music", description: "Lyric writing, melody creation, and arrangement.", icon: "pen-line", maxLevel: 100 },
  { key: "instrument", name: "Instrument", category: "music", description: "Proficiency with your primary instrument.", icon: "guitar", maxLevel: 100 },
  { key: "production", name: "Production", category: "music", description: "Studio recording, mixing, and mastering.", icon: "sliders-horizontal", maxLevel: 100 },
  { key: "performance", name: "Stage Presence", category: "music", description: "Commanding the stage and engaging the crowd.", icon: "sparkles", maxLevel: 100 },

  // Ministry Skills
  { key: "preaching", name: "Preaching", category: "ministry", description: "Delivering the Word with power and clarity.", icon: "book-open", maxLevel: 100 },
  { key: "worship_leading", name: "Worship Leading", category: "ministry", description: "Guiding a congregation into God's presence.", icon: "music", maxLevel: 100 },
  { key: "prayer", name: "Intercessory Prayer", category: "ministry", description: "Deep prayer life and spiritual warfare.", icon: "flame", maxLevel: 100 },
  { key: "testimony", name: "Testimony", category: "ministry", description: "Sharing your story to inspire others.", icon: "message-square", maxLevel: 100 },
  { key: "discipleship", name: "Discipleship", category: "ministry", description: "Mentoring and raising up new believers.", icon: "users", maxLevel: 100 },

  // Business Skills
  { key: "networking", name: "Networking", category: "business", description: "Building industry connections and partnerships.", icon: "handshake", maxLevel: 100 },
  { key: "marketing", name: "Marketing", category: "business", description: "Promoting your music and brand.", icon: "megaphone", maxLevel: 100 },
  { key: "finance", name: "Finance", category: "business", description: "Managing money, budgeting, and investments.", icon: "dollar-sign", maxLevel: 100 },

  // Spiritual Skills
  { key: "fasting", name: "Fasting", category: "spiritual", description: "Endurance in fasting and spiritual discipline.", icon: "moon", maxLevel: 100 },
  { key: "scripture_knowledge", name: "Scripture Knowledge", category: "spiritual", description: "Deep understanding of the Bible.", icon: "book-open", maxLevel: 100 },
]

// XP required to reach a given skill level (exponential curve)
export function skillXpForLevel(level: number): number {
  // Level 1 = 50xp, Level 10 = 500xp, Level 50 = 5000xp, Level 100 = 20000xp
  return Math.floor(50 * level + 2 * Math.pow(level, 1.5))
}

// Calculate skill level from total XP in that skill
export function skillLevelFromXp(xp: number): { level: number; currentXp: number; xpNeeded: number } {
  let level = 0
  let totalRequired = 0
  while (level < 100) {
    const needed = skillXpForLevel(level + 1)
    if (totalRequired + needed > xp) {
      return { level, currentXp: xp - totalRequired, xpNeeded: needed }
    }
    totalRequired += needed
    level++
  }
  return { level: 100, currentXp: 0, xpNeeded: 0 }
}

// Which skills each activity trains and how much XP they grant
export const ACTIVITY_SKILL_GAINS: Partial<Record<ActivityKey, { skill: string; xp: number }[]>> = {
  songwriting:     [{ skill: "songwriting", xp: 25 }, { skill: "instrument", xp: 10 }],
  worship:         [{ skill: "worship_leading", xp: 15 }, { skill: "prayer", xp: 20 }],
  soaking:         [{ skill: "prayer", xp: 15 }, { skill: "worship_leading", xp: 8 }],
  scripture:       [{ skill: "scripture_knowledge", xp: 25 }, { skill: "preaching", xp: 10 }],
  busking:         [{ skill: "performance", xp: 20 }, { skill: "vocals", xp: 15 }, { skill: "networking", xp: 5 }],
  jam_session:     [{ skill: "instrument", xp: 20 }, { skill: "performance", xp: 15 }, { skill: "networking", xp: 10 }],
  recording:       [{ skill: "production", xp: 30 }, { skill: "vocals", xp: 15 }],
  teach_class:     [{ skill: "preaching", xp: 20 }, { skill: "discipleship", xp: 15 }],
  mentor:          [{ skill: "discipleship", xp: 25 }, { skill: "preaching", xp: 10 }],
  conference:      [{ skill: "networking", xp: 30 }, { skill: "marketing", xp: 20 }, { skill: "finance", xp: 10 }],
  church_service:  [{ skill: "worship_leading", xp: 20 }, { skill: "prayer", xp: 10 }, { skill: "scripture_knowledge", xp: 5 }],
  bible_study:     [{ skill: "scripture_knowledge", xp: 20 }, { skill: "preaching", xp: 15 }, { skill: "discipleship", xp: 10 }],
  choir_rehearsal: [{ skill: "vocals", xp: 25 }, { skill: "worship_leading", xp: 10 }],
  praise_team:     [{ skill: "worship_leading", xp: 20 }, { skill: "performance", xp: 15 }, { skill: "vocals", xp: 10 }],
  testimony:       [{ skill: "testimony", xp: 30 }, { skill: "preaching", xp: 10 }],
  youth_revival:   [{ skill: "worship_leading", xp: 20 }, { skill: "performance", xp: 20 }, { skill: "discipleship", xp: 15 }],
  live_album:      [{ skill: "production", xp: 25 }, { skill: "performance", xp: 25 }, { skill: "vocals", xp: 15 }],
  nap:             [],
  // Leadership Activities
  lead_worship_team: [{ skill: "worship_leading", xp: 25 }, { skill: "discipleship", xp: 20 }, { skill: "networking", xp: 10 }],
  organize_outreach: [{ skill: "networking", xp: 25 }, { skill: "discipleship", xp: 20 }, { skill: "marketing", xp: 15 }],
  train_musicians:   [{ skill: "discipleship", xp: 30 }, { skill: "worship_leading", xp: 15 }, { skill: "preaching", xp: 10 }],
  elder_meeting:     [{ skill: "networking", xp: 20 }, { skill: "scripture_knowledge", xp: 15 }, { skill: "discipleship", xp: 15 }],
  plant_ministry:    [{ skill: "discipleship", xp: 40 }, { skill: "networking", xp: 30 }, { skill: "marketing", xp: 25 }, { skill: "finance", xp: 20 }],
}

// Achievement definitions
export const ACHIEVEMENTS = {
  first_song: { title: "Street Psalmist", description: "Write your first song", icon: "pen" },
  ten_songs: { title: "Prolific Writer", description: "Write 10 songs", icon: "pen" },
  first_recording: { title: "Studio Debut", description: "Record your first album", icon: "mic" },
  five_recordings: { title: "Catalog Builder", description: "Record 5 albums", icon: "mic" },
  first_masterpiece: { title: "Touched by Fire", description: "Write a masterpiece-quality song", icon: "flame" },
  first_conference: { title: "Worship Leader", description: "Host your first conference", icon: "users" },
  reach_level_5: { title: "Rising Star", description: "Reach Level 5", icon: "star" },
  reach_level_10: { title: "Gospel Veteran", description: "Reach Level 10", icon: "star" },
  reach_level_20: { title: "Anointed One", description: "Reach Level 20", icon: "crown" },
  first_fast: { title: "Consecrated", description: "Complete your first fast", icon: "flame" },
  integrity_50: { title: "Pillar of Faith", description: "Reach 50 Integrity", icon: "shield" },
  charisma_50: { title: "Crowd Favorite", description: "Reach 50 Charisma", icon: "sparkles" },
  anointing_80: { title: "Fire of God", description: "Reach 80 Anointing", icon: "flame" },
  leadership_25: { title: "Shepherd", description: "Reach 25 Leadership", icon: "graduation" },
  influence_100: { title: "Regional Voice", description: "Reach 100 Influence", icon: "globe" },
  influence_500: { title: "National Treasure", description: "Reach 500 Influence", icon: "globe" },
  funds_1000: { title: "Blessed Finances", description: "Accumulate $1,000", icon: "dollar" },
  seven_day_streak: { title: "Faithful Servant", description: "Log in 7 days in a row", icon: "calendar" },
  travel_all: { title: "World Missionary", description: "Visit all regions", icon: "globe" },
  resist_temptation: { title: "Overcomer", description: "Resist your first temptation", icon: "shield" },
  // Skill milestones
  vocals_25: { title: "Golden Voice", description: "Reach Vocals skill level 25", icon: "mic" },
  vocals_50: { title: "Psalmist", description: "Reach Vocals skill level 50", icon: "mic" },
  songwriting_25: { title: "Hymn Writer", description: "Reach Songwriting skill level 25", icon: "pen" },
  songwriting_50: { title: "Psalm Composer", description: "Reach Songwriting skill level 50", icon: "pen" },
  worship_leading_25: { title: "Levite", description: "Reach Worship Leading skill level 25", icon: "music" },
  worship_leading_50: { title: "Chief Musician", description: "Reach Worship Leading skill level 50", icon: "music" },
  prayer_25: { title: "Prayer Warrior", description: "Reach Intercessory Prayer level 25", icon: "flame" },
  preaching_25: { title: "The Preacher", description: "Reach Preaching skill level 25", icon: "book" },
  production_25: { title: "Sound Engineer", description: "Reach Production skill level 25", icon: "sliders" },
  networking_25: { title: "Connected", description: "Reach Networking skill level 25", icon: "users" },
  first_album: { title: "Album Drop", description: "Record your first album", icon: "disc" },
  five_albums: { title: "Discography", description: "Record 5 albums", icon: "disc" },
  fifty_songs: { title: "Song Machine", description: "Write 50 songs", icon: "pen" },
  max_stat: { title: "Mastery", description: "Reach 100 in any base stat", icon: "crown" },
  all_skills_10: { title: "Jack of All Trades", description: "Get all skills to level 10+", icon: "sparkles" },
  reach_level_30: { title: "Kingdom Builder", description: "Reach Level 30", icon: "crown" },
  reach_level_50: { title: "Living Legend", description: "Reach Level 50", icon: "crown" },
  influence_1000: { title: "Global Icon", description: "Reach 1000 Influence", icon: "globe" },
  funds_10000: { title: "Prosperous", description: "Accumulate $10,000", icon: "dollar" },
} as const

export type AchievementKey = keyof typeof ACHIEVEMENTS

// Random events that can trigger after any action
export const RANDOM_EVENTS = [
  // Positive opportunities
  { id: "producer_notice", chance: 0.06, text: "A music producer noticed your talent and wants to connect!", effects: { influence: 5, charisma: 2 } },
  { id: "church_invitation", chance: 0.06, text: "A local pastor invited you to perform at Sunday service!", effects: { influence: 3, anointing: 3 } },
  { id: "fan_encounter", chance: 0.05, text: "A fan recognized you and asked for your autograph!", effects: { charisma: 2, influence: 2 } },
  { id: "surprise_offering", chance: 0.04, text: "An anonymous donor left a generous offering for your ministry.", effects: { funds: 25 } },
  { id: "prayer_warrior", chance: 0.05, text: "An elder prayed over you and you felt renewed strength.", effects: { energy: 15, anointing: 3 } },
  { id: "viral_moment", chance: 0.02, text: "Someone filmed your performance and it went viral online!", effects: { influence: 15, charisma: 5 } },
  { id: "mentor_appears", chance: 0.03, text: "A seasoned worship leader offered you personal guidance.", effects: { leadership: 3, integrity: 2 } },
  { id: "divine_inspiration", chance: 0.04, text: "You felt a wave of divine inspiration wash over you.", effects: { anointing: 8 } },
  { id: "rain_delay", chance: 0.03, text: "Heavy rain forced you to cut your session short.", effects: { energy: 10 } },
  // New major opportunities
  { id: "radio_interview", chance: 0.04, text: "A local gospel radio station wants to interview you on air!", effects: { influence: 8, charisma: 3 } },
  { id: "radio_play", chance: 0.03, text: "Your song is getting played on gospel radio! Streams are climbing.", effects: { influence: 10, funds: 15 } },
  { id: "youth_revival_invite", chance: 0.04, text: "A youth pastor wants you to lead worship at their revival!", effects: { influence: 5, anointing: 5, leadership: 2 } },
  { id: "testimony_request", chance: 0.05, text: "A ministry magazine asked you to share your testimony.", effects: { influence: 4, integrity: 3 } },
  { id: "live_album_offer", chance: 0.02, text: "A label wants to fund a live album recording session!", effects: { funds: 50, influence: 5 } },
  { id: "streaming_spike", chance: 0.04, text: "Your songs are trending on streaming platforms! Royalties incoming.", effects: { funds: 20, influence: 3 } },
  { id: "choir_invite", chance: 0.05, text: "A community choir invited you to collaborate on a special performance.", effects: { charisma: 3, anointing: 2 } },
  { id: "conference_speaker", chance: 0.02, text: "You were asked to be a keynote speaker at a worship conference!", effects: { influence: 12, leadership: 4 } },
  { id: "worship_night", chance: 0.04, text: "A spontaneous worship night broke out after your set. God moved!", effects: { anointing: 10, influence: 5 } },
  { id: "missionary_connection", chance: 0.03, text: "A missionary heard your music and wants to take it overseas.", effects: { influence: 7, integrity: 2 } },
  // Setbacks (including fan-favorite stolen tips)
  { id: "stolen_tips", chance: 0.035, text: "Someone swiped your tip jar when you weren't looking! Lord, forgive them.", effects: { funds: -18 } },
  { id: "guitar_string_broke", chance: 0.04, text: "Your guitar string snapped mid-performance.", effects: { funds: -10 } },
  { id: "equipment_malfunction", chance: 0.03, text: "Your equipment malfunctioned and needs repair.", effects: { funds: -20 } },
  { id: "voice_strain", chance: 0.03, text: "You strained your voice during an intense worship set.", effects: { energy: -10, charisma: -2 } },
  { id: "bad_review", chance: 0.02, text: "A critic wrote a harsh review of your latest performance.", effects: { charisma: -3, influence: -2 } },
  { id: "flat_tire", chance: 0.03, text: "Got a flat tire on the way to a gig. Had to pay for a tow.", effects: { funds: -25, energy: -5 } },
] as const

// Temptation events - choices that test integrity
export const TEMPTATIONS = [
  {
    id: "secular_deal",
    text: "A secular label offers you a big contract, but you must water down your message.",
    yieldReward: { funds: 200, influence: 10 },
    yieldPenalty: { anointing: -15, integrity: -10 },
    resistReward: { integrity: 5, anointing: 5 },
  },
  {
    id: "skip_tithe",
    text: "You're low on funds. The temptation to skip your tithe this week is strong.",
    yieldReward: { funds: 30 },
    yieldPenalty: { anointing: -8, integrity: -5 },
    resistReward: { integrity: 3, anointing: 3 },
  },
  {
    id: "gossip",
    text: "A journalist offers to pay you for gossip about a fellow worship leader.",
    yieldReward: { funds: 50 },
    yieldPenalty: { integrity: -12, leadership: -3 },
    resistReward: { integrity: 5, leadership: 2 },
  },
  {
    id: "pride",
    text: "After a successful event, you're tempted to take all the credit instead of giving glory to God.",
    yieldReward: { charisma: 5, influence: 5 },
    yieldPenalty: { anointing: -10, integrity: -8 },
    resistReward: { anointing: 5, integrity: 4 },
  },
  {
    id: "shortcut",
    text: "You could use auto-tune and samples instead of genuine worship to speed up your recording.",
    yieldReward: { funds: 40 },
    yieldPenalty: { anointing: -10, charisma: -5 },
    resistReward: { integrity: 4, anointing: 3 },
  },
  {
    id: "false_testimony",
    text: "A promoter wants you to exaggerate your testimony for a bigger crowd.",
    yieldReward: { influence: 15 },
    yieldPenalty: { integrity: -15, anointing: -5 },
    resistReward: { integrity: 6, anointing: 2 },
  },
  {
    id: "stolen_song",
    text: "You hear another artist's melody in your head. You could 'borrow' it and no one would know.",
    yieldReward: { funds: 60, influence: 5 },
    yieldPenalty: { integrity: -20, anointing: -12 },
    resistReward: { integrity: 8, anointing: 4 },
  },
  {
    id: "envy",
    text: "A fellow worship leader just got a major record deal. Jealousy burns inside you.",
    yieldReward: { charisma: 3 },
    yieldPenalty: { integrity: -8, anointing: -10, leadership: -3 },
    resistReward: { integrity: 5, anointing: 6 },
  },
  {
    id: "burnout_shortcut",
    text: "You're exhausted. Someone offers you pills to 'keep the energy up' for tonight's set.",
    yieldReward: { energy: 30 },
    yieldPenalty: { integrity: -20, anointing: -15 },
    resistReward: { integrity: 8, anointing: 5 },
  },
  {
    id: "worldly_collab",
    text: "A secular rapper with millions of followers wants a feature, but the lyrics are questionable.",
    yieldReward: { influence: 30, funds: 100 },
    yieldPenalty: { integrity: -18, anointing: -12 },
    resistReward: { integrity: 7, anointing: 6 },
  },
  {
    id: "prosperity_preacher",
    text: "A prosperity preacher wants you on tour. Big money, but the theology is off.",
    yieldReward: { funds: 150, influence: 20 },
    yieldPenalty: { integrity: -25, anointing: -15 },
    resistReward: { integrity: 10, anointing: 8 },
  },
] as const

// ========== MINISTRY TITLES ==========
export const MINISTRY_TITLES = [
  { minLevel: 1, title: "Street Musician", color: "text-muted-foreground" },
  { minLevel: 3, title: "Choir Member", color: "text-foreground" },
  { minLevel: 5, title: "Worship Intern", color: "text-chart-2" },
  { minLevel: 8, title: "Praise Leader", color: "text-chart-1" },
  { minLevel: 12, title: "Music Minister", color: "text-primary" },
  { minLevel: 16, title: "Associate Pastor of Worship", color: "text-primary" },
  { minLevel: 20, title: "Worship Pastor", color: "text-primary" },
  { minLevel: 25, title: "Revivalist", color: "text-accent" },
  { minLevel: 30, title: "Gospel Ambassador", color: "text-accent" },
  { minLevel: 40, title: "Apostle of Worship", color: "text-primary" },
  { minLevel: 50, title: "Kingdom Legend", color: "text-primary" },
] as const

export function getMinistryTitle(level: number) {
  let title = MINISTRY_TITLES[0]
  for (const t of MINISTRY_TITLES) {
    if (level >= t.minLevel) title = t
  }
  return title
}

// ========== GOSPEL NEWS TICKER ==========
export const GOSPEL_NEWS = [
  "BREAKING: Local worship leader writes 100th song -- says 'God gets all the glory'",
  "TRENDING: Revival breaks out at small-town church, thousands flock to attend",
  "INDUSTRY: Gospel streaming up 40% this quarter, faith music on the rise",
  "SPOTLIGHT: Street musician discovered busking, signs with independent label",
  "TESTIMONY: Former secular artist finds Christ, pivots to worship music",
  "EVENT: Annual Kingdom Notes Conference returns with record attendance",
  "CHARTS: 'Still Waters' holds #1 spot for third consecutive week",
  "MINISTRY: Youth revival movement spreading across multiple regions",
  "COMMUNITY: Choir flash mob goes viral, 10M views in 24 hours",
  "MISSIONS: Worship teams deploy to 30 countries for global outreach",
  "AWARDS: Dove Awards nominations announced -- will your songs qualify?",
  "COLLAB: Two rival worship leaders reconcile, drop surprise duet album",
  "BREAKTHROUGH: Unsigned artist's live recording goes viral with 5M streams",
  "CULTURE: Street worship movement transforms downtown nightlife district",
] as const

export const SCRIPTURE_BANNERS = [
  { verse: "Psalm 150:6", text: "Let everything that has breath praise the Lord." },
  { verse: "Colossians 3:16", text: "Let the word of Christ dwell in you richly, singing psalms and hymns." },
  { verse: "Psalm 96:1", text: "Sing to the Lord a new song; sing to the Lord, all the earth." },
  { verse: "2 Chronicles 5:13", text: "The trumpeters and singers joined in unison, the glory of the Lord filled the temple." },
  { verse: "Psalm 33:3", text: "Sing to Him a new song; play skillfully, and shout for joy." },
  { verse: "Psalm 100:2", text: "Worship the Lord with gladness; come before Him with joyful songs." },
  { verse: "Isaiah 12:5", text: "Sing to the Lord, for He has done glorious things." },
  { verse: "Psalm 40:3", text: "He put a new song in my mouth, a hymn of praise to our God." },
  { verse: "Revelation 5:9", text: "And they sang a new song, saying: 'You are worthy...'" },
] as const

// ========== REGIONAL EVENTS (Rotating every 24hrs) ==========
export interface RegionalEvent {
  id: string
  name: string
  description: string
  region: string
  effects: {
    anointingMult?: number
    xpMult?: number
    fundsMult?: number
    energyDrainMult?: number
    streamMult?: number
    statBonus?: Partial<Record<string, number>>
  }
  duration: "2h" | "4h" | "8h" | "24h"
  rarity: "common" | "rare" | "epic"
  // Participation system
  participation: {
    energyCost: number
    fundsCost: number
    narrative: string  // Flavor text shown when joining
    rewards: {
      xp: number
      statGains: Record<string, number>
      buffType: string
      buffStat: string
      buffBonus: number
      buffDurationHours: number
    }
    successRate: number // 0-1, chance of getting full rewards vs partial
  }
}

export const REGIONAL_EVENTS: RegionalEvent[] = [
  // Africa
  { id: "af_revival", name: "Revival Outbreak", description: "The Spirit is moving! Anointing gains +25%.", region: "af", effects: { anointingMult: 1.25 }, duration: "4h", rarity: "common",
    participation: { energyCost: 12, fundsCost: 0, narrative: "You join the revival gathering. Hands are raised, voices cry out, and the atmosphere is electric with the presence of God.", rewards: { xp: 40, statGains: { anointing: 6 }, buffType: "Revival Fire", buffStat: "anointing", buffBonus: 10, buffDurationHours: 4 }, successRate: 0.85 } },
  { id: "af_fire_conf", name: "Fire Conference Surge", description: "Conference rewards doubled.", region: "af", effects: { fundsMult: 2.0, xpMult: 1.5 }, duration: "2h", rarity: "rare",
    participation: { energyCost: 18, fundsCost: 25, narrative: "You register for the Fire Conference. Thousands of worshippers from across the continent fill the arena. The speakers are powerful, and the worship team brings heaven down.", rewards: { xp: 70, statGains: { anointing: 5, charisma: 4, influence: 3 }, buffType: "Conference Anointing", buffStat: "anointing", buffBonus: 15, buffDurationHours: 6 }, successRate: 0.80 } },
  { id: "af_fasting_grace", name: "Fasting Grace", description: "Energy drain reduced 20%.", region: "af", effects: { energyDrainMult: 0.8 }, duration: "8h", rarity: "common",
    participation: { energyCost: 8, fundsCost: 0, narrative: "You join a communal fast with believers across the region. The collective sacrifice creates a covering of grace that sustains everyone.", rewards: { xp: 30, statGains: { anointing: 4, integrity_stat: 3 }, buffType: "Grace Covering", buffStat: "anointing", buffBonus: 8, buffDurationHours: 8 }, successRate: 0.90 } },
  { id: "af_crusade", name: "Village Crusade Wave", description: "Mass outreach boosts influence.", region: "af", effects: { statBonus: { influence: 5 } }, duration: "4h", rarity: "rare",
    participation: { energyCost: 20, fundsCost: 15, narrative: "You travel to a remote village to join the crusade. Under the open sky, you preach the gospel to hundreds who have never heard it. Some weep. Some dance. All are changed.", rewards: { xp: 65, statGains: { influence: 8, anointing: 3, leadership: 3 }, buffType: "Crusade Momentum", buffStat: "influence", buffBonus: 12, buffDurationHours: 5 }, successRate: 0.75 } },
  { id: "af_prayer_mountain", name: "Prayer Mountain Gathering", description: "Deep intercession. Anointing x1.5.", region: "af", effects: { anointingMult: 1.5 }, duration: "2h", rarity: "epic",
    participation: { energyCost: 25, fundsCost: 10, narrative: "You climb the prayer mountain before dawn. At the summit, dozens of intercessors are already on their knees. The air is thick with the glory of God. You fall to your face and encounter His presence like never before.", rewards: { xp: 100, statGains: { anointing: 12, integrity_stat: 5 }, buffType: "Mountain Glory", buffStat: "anointing", buffBonus: 20, buffDurationHours: 8 }, successRate: 0.70 } },
  // North America
  { id: "na_competition", name: "Industry Competition Spike", description: "Earnings +30%, burnout risk +15%.", region: "na", effects: { fundsMult: 1.3, energyDrainMult: 1.15 }, duration: "8h", rarity: "common",
    participation: { energyCost: 15, fundsCost: 30, narrative: "You enter the worship artist showcase competition. The judges are industry veterans. The stakes are high. You give everything you have on that stage.", rewards: { xp: 50, statGains: { charisma: 5, influence: 4 }, buffType: "Competitive Edge", buffStat: "charisma", buffBonus: 10, buffDurationHours: 4 }, successRate: 0.75 } },
  { id: "na_label_interest", name: "Label Interest", description: "Labels scouting. +8 influence per action.", region: "na", effects: { statBonus: { influence: 8 } }, duration: "4h", rarity: "rare",
    participation: { energyCost: 10, fundsCost: 50, narrative: "You attend a private listening party where label executives are scouting new talent. You perform an acoustic set of your best work. Eyes are watching. Pens are ready.", rewards: { xp: 60, statGains: { influence: 10, charisma: 3 }, buffType: "Industry Spotlight", buffStat: "influence", buffBonus: 15, buffDurationHours: 6 }, successRate: 0.70 } },
  { id: "na_media_scrutiny", name: "Media Scrutiny", description: "Press watching. Integrity tests frequent.", region: "na", effects: { statBonus: { integrity_stat: 3 } }, duration: "8h", rarity: "common",
    participation: { energyCost: 12, fundsCost: 0, narrative: "A reporter asks for an interview about your faith journey. Every word will be scrutinized. You choose honesty over optics, sharing your full testimony -- the good and the messy.", rewards: { xp: 45, statGains: { integrity_stat: 7, influence: 3 }, buffType: "Authentic Witness", buffStat: "integrity_stat", buffBonus: 10, buffDurationHours: 5 }, successRate: 0.80 } },
  { id: "na_nashville_week", name: "Nashville Music Week", description: "Double XP from all activities!", region: "na", effects: { xpMult: 2.0 }, duration: "24h", rarity: "epic",
    participation: { energyCost: 25, fundsCost: 75, narrative: "Nashville Music Week. The biggest gospel artists on earth are here. You attend masterclasses, network backstage, and perform at an open-mic that could change your career. The city hums with possibility.", rewards: { xp: 120, statGains: { charisma: 6, influence: 8, leadership: 4 }, buffType: "Nashville Anointing", buffStat: "charisma", buffBonus: 20, buffDurationHours: 10 }, successRate: 0.65 } },
  { id: "na_megachurch_tour", name: "Megachurch Tour Season", description: "Church and conference rewards boosted.", region: "na", effects: { fundsMult: 1.5, xpMult: 1.3 }, duration: "4h", rarity: "rare",
    participation: { energyCost: 18, fundsCost: 40, narrative: "You join a megachurch worship tour hitting five cities in one week. The crowds are massive. The production is world-class. And God moves powerfully despite the spectacle.", rewards: { xp: 75, statGains: { influence: 6, charisma: 5, anointing: 3 }, buffType: "Tour Momentum", buffStat: "influence", buffBonus: 12, buffDurationHours: 6 }, successRate: 0.75 } },
  // Europe
  { id: "eu_theology_debate", name: "Theological Debate Week", description: "Integrity gains boosted.", region: "eu", effects: { statBonus: { integrity_stat: 5 } }, duration: "24h", rarity: "common",
    participation: { energyCost: 10, fundsCost: 0, narrative: "You attend a theological forum at a historic seminary. Scholars challenge your understanding of worship theology. The debates are intense but sharpening.", rewards: { xp: 40, statGains: { integrity_stat: 6, leadership: 3 }, buffType: "Theological Clarity", buffStat: "integrity_stat", buffBonus: 10, buffDurationHours: 6 }, successRate: 0.85 } },
  { id: "eu_slow_growth", name: "Slow Growth Season", description: "XP reduced 15%, but deeper foundations.", region: "eu", effects: { xpMult: 0.85 }, duration: "8h", rarity: "common",
    participation: { energyCost: 8, fundsCost: 0, narrative: "You join a contemplative retreat in the countryside. No Wi-Fi, no social media. Just Scripture, silence, and the slow work of the Spirit. Growth here is invisible but deep.", rewards: { xp: 25, statGains: { anointing: 5, integrity_stat: 5 }, buffType: "Deep Roots", buffStat: "anointing", buffBonus: 8, buffDurationHours: 8 }, successRate: 0.95 } },
  { id: "eu_academic_revival", name: "Academic Revival", description: "University costs reduced 30%.", region: "eu", effects: { fundsMult: 0.7 }, duration: "8h", rarity: "rare",
    participation: { energyCost: 15, fundsCost: 20, narrative: "An unexpected revival sweeps through the university campus. Students are gathering to worship between classes. You lead an impromptu session in the courtyard that draws a crowd of hundreds.", rewards: { xp: 60, statGains: { anointing: 5, charisma: 4, influence: 4 }, buffType: "Campus Fire", buffStat: "charisma", buffBonus: 12, buffDurationHours: 5 }, successRate: 0.80 } },
  { id: "eu_cathedral_sessions", name: "Cathedral Sessions", description: "Acoustic worship grants double anointing.", region: "eu", effects: { anointingMult: 2.0 }, duration: "4h", rarity: "epic",
    participation: { energyCost: 20, fundsCost: 30, narrative: "Inside a 600-year-old cathedral, the acoustics turn every note into something sacred. You perform an intimate worship set for 200 people. The stone walls seem to vibrate with the presence of God. Several attendees weep openly.", rewards: { xp: 90, statGains: { anointing: 10, charisma: 5, integrity_stat: 3 }, buffType: "Cathedral Resonance", buffStat: "anointing", buffBonus: 18, buffDurationHours: 8 }, successRate: 0.70 } },
  { id: "eu_underground", name: "Underground Movement", description: "Charisma grows faster in intimate settings.", region: "eu", effects: { statBonus: { charisma: 4 } }, duration: "4h", rarity: "rare",
    participation: { energyCost: 12, fundsCost: 10, narrative: "In a dimly lit basement, a secret worship gathering is underway. No stage, no lights, just raw voices and acoustic instruments. The intimacy is powerful. Everyone here is hungry for something real.", rewards: { xp: 55, statGains: { charisma: 6, anointing: 4 }, buffType: "Underground Credibility", buffStat: "charisma", buffBonus: 12, buffDurationHours: 5 }, successRate: 0.80 } },
  // South America
  { id: "sa_carnival_praise", name: "Carnival of Praise", description: "Charisma gains +30% during celebrations.", region: "sa", effects: { statBonus: { charisma: 6 } }, duration: "4h", rarity: "common",
    participation: { energyCost: 15, fundsCost: 10, narrative: "The streets are alive with percussion, color, and praise. You join the procession of worship, dancing and singing through the city. The joy is contagious. Strangers join in. The whole block becomes a praise party.", rewards: { xp: 45, statGains: { charisma: 7, anointing: 2 }, buffType: "Carnival Joy", buffStat: "charisma", buffBonus: 10, buffDurationHours: 4 }, successRate: 0.85 } },
  { id: "sa_favela_outreach", name: "Favela Outreach Wave", description: "Extra integrity and influence from ministry.", region: "sa", effects: { statBonus: { integrity_stat: 3, influence: 4 } }, duration: "8h", rarity: "rare",
    participation: { energyCost: 20, fundsCost: 20, narrative: "You enter the favela with a team of missionaries. Children gather around. You sing songs of hope in the narrow alleyways. A grandmother grabs your hand and says through tears, 'God sent you here today.'", rewards: { xp: 65, statGains: { integrity_stat: 6, influence: 5, anointing: 4 }, buffType: "Servant Heart", buffStat: "integrity_stat", buffBonus: 14, buffDurationHours: 6 }, successRate: 0.80 } },
  { id: "sa_beach_revival", name: "Beach Revival", description: "Open air worship. Less drain, more anointing.", region: "sa", effects: { anointingMult: 1.3, energyDrainMult: 0.85 }, duration: "4h", rarity: "rare",
    participation: { energyCost: 14, fundsCost: 5, narrative: "As the sun sets over the ocean, thousands gather on the sand for an open-air worship service. The waves provide the bass line. The wind carries your voice further than any speaker could. Something holy is happening here.", rewards: { xp: 60, statGains: { anointing: 6, charisma: 4 }, buffType: "Ocean Worship", buffStat: "anointing", buffBonus: 12, buffDurationHours: 5 }, successRate: 0.80 } },
  { id: "sa_fiesta", name: "Fiesta de Adoracion", description: "City-wide worship. All gains multiplied!", region: "sa", effects: { xpMult: 1.5, anointingMult: 1.3, fundsMult: 1.2 }, duration: "2h", rarity: "epic",
    participation: { energyCost: 25, fundsCost: 40, narrative: "The entire city shuts down for the Fiesta de Adoracion. Stages on every corner, worship in every language. You take the main stage and lead 20,000 people in a spontaneous hour of praise. The ground shakes. Heaven touches earth.", rewards: { xp: 110, statGains: { anointing: 8, charisma: 7, influence: 8, leadership: 3 }, buffType: "Fiesta Anointing", buffStat: "anointing", buffBonus: 22, buffDurationHours: 8 }, successRate: 0.65 } },
  { id: "sa_missions", name: "Missions Trip Season", description: "Leadership growth accelerated.", region: "sa", effects: { statBonus: { leadership: 4 } }, duration: "8h", rarity: "common",
    participation: { energyCost: 18, fundsCost: 15, narrative: "You join a missions team heading to remote villages. For three days you teach, sing, and serve. A young boy tells you he wants to be a worship leader when he grows up. You realize -- this is what it's all about.", rewards: { xp: 50, statGains: { leadership: 6, integrity_stat: 4, anointing: 3 }, buffType: "Missionary Zeal", buffStat: "leadership", buffBonus: 10, buffDurationHours: 6 }, successRate: 0.85 } },
]

export function getActiveRegionalEvents(regionId: string): RegionalEvent[] {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const hourBlock = Math.floor(now.getUTCHours() / 6) // 4 blocks per day
  const regionEvents = REGIONAL_EVENTS.filter(e => e.region === regionId)
  if (regionEvents.length === 0) return []
  const seed1 = (dayOfYear * 7 + regionId.charCodeAt(0)) % regionEvents.length
  const seed2 = (dayOfYear * 13 + hourBlock + regionId.charCodeAt(regionId.length - 1)) % regionEvents.length
  const active = [regionEvents[seed1]]
  if (seed2 !== seed1) active.push(regionEvents[seed2])
  return active
}

// ========== RIVAL ARTIST SYSTEM ==========
export interface RivalArtist {
  id: string; name: string; region: string; level: number
  charisma: number; anointing: number; influence: number; integrity: number
  streams: number; trending: boolean; personality: string
}

const RIVAL_NAMES: Record<string, string[]> = {
  af: ["Prophet Kwame", "Sister Amara", "Elder Osei", "Mama Grace", "Bishop Kofi", "Psalmist Nia", "Apostle Tendai", "Deacon Jabari", "Minister Ada", "Praise Zuri"],
  na: ["Pastor Mike", "Sister Harmony", "DJ Sanctified", "Brother Cross", "Minister Lyric", "Bishop Nova", "Deacon Flow", "Apostle Keys", "Choir Queen B", "Prophet Isaiah"],
  eu: ["Vicar James", "Sister Celeste", "Hymn Master Karl", "Reverend Astrid", "Cantor Luca", "Deacon Sophie", "Minister Elias", "Praise Leader Freya", "Brother Augustine", "Chapel Rose"],
  sa: ["Pastor Rafael", "Hermana Luz", "Alabanza Marco", "Minister Camila", "Profeta Diego", "Worship Valentina", "Levita Bruno", "Pastora Isabella", "Salmista Gabriel", "Hermano Santiago"],
}

const RIVAL_PERSONALITIES = [
  "Charismatic showman who draws big crowds", "Humble servant leader with deep anointing",
  "Business-savvy artist climbing the charts", "Fiery preacher and worship leader",
  "Studio perfectionist with polished production", "Street evangelist turned recording artist",
  "Former secular artist with powerful testimony", "Youth pastor building a worship movement",
  "Traveling missionary with global following", "Quiet intercessor whose songs carry weight",
]

export function getRegionalRivals(regionId: string): RivalArtist[] {
  const names = RIVAL_NAMES[regionId] ?? RIVAL_NAMES.na
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return names.map((name, i) => {
    const seed = (dayOfYear + i * 17 + regionId.charCodeAt(0) * 3) % 100
    return {
      id: `rival_${regionId}_${i}`, name, region: regionId, level: 3 + (seed % 25),
      charisma: 20 + ((seed * 3 + i * 7) % 60), anointing: 15 + ((seed * 5 + i * 11) % 65),
      influence: 10 + ((seed * 2 + i * 13) % 80) + dayOfYear % 5,
      integrity: 25 + ((seed * 7 + i * 3) % 50),
      streams: 500 + seed * 150 + dayOfYear * 10 + i * 200,
      trending: (seed + dayOfYear + i) % 5 === 0,
      personality: RIVAL_PERSONALITIES[(seed + i) % RIVAL_PERSONALITIES.length],
    }
  })
}

// ========== STREAMING TREND ENGINE ==========
export interface StreamingTrend {
  id: string; name: string; description: string
  tags: string[]; streamBonus: number; streamPenalty: number
}

export const STREAMING_TRENDS: StreamingTrend[] = [
  { id: "acoustic_revival", name: "Acoustic Revival Season", description: "Stripped-down, intimate worship dominates.", tags: ["acoustic", "worship", "ballad"], streamBonus: 1.45, streamPenalty: 0.85 },
  { id: "praise_surge", name: "High Energy Praise Surge", description: "Upbeat praise anthems are trending.", tags: ["praise", "live", "choir"], streamBonus: 1.40, streamPenalty: 0.88 },
  { id: "worship_ballad", name: "Worship Ballad Popularity", description: "Slow devotional ballads capture hearts.", tags: ["ballad", "worship", "studio"], streamBonus: 1.35, streamPenalty: 0.90 },
  { id: "revival_fire", name: "Revival Fire Movement", description: "Raw, Spirit-led recordings go viral.", tags: ["revival", "live", "prayer"], streamBonus: 1.50, streamPenalty: 0.82 },
  { id: "festival_anthem", name: "Festival Anthem Trend", description: "Big festival worship anthems in demand.", tags: ["praise", "live", "choir"], streamBonus: 1.40, streamPenalty: 0.87 },
  { id: "scripture_songs", name: "Scripture Song Movement", description: "Songs quoting scripture are trending.", tags: ["scripture", "worship", "acoustic"], streamBonus: 1.35, streamPenalty: 0.90 },
  { id: "choir_renaissance", name: "Choir Renaissance", description: "Full choir arrangements making a comeback.", tags: ["choir", "live", "praise"], streamBonus: 1.45, streamPenalty: 0.83 },
  { id: "prayer_room", name: "Prayer Room Sessions", description: "Intimate prayer recordings are gold.", tags: ["prayer", "acoustic", "worship"], streamBonus: 1.40, streamPenalty: 0.88 },
]

export const SONG_TAGS = ["acoustic", "worship", "ballad", "praise", "live", "choir", "studio", "revival", "prayer", "scripture"] as const
export type SongTag = typeof SONG_TAGS[number]

export function getCurrentTrend(): StreamingTrend {
  const cycleLength = 72 * 60 * 60 * 1000
  const cycleIndex = Math.floor(Date.now() / cycleLength) % STREAMING_TRENDS.length
  return STREAMING_TRENDS[cycleIndex]
}

export function getSongTrendMultiplier(songTags: string[]): { multiplier: number; isMatch: boolean } {
  const trend = getCurrentTrend()
  const matchCount = songTags.filter(t => trend.tags.includes(t)).length
  if (matchCount >= 2) return { multiplier: trend.streamBonus, isMatch: true }
  if (matchCount === 1) return { multiplier: 1 + (trend.streamBonus - 1) * 0.5, isMatch: true }
  return { multiplier: trend.streamPenalty, isMatch: false }
}

// ========== STORY PROGRESSION SYSTEM ==========
export interface StoryChapter {
  key: string
  act: number
  title: string
  subtitle: string
  narrative: string          // The story text shown to the player
  unlockCondition: {         // What triggers this chapter becoming available
    level?: number
    stat?: { key: string; value: number }
    chaptersCompleted?: string[]  // Previous chapters that must be done
    songsWritten?: number
    albumsRecorded?: number
  }
  choices: {
    id: string
    label: string
    description: string
    consequences: {
      statChanges?: Record<string, number>
      xpGain?: number
      fundsChange?: number
      buffType?: string
      narrativeResult: string  // What happens after choosing
    }
  }[]
}

export const STORY_CHAPTERS: StoryChapter[] = [
  // ===== ACT 1: THE CALLING =====
  {
    key: "ch1_the_dream",
    act: 1,
    title: "The Dream",
    subtitle: "Every ministry starts with a whisper.",
    narrative: "You wake from a vivid dream. In it, you stood before a vast crowd, singing a song you've never heard before -- but every word felt like fire. The melody still hums in your chest. You feel God stirring something inside you. This isn't just a dream. It's a calling.\n\nYou sit on the edge of your bed, heart pounding. The world outside your window is ordinary. But something inside you has changed forever.",
    unlockCondition: { level: 1 },
    choices: [
      {
        id: "surrender", label: "Surrender to the Call",
        description: "Drop everything and pursue music ministry full-time.",
        consequences: { statChanges: { anointing: 8, integrity_stat: 5 }, xpGain: 30, fundsChange: -20, narrativeResult: "You kneel beside your bed and whisper, 'Here I am, Lord. Send me.' Peace floods your soul. The road ahead is uncertain, but you know Whose voice called you. Your journey begins today." }
      },
      {
        id: "cautious", label: "Pray About It First",
        description: "Seek confirmation through prayer and counsel before committing.",
        consequences: { statChanges: { integrity_stat: 8, leadership: 3 }, xpGain: 25, buffType: "discernment", narrativeResult: "You spend three days in prayer and fasting, asking God to confirm the vision. On the third night, the dream returns -- even clearer. Your pastor prays over you and says, 'Go. The Lord is with you.' You step forward with deep conviction." }
      },
      {
        id: "doubt", label: "Dismiss It as Just a Dream",
        description: "Go back to sleep. Dreams don't pay bills.",
        consequences: { statChanges: { anointing: -3, charisma: 5 }, xpGain: 15, fundsChange: 30, narrativeResult: "You roll over and go back to sleep. But the melody won't leave. For weeks it haunts you -- in the shower, at work, in silence. Finally, you pick up a pen and write your first lyric. Some callings can't be ignored." }
      }
    ]
  },
  {
    key: "ch2_first_song",
    act: 1,
    title: "The First Song",
    subtitle: "Raw. Unpolished. Anointed.",
    narrative: "Your fingers hover over the keyboard. The melody from the dream flows through you like a river. Words come -- not from your mind, but somewhere deeper. You write for three hours straight without stopping.\n\nWhen you finally look up, tears are streaming down your face. The song isn't perfect. The recording on your phone sounds rough. But something about it carries weight. This isn't just music. It's a weapon.",
    unlockCondition: { level: 2, songsWritten: 1, chaptersCompleted: ["ch1_the_dream"] },
    choices: [
      {
        id: "share", label: "Share It at Church",
        description: "Sing it at next Sunday's service, raw and unpolished.",
        consequences: { statChanges: { anointing: 6, charisma: 5, influence: 3 }, xpGain: 35, narrativeResult: "Your voice cracks on the second verse. Your hands shake. But halfway through the chorus, something shifts in the room. People start weeping. The pastor stands with his hands raised. After service, a woman tells you, 'That song healed something in me.' You know this is real." }
      },
      {
        id: "polish", label: "Perfect It in the Studio",
        description: "Take time to polish the production before anyone hears it.",
        consequences: { statChanges: { charisma: 3, leadership: 4 }, xpGain: 30, fundsChange: -40, narrativeResult: "You spend two weeks reworking every note, every word. The final version is clean, professional, radio-ready. But in the process, something raw gets smoothed away. It's good. Very good. But you wonder if the original carried something this version doesn't." }
      },
      {
        id: "keep", label: "Keep It Private",
        description: "This song is between you and God. For now.",
        consequences: { statChanges: { anointing: 10, integrity_stat: 3 }, xpGain: 20, narrativeResult: "You lock the song in your heart like a seed in soil. For weeks you sing it alone in your room, in the car, in the quiet of dawn. Each time it grows deeper. You're learning that not everything anointed is meant for a stage. Some songs are just altars." }
      }
    ]
  },
  {
    key: "ch3_the_test",
    act: 1,
    title: "The Wilderness Test",
    subtitle: "Every calling gets tested in the desert.",
    narrative: "Three months into your journey and the momentum has stalled. No one is streaming your songs. Your church gig dried up. A secular label rep calls and offers a deal -- but with conditions that compromise your message.\n\nYour rent is due. Your instrument needs repair. Your family thinks you're wasting your time. Late at night, doubt whispers: 'Maybe this was never God. Maybe you made it all up.'",
    unlockCondition: { level: 4, chaptersCompleted: ["ch2_first_song"] },
    choices: [
      {
        id: "fast_pray", label: "Fast and Press Through",
        description: "Enter a 3-day fast and refuse to quit.",
        consequences: { statChanges: { anointing: 12, integrity_stat: 8, leadership: 3 }, xpGain: 50, fundsChange: -15, narrativeResult: "The fast is brutal. Day two you almost break. But on day three, during worship at 3 AM, the presence of God fills your room so thick you can barely stand. A scripture comes alive: 'I will never leave you.' The next morning, a church you've never heard of calls and invites you to lead worship. Breakthrough always comes after the test." }
      },
      {
        id: "take_deal", label: "Take the Secular Deal",
        description: "Compromise a little to survive. You can always come back.",
        consequences: { statChanges: { anointing: -12, integrity_stat: -10, charisma: 8, influence: 15 }, xpGain: 30, fundsChange: 200, narrativeResult: "You sign the contract. The money is good. The exposure is real. But in the studio, they change your lyrics. 'Less Jesus, more vibe.' You comply. The single charts. But alone in your car after the session, you feel hollow. Success and anointing are not the same thing." }
      },
      {
        id: "get_job", label: "Get a Day Job to Fund Ministry",
        description: "Work honestly while building your ministry on the side.",
        consequences: { statChanges: { integrity_stat: 10, leadership: 5 }, xpGain: 35, fundsChange: 100, narrativeResult: "You take a humble job at a warehouse and write songs on your lunch break. It's not glamorous. But it's honest. One of your coworkers overhears you humming and asks about your faith. Three months later, you're leading a small Bible study at work. Ministry isn't always a stage." }
      }
    ]
  },

  // ===== ACT 2: THE RISE =====
  {
    key: "ch4_viral_moment",
    act: 2,
    title: "The Viral Moment",
    subtitle: "Overnight success, years in the making.",
    narrative: "Someone filmed your street worship session and posted it online. You wake up to 50,000 views. Then 200,000. Your phone is exploding. Pastors, labels, podcasters -- everyone wants a piece of you.\n\nBut you're the same person who was crying on your bedroom floor two months ago. The attention is intoxicating. And dangerous.",
    unlockCondition: { level: 8, chaptersCompleted: ["ch3_the_test"], stat: { key: "influence", value: 30 } },
    choices: [
      {
        id: "steward", label: "Steward It Carefully",
        description: "Take your time, pray about every opportunity, and stay grounded.",
        consequences: { statChanges: { anointing: 8, integrity_stat: 10, leadership: 6 }, xpGain: 60, narrativeResult: "You turn down three offers that don't align with your calling. People call you foolish. But six months later, the right door opens -- one that doesn't require compromise. Your pastor tells you, 'God promotes those who can handle the weight.' You're learning to carry it." }
      },
      {
        id: "ride_wave", label: "Ride the Wave",
        description: "Say yes to everything. Strike while the iron is hot.",
        consequences: { statChanges: { influence: 20, charisma: 10, anointing: -5, integrity_stat: -3 }, xpGain: 45, fundsChange: 300, narrativeResult: "Interviews, features, tours, collab requests -- you say yes to all of it. Your following explodes. But so does your schedule. You haven't prayed in weeks. Your songs start sounding like everyone else's. A mentor pulls you aside: 'You're building a brand, not a ministry.' The words sting because they're true." }
      },
      {
        id: "disappear", label: "Go Silent",
        description: "Delete the video. Disappear from social media. Seek God in secret.",
        consequences: { statChanges: { anointing: 15, integrity_stat: 5, influence: -10 }, xpGain: 40, narrativeResult: "The internet loses its mind when you delete the viral video. 'Where did they go?' But you're in a prayer room, face down, asking God what He really wants. Three months of silence. When you resurface, something has changed. Your music doesn't just entertain anymore. It transforms." }
      }
    ]
  },
  {
    key: "ch5_the_mentor",
    act: 2,
    title: "The Mentor",
    subtitle: "Iron sharpens iron.",
    narrative: "A legendary gospel artist -- someone you've admired since childhood -- reaches out. They want to mentor you. But they're controversial. Some love them. Others say they've compromised. Their music changed the industry, but their personal life has been messy.\n\nThey invite you to spend a week at their home studio. 'I see something in you,' they say. 'Let me help you avoid the mistakes I made.'",
    unlockCondition: { level: 12, chaptersCompleted: ["ch4_viral_moment"] },
    choices: [
      {
        id: "accept", label: "Accept the Mentorship",
        description: "Learn from their wisdom and their mistakes.",
        consequences: { statChanges: { charisma: 10, leadership: 8, anointing: 4 }, xpGain: 65, narrativeResult: "The week changes you. They teach you things no YouTube tutorial could: how to handle fame, how to protect your marriage, how to write songs that outlive you. But they also show you their scars. 'Don't become me,' they whisper. 'Become who I was supposed to be.' You leave with fire in your bones and tears in your eyes." }
      },
      {
        id: "decline", label: "Politely Decline",
        description: "Their reputation is too risky. Protect your witness.",
        consequences: { statChanges: { integrity_stat: 8, anointing: 5 }, xpGain: 35, narrativeResult: "You write a respectful email declining. They respond graciously: 'I understand. Guard your calling.' You feel peace. But sometimes you wonder what wisdom you missed. Not every fallen tree has rotten roots. Some still bear fruit." }
      },
      {
        id: "partial", label: "Learn the Craft, Not the Lifestyle",
        description: "Take the musical training but keep your distance personally.",
        consequences: { statChanges: { charisma: 6, leadership: 4, integrity_stat: 4 }, xpGain: 50, fundsChange: -30, narrativeResult: "You spend three days absorbing everything about songwriting, production, and performance. But when conversations turn personal, you keep boundaries. They notice. 'Smart kid,' they say. 'Wiser than I was at your age.' You leave with sharpened skills and an intact conscience." }
      }
    ]
  },

  // ===== ACT 3: THE COST =====
  {
    key: "ch6_the_betrayal",
    act: 3,
    title: "The Betrayal",
    subtitle: "Not every ally is a friend.",
    narrative: "Your manager -- someone you trusted with your finances, your schedule, your vision -- has been stealing from you. Thousands of dollars gone. Contracts signed without your knowledge. And they've been talking to the press, twisting your story.\n\nThe Christian internet is dragging your name. People you discipled are walking away. Your phone buzzes with hate. You sit in your car outside the church, wondering if ministry was worth it.",
    unlockCondition: { level: 16, chaptersCompleted: ["ch5_the_mentor"], stat: { key: "influence", value: 50 } },
    choices: [
      {
        id: "forgive", label: "Forgive Publicly",
        description: "Release a statement forgiving them and refusing to retaliate.",
        consequences: { statChanges: { anointing: 15, integrity_stat: 12, influence: 8 }, xpGain: 80, narrativeResult: "Your forgiveness statement goes viral for different reasons now. 'I choose to walk in love. What was stolen, God will restore.' Half the internet calls you weak. The other half calls you Christ-like. A year later, the manager reaches out, broken and repentant. You meet for coffee. Grace wins again." }
      },
      {
        id: "legal", label: "Take Legal Action",
        description: "Hire a lawyer. Justice matters too.",
        consequences: { statChanges: { leadership: 10, integrity_stat: 5, anointing: -3 }, xpGain: 55, fundsChange: -150, narrativeResult: "The legal battle is exhausting. But the court rules in your favor. You recover most of the stolen funds. The manager is exposed. Some say you should have 'just forgiven.' But you remember: even Jesus flipped tables. Justice and mercy are not opposites." }
      },
      {
        id: "silent", label: "Say Nothing and Rebuild",
        description: "Don't address it publicly. Just quietly rebuild in the background.",
        consequences: { statChanges: { integrity_stat: 8, anointing: 8, leadership: 5 }, xpGain: 60, narrativeResult: "You say nothing. You let God defend your name. It takes months. The rumors eventually die. New allies emerge -- people who judge you by your fruit, not by gossip. You learn that silence is sometimes the loudest sermon." }
      }
    ]
  },
  {
    key: "ch7_the_summit",
    act: 3,
    title: "The Summit",
    subtitle: "The view from the top reveals everything.",
    narrative: "You've been invited to headline the Kingdom Notes Global Conference. 50,000 seats. Live broadcast to millions. This is the moment every gospel artist dreams of.\n\nBackstage, your hands are shaking. Not from nerves. From the weight. Every choice you've made, every test you've passed, every tear you've shed has led to this microphone.\n\nThe lights dim. The crowd hushes. It's time.",
    unlockCondition: { level: 25, chaptersCompleted: ["ch6_the_betrayal"], stat: { key: "anointing", value: 60 } },
    choices: [
      {
        id: "spirit_led", label: "Throw Away the Setlist",
        description: "Let the Spirit lead. Sing whatever God puts in your mouth.",
        consequences: { statChanges: { anointing: 20, integrity_stat: 10, influence: 15, charisma: 8 }, xpGain: 120, narrativeResult: "You walk to the mic and close your eyes. For three seconds, silence. Then you begin to sing -- not the rehearsed songs, but a melody from deep within. The same melody from your very first dream.\n\nThe crowd erupts. People fall to their knees. The broadcast captures something cameras can't explain: the tangible presence of God. Commentators will call it 'the greatest worship moment in conference history.' But you know the truth. It wasn't you. It was never you." }
      },
      {
        id: "polished", label: "Deliver the Perfect Show",
        description: "Execute the rehearsed set flawlessly. Give them the performance of a lifetime.",
        consequences: { statChanges: { charisma: 15, influence: 20, leadership: 10 }, xpGain: 100, fundsChange: 500, narrativeResult: "Every transition is seamless. Every note lands. The crowd sings along to every chorus. Critics call it 'the most professional gospel concert in decades.' Streaming numbers explode. But in the green room after, you sit alone. It was good. Really good. But was it anointed? The question haunts you. Excellence and anointing aren't always the same thing." }
      },
      {
        id: "testimony", label: "Share Your Full Testimony First",
        description: "Before singing a single note, tell them everything -- the doubts, the failures, the God who never left.",
        consequences: { statChanges: { anointing: 15, integrity_stat: 15, influence: 10, charisma: 5 }, xpGain: 110, narrativeResult: "You speak for twenty minutes before touching an instrument. You tell them about the dream. The wilderness. The betrayal. The moments you almost quit. Raw, unscripted, vulnerable. When you finally sing, the worship isn't a performance. It's an altar call.\n\n2,000 people give their lives to Christ that night. The conference will be remembered not for the music, but for the harvest." }
      }
    ]
  },
]

// ========== RANDOM OPPORTUNITIES ==========
export interface RandomOpportunity {
  id: string
  title: string
  description: string
  narrative: string
  icon: string // lucide icon name
  energyCost: number
  fundsCost: number
  duration: number // minutes this opportunity stays available
  levelRequired: number
  statRequired?: { key: string; value: number }
  rewards: {
    xp: number
    funds: number
    statGains: Record<string, number>
    buffType?: string
    buffStat?: string
    buffBonus?: number
    buffDurationHours?: number
  }
  successRate: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

export const RANDOM_OPPORTUNITIES: RandomOpportunity[] = [
  // Radio Interviews
  {
    id: "radio_interview_local", title: "Local Radio Interview", description: "A local gospel station wants to interview you about your music.",
    narrative: "The host greets you warmly: 'We've been hearing your name around town. Tell us about your journey.' You share your testimony on air. Listeners call in with encouragement. Your phone buzzes with new followers.",
    icon: "Radio", energyCost: 8, fundsCost: 0, duration: 45, levelRequired: 2,
    rewards: { xp: 35, funds: 25, statGains: { influence: 5, charisma: 3 } }, successRate: 0.90, rarity: "common"
  },
  {
    id: "radio_interview_national", title: "National Broadcast Feature", description: "A major gospel network wants a 30-minute live segment with you.",
    narrative: "The cameras are rolling. Millions are watching. The host asks about your faith, your music, and your vision. You speak from the heart. The switchboard lights up. This is your moment to represent the Kingdom on a national stage.",
    icon: "Radio", energyCost: 15, fundsCost: 0, duration: 30, levelRequired: 8, statRequired: { key: "influence", value: 30 },
    rewards: { xp: 80, funds: 100, statGains: { influence: 12, charisma: 6 }, buffType: "Media Darling", buffStat: "influence", buffBonus: 15, buffDurationHours: 8 }, successRate: 0.75, rarity: "rare"
  },
  {
    id: "podcast_testimony", title: "Viral Podcast Interview", description: "A faith-based podcast with 500K subscribers wants your story.",
    narrative: "It's just you, a microphone, and raw honesty. You talk for an hour about the wilderness, the doubts, the moments God showed up. The episode goes viral. Comments flood in: 'This changed my life.'",
    icon: "Mic", energyCost: 10, fundsCost: 0, duration: 40, levelRequired: 5, statRequired: { key: "integrity_stat", value: 20 },
    rewards: { xp: 55, funds: 50, statGains: { influence: 8, integrity_stat: 4, charisma: 3 } }, successRate: 0.85, rarity: "common"
  },
  // Youth Revivals
  {
    id: "youth_revival_camp", title: "Youth Camp Revival", description: "200 teenagers at summer camp are hungry for a move of God.",
    narrative: "The bonfire crackles. 200 teenagers sit in the dark, hearts open. You sing one song -- just one -- and the Spirit falls. Kids start crying, praying, surrendering. The camp counselors tell you later: 15 kids gave their lives to Christ. You drive home in tears of joy.",
    icon: "Flame", energyCost: 25, fundsCost: 10, duration: 35, levelRequired: 6, statRequired: { key: "anointing", value: 25 },
    rewards: { xp: 70, funds: 30, statGains: { anointing: 8, leadership: 5, influence: 6 }, buffType: "Youth Fire", buffStat: "anointing", buffBonus: 12, buffDurationHours: 6 }, successRate: 0.80, rarity: "rare"
  },
  {
    id: "school_assembly", title: "School Assembly Invite", description: "A Christian school invited you to share and perform for students.",
    narrative: "300 students pack the gymnasium. Some are skeptical. Some are bored. But when you share your testimony and play your song, the gym goes quiet. A teacher whispers, 'You just planted seeds that will grow for decades.'",
    icon: "GraduationCap", energyCost: 15, fundsCost: 0, duration: 50, levelRequired: 3,
    rewards: { xp: 40, funds: 15, statGains: { integrity_stat: 4, influence: 4, leadership: 3 } }, successRate: 0.90, rarity: "common"
  },
  // Testimony Sharing
  {
    id: "prison_ministry", title: "Prison Ministry Invitation", description: "A chaplain asks you to lead worship at a correctional facility.",
    narrative: "Behind barbed wire and concrete walls, you set up your equipment. The inmates file in, skeptical. You start to sing. One song in, a man in the front row drops to his knees. Then another. By the end, half the room is weeping. The chaplain tells you, 'You reached people today that no sermon ever could.'",
    icon: "Heart", energyCost: 20, fundsCost: 0, duration: 30, levelRequired: 5, statRequired: { key: "integrity_stat", value: 25 },
    rewards: { xp: 65, funds: 0, statGains: { anointing: 10, integrity_stat: 8, influence: 5 }, buffType: "Compassion Mantle", buffStat: "anointing", buffBonus: 15, buffDurationHours: 8 }, successRate: 0.85, rarity: "rare"
  },
  {
    id: "hospital_visit", title: "Hospital Ward Worship", description: "A nurse asks if you'd sing for patients in the terminal ward.",
    narrative: "Room by room, bed by bed. You sing softly -- hymns, mostly. An elderly woman holds your hand through an entire song. A father of three mouths 'thank you' through an oxygen mask. You leave the hospital different than when you entered. Some stages are smaller than a bedside. And holier.",
    icon: "Heart", energyCost: 12, fundsCost: 0, duration: 45, levelRequired: 3,
    rewards: { xp: 45, funds: 0, statGains: { anointing: 7, integrity_stat: 6 }, buffType: "Healer's Touch", buffStat: "anointing", buffBonus: 10, buffDurationHours: 4 }, successRate: 0.95, rarity: "common"
  },
  {
    id: "testimony_night", title: "Testimony Night at Megachurch", description: "A megachurch with 5,000 members wants you to share your story.",
    narrative: "Five thousand people. A jumbotron. And you -- no instrument, no backing track. Just your story. You tell them about the dream, the doubt, the day you almost quit. When you finish, the pastor stands and says, 'That's why we do this.' The altar fills with people rededicating their lives.",
    icon: "MessageSquare", energyCost: 18, fundsCost: 20, duration: 25, levelRequired: 10, statRequired: { key: "charisma", value: 30 },
    rewards: { xp: 90, funds: 150, statGains: { influence: 15, charisma: 5, integrity_stat: 5 }, buffType: "Testimony Power", buffStat: "influence", buffBonus: 20, buffDurationHours: 10 }, successRate: 0.70, rarity: "epic"
  },
  // Live Album Recordings
  {
    id: "live_recording_invite", title: "Live Recording Invitation", description: "A producer wants to record your next concert for a live album.",
    narrative: "Professional cameras. Multi-track recording. A hand-picked audience of 500 worship leaders. The producer says, 'Just do what you do. We'll capture the rest.' The night is electric. Every song feels anointed. You know this recording will outlive you.",
    icon: "Disc", energyCost: 30, fundsCost: 60, duration: 20, levelRequired: 12, statRequired: { key: "charisma", value: 35 },
    rewards: { xp: 100, funds: 200, statGains: { influence: 10, charisma: 8, anointing: 6 }, buffType: "Recording Magic", buffStat: "charisma", buffBonus: 18, buffDurationHours: 10 }, successRate: 0.65, rarity: "epic"
  },
  {
    id: "studio_collab", title: "Surprise Studio Collab", description: "A top gospel artist is in town and wants to record a duet.",
    narrative: "You walk into the studio and there they are -- the artist whose album changed your life at age 15. They smile and say, 'Let's make something beautiful.' Two hours later, you've created a song that neither of you could have written alone. Iron sharpened iron.",
    icon: "Music", energyCost: 20, fundsCost: 30, duration: 25, levelRequired: 7, statRequired: { key: "charisma", value: 20 },
    rewards: { xp: 70, funds: 80, statGains: { charisma: 7, influence: 8, anointing: 4 }, buffType: "Collab Momentum", buffStat: "charisma", buffBonus: 14, buffDurationHours: 6 }, successRate: 0.75, rarity: "rare"
  },
  // Special / Legendary
  {
    id: "award_show_invite", title: "Gospel Music Award Nomination", description: "You've been nominated for 'Breakthrough Artist of the Year'!",
    narrative: "The envelope opens. Your name echoes through the auditorium. Win or lose, you're here -- the kid who once sang on street corners is now standing among legends. If you accept the award, the platform expands. If you don't win, the nomination alone opens doors. God is faithful.",
    icon: "Award", energyCost: 15, fundsCost: 100, duration: 15, levelRequired: 15, statRequired: { key: "influence", value: 60 },
    rewards: { xp: 150, funds: 500, statGains: { influence: 25, charisma: 10, leadership: 5 }, buffType: "Award Winner", buffStat: "influence", buffBonus: 25, buffDurationHours: 12 }, successRate: 0.50, rarity: "legendary"
  },
  {
    id: "missions_emergency", title: "Emergency Missions Call", description: "A disaster-struck community needs hope. Will you go?",
    narrative: "The call comes at 2 AM. A flood has devastated a small town. The relief team needs a worship leader to minister to survivors in the shelter. You pack a bag and drive through the night. In a gymnasium full of displaced families, you sing 'It Is Well.' A mother clutches her children and mouths the words. Ministry isn't always a stage.",
    icon: "Heart", energyCost: 30, fundsCost: 0, duration: 20, levelRequired: 8, statRequired: { key: "integrity_stat", value: 30 },
    rewards: { xp: 85, funds: 0, statGains: { anointing: 15, integrity_stat: 12, leadership: 5 }, buffType: "Servant King", buffStat: "anointing", buffBonus: 20, buffDurationHours: 10 }, successRate: 0.90, rarity: "epic"
  },
]

// Generate a random opportunity based on character level and time
export function rollRandomOpportunity(level: number, stats: Record<string, number>): RandomOpportunity | null {
  // 25% chance to get an opportunity on any check
  if (Math.random() > 0.25) return null

  const eligible = RANDOM_OPPORTUNITIES.filter(opp => {
    if (level < opp.levelRequired) return false
    if (opp.statRequired && (stats[opp.statRequired.key] ?? 0) < opp.statRequired.value) return false
    return true
  })

  if (eligible.length === 0) return null

  // Weight by rarity
  const weights: Record<string, number> = { common: 4, rare: 2, epic: 1, legendary: 0.3 }
  const weighted = eligible.flatMap(opp => Array(Math.ceil(weights[opp.rarity] * 10)).fill(opp))
  return weighted[Math.floor(Math.random() * weighted.length)]
}
