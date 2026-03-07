import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { action, minutes } = body

  const { data: character, error: charError } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (charError || !character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 })
  }

  if (action === "start") {
    if (character.energy < 20) {
      return NextResponse.json({ error: "Need at least 20 energy to fast" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("characters")
      .update({
        is_fasting: true,
        fast_started_at: new Date().toISOString(),
        fast_duration_minutes: minutes || 30,
        energy: Math.max(0, character.energy - 15),
      })
      .eq("id", character.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await supabase.from("activity_log").insert({
      character_id: character.id,
      user_id: user.id,
      action_type: "fasting_start",
      result_text: `You began a ${minutes}-minute fast. Energy drained, but your spirit grows stronger.`,
      stat_changes: { energy: -15 },
    })

    return NextResponse.json({ success: true, resultText: `Fast started for ${minutes} minutes.` })
  }

  if (action === "end") {
    const startTime = character.fast_started_at ? new Date(character.fast_started_at).getTime() : 0
    const endTime = startTime + (character.fast_duration_minutes * 60 * 1000)
    const isComplete = Date.now() >= endTime

    let anointingGain = 0
    let resultText = ""

    if (isComplete) {
      anointingGain = 20 + Math.floor(Math.random() * 20)
      resultText = `Fast complete! You feel a powerful surge of the Spirit. Anointing +${anointingGain}.`

      // Add post-fast buff
      await supabase.from("buffs").insert({
        character_id: character.id,
        user_id: user.id,
        buff_type: "Post-Fast Glow",
        stat_affected: "anointing",
        bonus: 15,
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      })
    } else {
      anointingGain = 5 + Math.floor(Math.random() * 5)
      resultText = `You ended your fast early. Gained a small blessing. Anointing +${anointingGain}.`
    }

    const { error: updateError } = await supabase
      .from("characters")
      .update({
        is_fasting: false,
        fast_started_at: null,
        fast_duration_minutes: 0,
        anointing: Math.min(100, character.anointing + anointingGain),
      })
      .eq("id", character.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await supabase.from("activity_log").insert({
      character_id: character.id,
      user_id: user.id,
      action_type: "fasting_end",
      result_text: resultText,
      stat_changes: { anointing: anointingGain },
    })

    return NextResponse.json({ success: true, resultText })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
