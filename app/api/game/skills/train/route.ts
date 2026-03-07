import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { CHARACTER_SKILLS, skillLevelFromXp, skillXpForLevel } from "@/lib/game/constants"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { skillKey } = await req.json()
  const skillDef = CHARACTER_SKILLS.find(s => s.key === skillKey)
  if (!skillDef) return NextResponse.json({ error: "Invalid skill" }, { status: 400 })

  const { data: char } = await supabase.from("characters").select("*").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  // Training costs energy
  const energyCost = 8
  if (char.energy < energyCost) {
    return NextResponse.json({ error: "Not enough energy to train. Rest first!" }, { status: 400 })
  }

  // Get or create skill row
  const { data: existing } = await supabase
    .from("character_skills")
    .select("*")
    .eq("character_id", char.id)
    .eq("skill_key", skillKey)
    .single()

  // XP gain from focused training (higher than activity passives)
  const baseXp = 15 + Math.floor(Math.random() * 20)
  // Diminishing returns at higher levels
  const currentLevel = existing ? skillLevelFromXp(existing.xp_in_skill || 0).level : 0
  const diminish = Math.max(0.3, 1 - currentLevel / 150)
  const xpGain = Math.max(5, Math.floor(baseXp * diminish))

  let newTotalXp: number
  let newLevel: number

  if (existing) {
    newTotalXp = (existing.xp_in_skill || 0) + xpGain
    const info = skillLevelFromXp(newTotalXp)
    newLevel = info.level
    await supabase.from("character_skills").update({
      xp_in_skill: newTotalXp,
      skill_level: newLevel,
      times_trained: (existing.times_trained || 0) + 1,
      last_trained_at: new Date().toISOString(),
    }).eq("id", existing.id)
  } else {
    newTotalXp = xpGain
    const info = skillLevelFromXp(newTotalXp)
    newLevel = info.level
    await supabase.from("character_skills").insert({
      character_id: char.id,
      user_id: user.id,
      skill_key: skillKey,
      xp_in_skill: newTotalXp,
      skill_level: newLevel,
      times_trained: 1,
      last_trained_at: new Date().toISOString(),
    })
  }

  // Deduct energy
  await supabase.from("characters").update({
    energy: char.energy - energyCost,
  }).eq("id", char.id)

  const leveledUp = existing ? newLevel > skillLevelFromXp(existing.xp_in_skill || 0).level : newLevel > 0
  const levelInfo = skillLevelFromXp(newTotalXp)

  return NextResponse.json({
    success: true,
    skillKey,
    skillName: skillDef.name,
    xpGained: xpGain,
    newTotalXp,
    newLevel,
    currentXp: levelInfo.currentXp,
    xpNeeded: levelInfo.xpNeeded,
    leveledUp,
    energyCost,
  })
}
