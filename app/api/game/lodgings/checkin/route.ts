import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { lodgingId } = await request.json()
  if (!lodgingId) return NextResponse.json({ error: "Missing lodgingId" }, { status: 400 })

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()
  if (!character) return NextResponse.json({ error: "No character found" }, { status: 404 })

  const { data: lodging } = await supabase
    .from("lodgings")
    .select("*")
    .eq("id", lodgingId)
    .single()
  if (!lodging) return NextResponse.json({ error: "Lodging not found" }, { status: 404 })

  if (Number(character.funds) < lodging.daily_rent) {
    return NextResponse.json({ error: "Not enough funds" }, { status: 400 })
  }

  // Deduct rent and set current lodging
  const newFunds = Number(character.funds) - lodging.daily_rent
  await supabase
    .from("characters")
    .update({ funds: newFunds, current_lodging_id: lodgingId })
    .eq("id", character.id)

  return NextResponse.json({
    success: true,
    resultText: `Checked into ${lodging.name}! Energy regen +${lodging.energy_regen_bonus}%, Anointing +${lodging.anointing_bonus}.`,
    newFunds,
  })
}
