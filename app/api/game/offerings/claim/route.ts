import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: character } = await supabase
    .from("characters")
    .select("id, funds, followers, influence, anointing, last_offering_claim")
    .eq("user_id", user.id)
    .single()

  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 })

  // Calculate follower count from influence (influence roughly maps to follower growth)
  // Followers grow based on influence + anointing
  const baseFollowers = Math.max(character.followers, Math.floor(character.influence * 8 + character.anointing * 3))
  // Add some organic growth since last claim
  const lastClaim = character.last_offering_claim ? new Date(character.last_offering_claim) : new Date(Date.now() - 60000)
  const hoursSinceClaim = Math.max(0, (Date.now() - lastClaim.getTime()) / (1000 * 60 * 60))

  if (hoursSinceClaim < 0.01) {
    return NextResponse.json({ error: "Too soon to claim again" }, { status: 400 })
  }

  // Follower growth: small organic growth over time
  const newFollowers = Math.floor(Math.random() * Math.max(1, character.influence * 0.5) * Math.min(hoursSinceClaim, 24))
  const totalFollowers = baseFollowers + newFollowers

  // Offerings calculation: each follower gives a small amount per hour
  // Rate: $0.05 per follower per hour, scaled by anointing
  const anointingMultiplier = 1 + character.anointing * 0.01
  const hourlyRate = totalFollowers * 0.05 * anointingMultiplier
  const grossAmount = Math.round(hourlyRate * hoursSinceClaim * 100) / 100

  if (grossAmount < 0.01) {
    return NextResponse.json({ error: "No offerings accumulated yet" }, { status: 400 })
  }

  // Tithe 10% back to God
  const titheAmount = Math.round(grossAmount * 0.1 * 100) / 100
  const netAmount = Math.round((grossAmount - titheAmount) * 100) / 100

  // Update character
  const { error: updateError } = await supabase
    .from("characters")
    .update({
      funds: Number(character.funds) + netAmount,
      followers: totalFollowers,
      last_offering_claim: new Date().toISOString(),
    })
    .eq("id", character.id)

  if (updateError) return NextResponse.json({ error: "Update failed" }, { status: 500 })

  // Log the offering
  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "offering_claim",
    result_text: `Claimed $${grossAmount.toFixed(2)} in follower offerings from ${totalFollowers.toLocaleString()} followers. Tithed $${titheAmount.toFixed(2)} to the Kingdom. Net: $${netAmount.toFixed(2)}.`,
    stat_changes: { funds: netAmount, followers: newFollowers },
  })

  // Grant a Generosity buff for tithing offerings
  await supabase.from("buffs").insert({
    character_id: character.id,
    user_id: user.id,
    buff_type: "Generosity Blessing",
    stat_affected: "influence",
    bonus: 8,
    expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  })

  return NextResponse.json({
    success: true,
    netAmount,
    grossAmount,
    titheAmount,
    followers: totalFollowers,
    newFollowers,
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    hoursSinceClaim: Math.round(hoursSinceClaim * 100) / 100,
  })
}
