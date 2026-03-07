import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const VALID_STATS = ["anointing", "integrity_stat", "charisma", "leadership"]

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { skillId } = await req.json()
  if (!VALID_STATS.includes(skillId)) {
    return NextResponse.json({ error: "Invalid stat" }, { status: 400 })
  }

  const { data: char } = await supabase.from("characters").select("*").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  // Skill points = level - 1 - points already used
  const available = Math.max(0, (char.level || 1) - 1 - (char.skill_points_used || 0))
  if (available <= 0) {
    return NextResponse.json({ error: "No skill points available. Level up to earn more!" }, { status: 400 })
  }

  const currentVal = Number(char[skillId]) || 0
  if (currentVal >= 100) {
    return NextResponse.json({ error: "Stat already at maximum" }, { status: 400 })
  }

  const boost = 5
  const newVal = Math.min(100, currentVal + boost)

  const { error } = await supabase.from("characters").update({
    [skillId]: newVal,
    skill_points_used: (char.skill_points_used || 0) + 1,
  }).eq("id", char.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    stat: skillId,
    oldValue: currentVal,
    newValue: newVal,
    pointsRemaining: available - 1,
  })
}
