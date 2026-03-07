import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  // 1. Authentication Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 2. Parse Request
  const body = await request.json()
  const { songId } = body
  if (!songId) return NextResponse.json({ error: "Missing songId" }, { status: 400 })

  // 3. Verify Song and Character Context
  // Ensure the song belongs to the user and is already recorded
  const { data: song, error: songError } = await supabase
    .from("songs")
    .select("id, character_id, recorded, quality, title")
    .eq("id", songId)
    .eq("user_id", user.id)
    .single()

  if (songError || !song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 })
  }

  if (!song.recorded) {
    return NextResponse.json({ error: "Only recorded songs can be promoted" }, { status: 400 })
  }

  // 4. Check Character Resources
  const { data: character, error: charError } = await supabase
    .from("characters")
    .select("id, energy, influence, charisma")
    .eq("user_id", user.id)
    .single()

  if (charError || !character) {
    return NextResponse.json({ error: "Character context not found" }, { status: 404 })
  }

  // Promotion requires 15 Energy as per dashboard logic
  if (character.energy < 15) {
    return NextResponse.json({ error: "Insufficient Energy (Need 15)" }, { status: 400 })
  }

  // 5. Calculate Gains based on Quality
  // Better quality songs generate more Influence when promoted
  const qualityMultiplier: Record<string, number> = {
    mediocre: 1,
    good: 2,
    great: 4,
    masterpiece: 8,
  }

  const baseInfluence = Math.floor(Math.random() * 3) + 2; // Base 2-4
  const influenceGain = baseInfluence * (qualityMultiplier[song.quality] ?? 1)
  const charismaGain = Math.floor(Math.random() * 2) + 1; // Base 1-2

  // 6. Update Database
  const { error: updateError } = await supabase
    .from("characters")
    .update({
      energy: character.energy - 15,
      influence: character.influence + influenceGain,
      charisma: Math.min(100, character.charisma + charismaGain),
    })
    .eq("id", character.id)

  if (updateError) {
    return NextResponse.json({ error: "Failed to update character stats" }, { status: 500 })
  }

  // 7. Log Activity
  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "promote_song",
    result_text: `Promoted "${song.title}" and gained ${influenceGain} Influence and ${charismaGain} Charisma.`,
    stat_changes: { energy: -15, influence: influenceGain, charisma: charismaGain },
  })

  // 8. Return Results
  return NextResponse.json({
    success: true,
    influenceGain,
    charismaGain,
    newEnergy: character.energy - 15
  })
}