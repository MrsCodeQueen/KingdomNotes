import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { lodgingId } = await request.json()
    if (!lodgingId) return NextResponse.json({ error: "Missing lodgingId" }, { status: 400 })

    const authHeader = request.headers.get("authorization")
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the user from auth header
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (!user || userError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get user's character
    const { data: character, error: charError } = await supabase
      .from("characters")
      .select("id, funds")
      .eq("user_id", user.id)
      .single()
    if (!character || charError) return NextResponse.json({ error: "Character not found" }, { status: 404 })

    // Get lodging details
    const { data: lodging, error: lodgingError } = await supabase
      .from("lodgings")
      .select("*")
      .eq("id", lodgingId)
      .single()
    if (!lodging || lodgingError) return NextResponse.json({ error: "Lodging not found" }, { status: 404 })

    // Check if player has enough funds
    if (character.funds < lodging.daily_rent) {
      return NextResponse.json(
        { error: `Insufficient funds. Daily rent: $${lodging.daily_rent}, you have: $${character.funds}` },
        { status: 400 }
      )
    }

    // Update character with new lodging and deduct daily rent
    const newFunds = character.funds - lodging.daily_rent
    const { error: updateError } = await supabase
      .from("characters")
      .update({
        current_lodging_id: lodgingId,
        funds: newFunds,
        energy: Math.min(100, (character.energy || 0) + lodging.energy_regen_bonus),
        anointing: (character.anointing || 0) + lodging.anointing_bonus,
      })
      .eq("id", character.id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({
      message: "Successfully rented housing",
      lodging: lodging.name,
      costDeducted: lodging.daily_rent,
      remainingFunds: newFunds,
    })
  } catch (error) {
    console.error("[v0] Housing rental error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
