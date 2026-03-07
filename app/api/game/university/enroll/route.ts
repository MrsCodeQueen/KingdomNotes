import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { UNIVERSITY_CLASSES } from "@/lib/game/constants"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { classId } = await req.json()
  const cls = UNIVERSITY_CLASSES.find(c => c.id === classId)
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 400 })

  const { data: char } = await supabase.from("characters").select("*").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character found" }, { status: 404 })

  const hasScholarship = (char.integrity_stat || 0) >= 25 || (char.anointing || 0) >= 40
  const finalCost = hasScholarship ? cls.cost * 0.5 : cls.cost
  const currentFunds = Number(char.funds) || 0

  if (currentFunds < finalCost) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })

  const currentStat = Number(char[cls.stat]) || 0
  const newStatValue = Math.min(100, currentStat + cls.boost)
  const newFunds = Math.round((currentFunds - finalCost) * 100) / 100

  const { error } = await supabase.from("characters").update({
    funds: newFunds,
    [cls.stat]: newStatValue
  }).eq("id", char.id)

  if (error) {
    console.log("[v0] University enroll DB error:", error)
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    stat: cls.stat, 
    boost: cls.boost, 
    newValue: newStatValue,
    scholarship: hasScholarship 
  })
}
