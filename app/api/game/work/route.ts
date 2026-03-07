import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { LOCAL_JOBS } from "@/lib/game/constants"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { jobId } = await request.json()
  const job = LOCAL_JOBS.find(j => j.id === jobId)
  if (!job) return NextResponse.json({ error: "Invalid job" }, { status: 400 })

  const { data: character, error: charErr } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (charErr || !character) return NextResponse.json({ error: "Character not found" }, { status: 404 })

  if (character.energy < job.energy) {
    return NextResponse.json({ error: "Not enough energy" }, { status: 400 })
  }

  // Check stat requirement
  if (job.req !== "none") {
    const statKey = job.req === "leadership" ? "leadership" : "charisma"
    if (character[statKey] < job.val) {
      return NextResponse.json({ error: `Requires ${job.req} ${job.val}+` }, { status: 400 })
    }
  }

  const newEnergy = character.energy - job.energy
  const newFunds = Number(character.funds) + job.pay
  const xpGain = Math.floor(job.pay * 0.3)
  const newXp = (character.xp || 0) + xpGain

  const { error: updateErr } = await supabase
    .from("characters")
    .update({ energy: newEnergy, funds: newFunds, xp: newXp })
    .eq("id", character.id)

  if (updateErr) return NextResponse.json({ error: "Failed to update" }, { status: 500 })

  const resultText = `Worked a shift as ${job.title}. Earned $${job.pay}. (-${job.energy} EN, +${xpGain} XP)`

  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "work",
    result_text: resultText,
    stat_changes: { funds: job.pay, energy: -job.energy, xp: xpGain },
  })

  return NextResponse.json({ success: true, resultText, earnings: job.pay })
}
