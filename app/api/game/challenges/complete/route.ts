import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Challenge rewards mapping
const CHALLENGE_REWARDS: Record<string, Record<string, number>> = {
  pray_3_times: { favor: 5, anointing: 10 },
  write_song: { favor: 10, charisma: 5 },
  perform_2_times: { favor: 8, influence: 15 },
  tithe_once: { favor: 15 },
  train_skill: { favor: 5 },
  complete_story: { favor: 20 },
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { challengeKey } = await request.json()

  if (!challengeKey) {
    return NextResponse.json({ error: "Challenge key required" }, { status: 400 })
  }

  // Get character
  const { data: character } = await supabase
    .from("characters")
    .select("id, favor, anointing, charisma, influence")
    .eq("user_id", user.id)
    .single()

  if (!character) {
    return NextResponse.json({ error: "No character found" }, { status: 404 })
  }

  const today = new Date().toISOString().split("T")[0]

  // Get the challenge record
  const { data: challenge } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("character_id", character.id)
    .eq("challenge_key", challengeKey)
    .eq("challenge_date", today)
    .single()

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }

  if (challenge.completed) {
    return NextResponse.json({ error: "Challenge already completed" }, { status: 400 })
  }

  // Mark challenge as completed
  await supabase
    .from("daily_challenges")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", challenge.id)

  // Apply rewards
  const rewards = CHALLENGE_REWARDS[challengeKey] || { favor: 5 }
  const updates: Record<string, number> = {}

  if (rewards.favor) {
    updates.favor = (character.favor || 0) + rewards.favor
  }
  if (rewards.anointing) {
    updates.anointing = character.anointing + rewards.anointing
  }
  if (rewards.charisma) {
    updates.charisma = character.charisma + rewards.charisma
  }
  if (rewards.influence) {
    updates.influence = character.influence + rewards.influence
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from("characters")
      .update(updates)
      .eq("id", character.id)
  }

  // Log the activity
  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "challenge_complete",
    result_text: `Completed daily challenge: ${challengeKey}. Earned rewards!`,
    stat_changes: rewards,
  })

  return NextResponse.json({
    success: true,
    rewards,
    message: `Challenge completed! Earned ${Object.entries(rewards).map(([k, v]) => `+${v} ${k}`).join(", ")}`,
  })
}
