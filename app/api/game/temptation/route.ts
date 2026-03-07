import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { temptationId, choice } = await req.json()

  // 1. Fetch character and the temptation event
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const { data: event } = await supabase
    .from("temptation_events")
    .select("*")
    .eq("id", temptationId)
    .single()

  if (!character || !event) return NextResponse.json({ error: "Context not found" }, { status: 404 })

  let updates: any = {}
  let logText = ""

  if (choice === "yield") {
    // Apply rewards (e.g., +Funds) and penalties (e.g., -Anointing, -Integrity)
    updates = {
      funds: Number(character.funds) + (event.yieldReward.funds || 0),
      anointing: Math.max(0, character.anointing - (event.yieldPenalty.anointing || 0)),
      integrity_stat: Math.max(0, character.integrity_stat - (event.yieldPenalty.integrity_stat || 0)),
      influence: Number(character.influence) + (event.yieldReward.influence || 0)
    }
    logText = `Yielded to temptation: ${event.yield_label}. Gained worldly success but felt the Spirit grieve.`
  } else {
    // Apply resist rewards (e.g., +Integrity, +Anointing)
    updates = {
      integrity_stat: character.integrity_stat + (event.resistReward.integrity_stat || 2),
      anointing: character.anointing + (event.resistReward.anointing || 1),
      xp: character.xp + 25
    }
    logText = `Resisted temptation! Your integrity grows as you walk the narrow road.`
  }

  // 2. Update Character
  const { error: updateError } = await supabase
    .from("characters")
    .update(updates)
    .eq("id", character.id)

  if (updateError) return NextResponse.json({ error: "Update failed" }, { status: 500 })

  // 3. Log the decision
  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "temptation_resolved",
    result_text: logText,
    stat_changes: choice === "yield" ? event.yieldReward : event.resistReward
  })

  return NextResponse.json({ success: true, choice })
}