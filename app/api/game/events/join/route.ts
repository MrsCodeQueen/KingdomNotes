import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getActiveRegionalEvents } from "@/lib/game/constants"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { eventId } = await request.json()
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 })

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 })

  // Find the event in the active events for this region
  const activeEvents = getActiveRegionalEvents(character.region)
  const event = activeEvents.find(e => e.id === eventId)
  if (!event) return NextResponse.json({ error: "Event not active or not in your region" }, { status: 400 })

  const { participation } = event

  // Check energy
  if (character.energy < participation.energyCost) {
    return NextResponse.json({ error: `Not enough energy. Need ${participation.energyCost}, have ${character.energy}.` }, { status: 400 })
  }

  // Check funds
  if (Number(character.funds) < participation.fundsCost) {
    return NextResponse.json({ error: `Not enough funds. Need $${participation.fundsCost}, have $${Number(character.funds)}.` }, { status: 400 })
  }

  // Determine success
  const roll = Math.random()
  const isFullSuccess = roll <= participation.successRate
  const multiplier = isFullSuccess ? 1.0 : 0.4 + Math.random() * 0.3 // 40-70% on partial

  // Calculate actual rewards
  const xpGain = Math.floor(participation.rewards.xp * multiplier)
  const statGains: Record<string, number> = {}
  for (const [stat, val] of Object.entries(participation.rewards.statGains)) {
    statGains[stat] = Math.floor(val * multiplier)
  }
  const buffBonus = Math.floor(participation.rewards.buffBonus * multiplier)

  // Apply stat gains
  const updates: Record<string, unknown> = {
    energy: Math.max(0, character.energy - participation.energyCost),
    funds: Math.max(0, Number(character.funds) - participation.fundsCost),
    xp: character.xp + xpGain,
  }

  for (const [stat, gain] of Object.entries(statGains)) {
    const current = (character as Record<string, unknown>)[stat]
    if (typeof current === "number") {
      const cap = stat === "influence" ? 99999 : 100
      updates[stat] = Math.min(cap, current + gain)
    }
  }

  // Check for level up
  const newXp = character.xp + xpGain
  const newLevel = Math.floor(1 + Math.sqrt(newXp / 50))
  const leveledUp = newLevel > character.level
  if (leveledUp) updates.level = newLevel

  // Update character
  await supabase.from("characters").update(updates).eq("id", character.id)

  // Create buff
  if (buffBonus > 0) {
    await supabase.from("buffs").insert({
      character_id: character.id,
      user_id: user.id,
      buff_type: participation.rewards.buffType,
      stat_affected: participation.rewards.buffStat,
      bonus: buffBonus,
      expires_at: new Date(Date.now() + participation.rewards.buffDurationHours * 60 * 60 * 1000).toISOString(),
    })
  }

  // Log the activity
  const resultText = isFullSuccess
    ? `${participation.narrative}\n\nYou fully immersed yourself in the ${event.name}. The experience was transformative.`
    : `${participation.narrative}\n\nYou participated in the ${event.name}, but distractions limited the impact. Still, God moved.`

  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "event_participation",
    result_text: resultText,
    stat_changes: { ...statGains, xp: xpGain, energy: -participation.energyCost, funds: -participation.fundsCost },
  })

  return NextResponse.json({
    success: true,
    isFullSuccess,
    resultText,
    xpGain,
    statGains,
    buffType: participation.rewards.buffType,
    buffBonus,
    buffDurationHours: participation.rewards.buffDurationHours,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    energyCost: participation.energyCost,
    fundsCost: participation.fundsCost,
  })
}
