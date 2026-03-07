import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getRegion, REGIONS } from "@/lib/game/constants"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { regionId, activityIndex } = body

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 })
  }

  // Must be in the region to do its local activity
  if (character.region !== regionId) {
    return NextResponse.json({ error: "You must be in this region to do this activity" }, { status: 400 })
  }

  const region = REGIONS.find(r => r.id === regionId)
  if (!region || !region.localActivities || activityIndex < 0 || activityIndex >= region.localActivities.length) {
    return NextResponse.json({ error: "Invalid activity" }, { status: 400 })
  }

  const energyCost = 15
  if (character.energy < energyCost) {
    return NextResponse.json({ error: "Not enough energy" }, { status: 400 })
  }

  const activity = region.localActivities[activityIndex]
  const dbStat = activity.stat === "integrity" ? "integrity_stat" : activity.stat
  const boost = activity.boost + Math.floor(Math.random() * 3)
  const currentStat = Number(character[dbStat] ?? 0)
  const maxable = ["energy", "anointing", "charisma", "integrity_stat", "leadership"]

  const updates: Record<string, unknown> = {
    energy: character.energy - energyCost,
    last_tick_at: new Date().toISOString(),
  }

  if (maxable.includes(dbStat)) {
    updates[dbStat] = Math.min(100, currentStat + boost)
  } else if (dbStat === "influence") {
    updates[dbStat] = currentStat + boost
  }

  if (activity.funds > 0) {
    const funds = activity.funds + Math.floor(Math.random() * 10)
    updates.funds = Number(character.funds) + funds
  }

  // XP for region activities
  const xpGain = 15 + Math.floor(Math.random() * 10)
  updates.xp = character.xp + xpGain

  await supabase.from("characters").update(updates).eq("id", character.id)

  const earnedFunds = activity.funds > 0 ? ` Earned $${(Number(updates.funds) - Number(character.funds)).toFixed(0)}.` : ""
  const resultText = `${activity.name}: +${boost} ${activity.stat}.${earnedFunds} (+${xpGain} XP)`

  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "region_activity",
    result_text: resultText,
    stat_changes: { [activity.stat]: boost, energy: -energyCost, xp: xpGain },
  })

  return NextResponse.json({ success: true, resultText })
}
