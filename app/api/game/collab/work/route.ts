import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { collabId } = await request.json()
  if (!collabId) return NextResponse.json({ error: "Missing collabId" }, { status: 400 })

  // Get the character
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()
  if (!character) return NextResponse.json({ error: "No character found" }, { status: 404 })
  if (character.energy < 20) return NextResponse.json({ error: "Not enough energy" }, { status: 400 })

  // Get the collab
  const { data: collab } = await supabase
    .from("collaborations")
    .select("*")
    .eq("id", collabId)
    .single()
  if (!collab) return NextResponse.json({ error: "Collab not found" }, { status: 404 })

  const socialStat = (character as Record<string, unknown>).social_stat as number || 0
  const progressGain = 10 + Math.floor(socialStat / 5)
  const newProgress = Math.min(100, collab.progress + progressGain)

  // Update character energy
  await supabase
    .from("characters")
    .update({ energy: character.energy - 20 })
    .eq("id", character.id)

  // Update collab progress
  await supabase
    .from("collaborations")
    .update({ progress: newProgress })
    .eq("id", collabId)

  let resultText = `You worked on "${collab.project_name}". Progress: ${newProgress}%`

  // If completed, reward both players
  if (newProgress >= 100) {
    await supabase
      .from("collaborations")
      .update({ progress: 100, status: "completed" })
      .eq("id", collabId)

    const xpReward = 500
    const influenceReward = 100

    // Reward the current character
    await supabase
      .from("characters")
      .update({
        xp: character.xp + xpReward,
        influence: character.influence + influenceReward,
      })
      .eq("id", character.id)

    resultText = `COLLAB COMPLETE! "${collab.project_name}" is finished! Both artists earned +${xpReward} XP and +${influenceReward} Influence.`
  }

  return NextResponse.json({ success: true, resultText, progress: newProgress })
}
