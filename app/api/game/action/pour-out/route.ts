import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("*").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character found" }, { status: 404 })

  if (char.anointing < 100) return NextResponse.json({ error: "Vessel is not full." }, { status: 400 })

  const { error: updateError } = await supabase.from("characters").update({
    anointing: 0,
    influence: char.influence + 50,
    current_activity: "Poured Out Heart"
  }).eq("id", char.id)

  if (updateError) return NextResponse.json({ error: "Action failed" }, { status: 500 })

  await supabase.from("activity_log").insert({
    character_id: char.id,
    user_id: user.id,
    action_type: "pour_out",
    result_text: "You poured out your anointing before God. Influence expanded by 50.",
    stat_changes: { anointing: -100, influence: 50 },
  })

  return NextResponse.json({ success: true })
}
