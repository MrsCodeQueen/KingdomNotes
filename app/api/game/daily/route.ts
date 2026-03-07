import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()
  if (!character) return NextResponse.json({ error: "No character found" }, { status: 404 })

  const today = new Date().toISOString().split("T")[0]

  if (character.last_daily_login === today) {
    return NextResponse.json({ error: "Already claimed today", alreadyClaimed: true }, { status: 400 })
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
  const isConsecutive = character.last_daily_login === yesterday
  const newStreak = isConsecutive ? character.daily_streak + 1 : 1

  // Rewards scale with streak
  const energyBonus = Math.min(100, 30 + newStreak * 5)
  const anointingBonus = Math.min(15, 3 + Math.floor(newStreak / 2))
  const xpBonus = 10 + newStreak * 2

  const updates: Record<string, number | string> = {
    last_daily_login: today,
    daily_streak: newStreak,
    energy: Math.min(100, character.energy + energyBonus),
    anointing: Math.min(100, character.anointing + anointingBonus),
    xp: character.xp + xpBonus,
  }

  // Check for level up
  let leveledUp = false
  let newLevel = character.level
  let totalXp = character.xp + xpBonus
  while (totalXp >= newLevel * 100) {
    totalXp -= newLevel * 100
    newLevel++
    leveledUp = true
  }
  if (leveledUp) {
    updates.level = newLevel
    updates.xp = totalXp
  }

  await supabase.from("characters").update(updates).eq("id", character.id)

  // 7 day streak achievement
  if (newStreak >= 7) {
    const { data: existing } = await supabase
      .from("achievements")
      .select("id")
      .eq("character_id", character.id)
      .eq("achievement_key", "seven_day_streak")
      .maybeSingle()

    if (!existing) {
      await supabase.from("achievements").insert({
        character_id: character.id,
        user_id: user.id,
        achievement_key: "seven_day_streak",
      })
    }
  }

  const statChanges: Record<string, number> = {
    energy: energyBonus,
    anointing: anointingBonus,
    xp: xpBonus,
  }

  const devotionals = [
    "\"The Lord is my shepherd; I shall not want.\" - Psalm 23:1",
    "\"I can do all things through Christ who strengthens me.\" - Philippians 4:13",
    "\"For God so loved the world...\" - John 3:16",
    "\"Trust in the Lord with all your heart.\" - Proverbs 3:5",
    "\"Be strong and courageous.\" - Joshua 1:9",
    "\"The joy of the Lord is your strength.\" - Nehemiah 8:10",
    "\"Make a joyful noise unto the Lord!\" - Psalm 100:1",
    "\"He put a new song in my mouth.\" - Psalm 40:3",
    "\"Worship the Lord in the beauty of holiness.\" - Psalm 29:2",
    "\"Let everything that has breath praise the Lord.\" - Psalm 150:6",
  ]
  const devotional = devotionals[Math.floor(Math.random() * devotionals.length)]

  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "daily_devotional",
    result_text: `Daily Devotional (Day ${newStreak}): ${devotional}`,
    stat_changes: statChanges,
  })

  return NextResponse.json({
    success: true,
    streak: newStreak,
    devotional,
    statChanges,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  })
}
