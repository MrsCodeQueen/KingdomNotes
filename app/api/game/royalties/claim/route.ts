import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 1. Fetch character and their royalties with pending income
  const { data: character } = await supabase
    .from("characters")
    .select("id, funds, last_royalty_claim")
    .eq("user_id", user.id)
    .single()

  // We target rows with income > 0 to process
  const { data: royalties } = await supabase
    .from("royalties")
    .select("id, income_per_tick, total_earned, song_name")
    .eq("character_id", character?.id)
    .gt("income_per_tick", 0)

  if (!character || !royalties || royalties.length === 0) {
    return NextResponse.json({ error: "No royalties to claim" }, { status: 400 })
  }

  const grossAmount = royalties.reduce((sum, r) => sum + Number(r.income_per_tick), 0)
  const titheAmount = Math.round(grossAmount * 0.1 * 100) / 100
  const netAmount = grossAmount - titheAmount

  // 2. Update Character Funds + claim timestamp
  const { error: fundError } = await supabase
    .from("characters")
    .update({ funds: Number(character.funds) + netAmount, last_royalty_claim: new Date().toISOString() })
    .eq("id", character.id)

  if (fundError) return NextResponse.json({ error: "Fund update failed" }, { status: 500 })

  // 3. Reset pending income and update lifetime total
  // We use upsert with the 'id' column to force an update on existing rows
  const updates = royalties.map(r => ({
    id: r.id,
    character_id: character.id,
    user_id: user.id,
    song_name: r.song_name,
    total_earned: Number(r.total_earned) + Number(r.income_per_tick),
    income_per_tick: 0 // Resets the "current bucket" to 0
  }))

  const { error: royaltyUpdateError } = await supabase
    .from("royalties")
    .upsert(updates, { onConflict: 'id' }) // Explicitly target the primary key 'id'

  if (royaltyUpdateError) return NextResponse.json({ error: "Royalty reset failed" }, { status: 500 })

  // 4. Log the transaction with the Tithe acknowledgement
  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "royalty_claim",
    result_text: `Claimed $${grossAmount.toFixed(2)} in royalties. Tithed $${titheAmount.toFixed(2)} to the Kingdom. Net: $${netAmount.toFixed(2)} added to funds.`,
    stat_changes: { funds: netAmount },
  })

  // 5. Grant "Kingdom Favor" Buff for Tithing
  await supabase.from("buffs").insert({
    character_id: character.id,
    user_id: user.id,
    buff_type: "Kingdom Favor",
    stat_affected: "Anointing",
    bonus: 5,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  })

  return NextResponse.json({ success: true, netAmount, grossAmount, titheAmount, songCount: royalties.length })
}
