import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { RANDOM_OPPORTUNITIES, rollRandomOpportunity } from "@/lib/game/constants"

// GET: Check for a new random opportunity
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!character) return NextResponse.json({ error: "No character" }, { status: 404 })

  const stats: Record<string, number> = {
    charisma: character.charisma,
    anointing: character.anointing,
    integrity_stat: character.integrity_stat,
    leadership: character.leadership,
    influence: character.influence,
  }

  const opportunity = rollRandomOpportunity(character.level, stats)
  if (!opportunity) return NextResponse.json({ opportunity: null })

  return NextResponse.json({
    opportunity,
    expiresAt: new Date(Date.now() + opportunity.duration * 60 * 1000).toISOString(),
  })
}

// POST: Accept an opportunity
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const oppId = body.opportunityId as string

  const opportunity = RANDOM_OPPORTUNITIES.find(o => o.id === oppId)
  if (!opportunity) return NextResponse.json({ error: "Invalid opportunity" }, { status: 400 })

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!character) return NextResponse.json({ error: "No character" }, { status: 404 })

  // Check requirements
  if (character.energy < opportunity.energyCost) {
    return NextResponse.json({ error: "Not enough energy" }, { status: 400 })
  }
  if (Number(character.funds) < opportunity.fundsCost) {
    return NextResponse.json({ error: "Not enough funds" }, { status: 400 })
  }
  if (character.level < opportunity.levelRequired) {
    return NextResponse.json({ error: "Level too low" }, { status: 400 })
  }
  if (opportunity.statRequired) {
    const val = (character as Record<string, unknown>)[opportunity.statRequired.key] as number
    if (val < opportunity.statRequired.value) {
      return NextResponse.json({ error: `Need ${opportunity.statRequired.key} ${opportunity.statRequired.value}+` }, { status: 400 })
    }
  }

  // Roll for success
  const succeeded = Math.random() <= opportunity.successRate
  const multiplier = succeeded ? 1 : 0.4 // Partial rewards on failure

  // Calculate rewards
  const xpGain = Math.floor(opportunity.rewards.xp * multiplier)
  const fundsGain = Math.round(opportunity.rewards.funds * multiplier * 100) / 100
  const statGains: Record<string, number> = {}

  const updates: Record<string, unknown> = {
    energy: character.energy - opportunity.energyCost,
    funds: Number(character.funds) - opportunity.fundsCost + fundsGain,
  }

  // Apply stat gains
  for (const [stat, value] of Object.entries(opportunity.rewards.statGains)) {
    const gain = Math.floor(value * multiplier)
    if (gain <= 0) continue
    statGains[stat] = gain
    const key = stat === "integrity" ? "integrity_stat" : stat
    const current = (character as Record<string, unknown>)[key] as number ?? 0
    updates[key] = key === "influence" ? current + gain : Math.min(100, current + gain)
  }

  // XP
  const newXp = (character.xp || 0) + xpGain
  updates.xp = newXp

  // Update character
  const { error: updateError } = await supabase.from("characters").update(updates).eq("id", character.id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Create buff if applicable and succeeded
  if (succeeded && opportunity.rewards.buffType && opportunity.rewards.buffStat) {
    await supabase.from("buffs").insert({
      character_id: character.id,
      user_id: user.id,
      buff_type: opportunity.rewards.buffType,
      stat_affected: opportunity.rewards.buffStat,
      bonus: opportunity.rewards.buffBonus || 10,
      expires_at: new Date(Date.now() + (opportunity.rewards.buffDurationHours || 4) * 60 * 60 * 1000).toISOString(),
    })
  }

  // Log it
  const resultText = succeeded
    ? `[OPPORTUNITY] ${opportunity.title}: ${opportunity.narrative} | Earned ${xpGain} XP, $${fundsGain.toFixed(2)}. ${Object.entries(statGains).map(([s, v]) => `${s} +${v}`).join(", ")}${opportunity.rewards.buffType ? ` | Buff: ${opportunity.rewards.buffType}` : ""}`
    : `[OPPORTUNITY] ${opportunity.title}: You gave it your best, but it didn't fully land. Partial rewards earned. ${xpGain} XP, $${fundsGain.toFixed(2)}.`

  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "opportunity",
    result_text: resultText,
    stat_changes: { ...statGains, xp: xpGain, funds: fundsGain - opportunity.fundsCost },
  })

  return NextResponse.json({
    success: true,
    fullSuccess: succeeded,
    narrative: opportunity.narrative,
    resultText,
    xpGain,
    fundsGain,
    statGains,
    buffGranted: succeeded ? opportunity.rewards.buffType : null,
    buffDuration: succeeded ? opportunity.rewards.buffDurationHours : null,
  })
}
