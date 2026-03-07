import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { UNIVERSITY_CLASSES } from "@/lib/game/constants"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { classId } = await request.json()
  const uniClass = UNIVERSITY_CLASSES.find(c => c.id === classId)
  if (!uniClass) return NextResponse.json({ error: "Invalid class" }, { status: 400 })

  const { data: character, error: charErr } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (charErr || !character) return NextResponse.json({ error: "Character not found" }, { status: 404 })

  if (Number(character.funds) < uniClass.cost) {
    return NextResponse.json({ error: "Not enough funds" }, { status: 400 })
  }

  const newFunds = Number(character.funds) - uniClass.cost
  const statKey = uniClass.stat === "anointing" ? "anointing" :
    uniClass.stat === "charisma" ? "charisma" : "leadership"
  const newStatVal = Math.min(100, character[statKey] + uniClass.boost)
  const xpGain = uniClass.boost * 5
  const newXp = (character.xp || 0) + xpGain

  const { error: updateErr } = await supabase
    .from("characters")
    .update({ funds: newFunds, [statKey]: newStatVal, xp: newXp })
    .eq("id", character.id)

  if (updateErr) return NextResponse.json({ error: "Failed to update" }, { status: 500 })

  const resultText = `Completed ${uniClass.name} at the university. ${uniClass.stat.charAt(0).toUpperCase() + uniClass.stat.slice(1)} +${uniClass.boost}. (-$${uniClass.cost}, +${xpGain} XP)`

  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "university",
    result_text: resultText,
    stat_changes: { funds: -uniClass.cost, [statKey]: uniClass.boost, xp: xpGain },
  })

  return NextResponse.json({ success: true, resultText, statBoosted: uniClass.stat, boost: uniClass.boost })
}
