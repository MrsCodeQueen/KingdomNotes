import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { REGIONS } from "@/lib/game/constants"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { regionId } = await req.json()
  const region = REGIONS.find(r => r.id === regionId)
  if (!region) return NextResponse.json({ error: "Invalid region" }, { status: 400 })

  const { data: character } = await supabase.from("characters").select("*").eq("user_id", user.id).single()
  if (!character) return NextResponse.json({ error: "No character" }, { status: 404 })

  if (character.region === regionId) return NextResponse.json({ error: "Already here" }, { status: 400 })
  if (character.funds < region.travelCost || character.energy < 20) return NextResponse.json({ error: "Not enough resources" }, { status: 400 })

  const { error: updateError } = await supabase.from("characters").update({
    region: regionId,
    funds: Number(character.funds) - region.travelCost,
    energy: character.energy - 20
  }).eq("id", character.id)

  if (updateError) return NextResponse.json({ error: "Database error" }, { status: 500 })

  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "travel",
    result_text: `Journeyed to ${region.name}. Atmosphere: ${region.specialty}.`,
    stat_changes: { funds: -region.travelCost, energy: -20 }
  })

  return NextResponse.json({ success: true })
}