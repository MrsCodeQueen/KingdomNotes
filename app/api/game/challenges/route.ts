import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Daily challenge definitions
const DAILY_CHALLENGES = [
  {
    key: "pray_3_times",
    title: "Morning Devotion",
    description: "Pray 3 times today",
    target: 3,
    action_type: "pray",
    reward: { favor: 5, anointing: 10 },
  },
  {
    key: "write_song",
    title: "Creative Worship",
    description: "Write a new song",
    target: 1,
    action_type: "write_song",
    reward: { favor: 10, charisma: 5 },
  },
  {
    key: "perform_2_times",
    title: "Share Your Gift",
    description: "Perform 2 times today",
    target: 2,
    action_type: "perform",
    reward: { favor: 8, influence: 15 },
  },
  {
    key: "tithe_once",
    title: "Faithful Steward",
    description: "Tithe your earnings",
    target: 1,
    action_type: "tithe",
    reward: { favor: 15, integrity: 10 },
  },
  {
    key: "train_skill",
    title: "Sharpen Your Gifts",
    description: "Train any skill",
    target: 1,
    action_type: "train",
    reward: { favor: 5 },
  },
  {
    key: "complete_story",
    title: "Kingdom Journey",
    description: "Complete a story chapter",
    target: 1,
    action_type: "story_complete",
    reward: { favor: 20, xp: 50 },
  },
]

// Get today's challenges (rotate based on day of year)
function getTodaysChallenges() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  
  // Pick 3 challenges for today based on day rotation
  const shuffled = [...DAILY_CHALLENGES].sort((a, b) => {
    const hashA = (dayOfYear + a.key.charCodeAt(0)) % 100
    const hashB = (dayOfYear + b.key.charCodeAt(0)) % 100
    return hashA - hashB
  })
  
  return shuffled.slice(0, 3)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get character
  const { data: character } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!character) {
    return NextResponse.json({ error: "No character found" }, { status: 404 })
  }

  const today = new Date().toISOString().split("T")[0]
  const todaysChallenges = getTodaysChallenges()

  // Get or create today's challenge records
  const { data: existingChallenges } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("character_id", character.id)
    .eq("challenge_date", today)

  // Create missing challenge records
  const existingKeys = new Set(existingChallenges?.map(c => c.challenge_key) || [])
  const missingChallenges = todaysChallenges.filter(c => !existingKeys.has(c.key))

  if (missingChallenges.length > 0) {
    await supabase.from("daily_challenges").insert(
      missingChallenges.map(c => ({
        character_id: character.id,
        user_id: user.id,
        challenge_key: c.key,
        challenge_date: today,
        completed: false,
      }))
    )
  }

  // Fetch updated challenge records
  const { data: challenges } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("character_id", character.id)
    .eq("challenge_date", today)

  // Merge with challenge definitions
  const result = todaysChallenges.map(def => {
    const record = challenges?.find(c => c.challenge_key === def.key)
    return {
      ...def,
      id: record?.id,
      completed: record?.completed || false,
      completed_at: record?.completed_at,
    }
  })

  return NextResponse.json({
    challenges: result,
    date: today,
  })
}
