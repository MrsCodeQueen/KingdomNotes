import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Expanded job listings matching the WorkPanel
const ALL_JOBS = [
  // Entry Level
  { id: "barista", title: "Local Barista", pay: 25, energy: 35, req: "none", val: 0, leadershipGain: 0 },
  { id: "janitor", title: "Church Janitor", pay: 20, energy: 30, req: "none", val: 0, leadershipGain: 1 },
  { id: "greeter", title: "Church Greeter", pay: 15, energy: 20, req: "none", val: 0, leadershipGain: 1 },
  // Skilled
  { id: "office", title: "Admin Assistant", pay: 60, energy: 45, req: "leadership", val: 10, leadershipGain: 2 },
  { id: "tutor", title: "Music Tutor", pay: 110, energy: 30, req: "charisma", val: 20, leadershipGain: 2 },
  { id: "sound_tech", title: "Sound Technician", pay: 75, energy: 40, req: "charisma", val: 15, leadershipGain: 1 },
  { id: "worship_coord", title: "Worship Coordinator", pay: 90, energy: 50, req: "leadership", val: 15, leadershipGain: 3 },
  // Professional
  { id: "music_director", title: "Music Director", pay: 180, energy: 55, req: "leadership", val: 25, leadershipGain: 4 },
  { id: "youth_pastor", title: "Youth Music Pastor", pay: 150, energy: 50, req: "leadership", val: 20, leadershipGain: 5 },
  { id: "studio_engineer", title: "Studio Engineer", pay: 200, energy: 45, req: "charisma", val: 30, leadershipGain: 2 },
  { id: "tour_manager", title: "Tour Manager", pay: 250, energy: 60, req: "leadership", val: 30, leadershipGain: 5 },
  // Executive
  { id: "worship_pastor", title: "Worship Pastor", pay: 350, energy: 65, req: "leadership", val: 40, leadershipGain: 6 },
  { id: "label_exec", title: "Label Executive", pay: 500, energy: 70, req: "leadership", val: 50, leadershipGain: 8 },
  { id: "ministry_head", title: "Ministry Director", pay: 400, energy: 60, req: "leadership", val: 45, leadershipGain: 7 },
]

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { jobId } = await req.json()
  const job = ALL_JOBS.find(j => j.id === jobId)
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 400 })

  const { data: char, error: charError } = await supabase.from("characters").select("*").eq("user_id", user.id).single()
  if (!char || charError) {
    return NextResponse.json({ error: "No character found" }, { status: 404 })
  }

  // Ensure energy is a valid number
  const charEnergy = Number(char.energy) || 0
  const jobEnergy = Number(job.energy) || 0

  // Check requirements
  if (job.req !== "none") {
    const reqValue = Number(char[job.req]) || 0
    if (reqValue < job.val) {
      return NextResponse.json({ error: `Need ${job.req} ${job.val}+ (You have ${reqValue})` }, { status: 400 })
    }
  }

  if (charEnergy < jobEnergy) {
    return NextResponse.json({ error: `Not enough energy. You have ${charEnergy}, need ${jobEnergy}.` }, { status: 400 })
  }

  const newEnergy = charEnergy - jobEnergy
  const newFunds = Number(char.funds) + job.pay
  const newLeadership = Math.min(100, Number(char.leadership || 0) + job.leadershipGain)

  const updateData: Record<string, number> = {
    energy: newEnergy,
    funds: newFunds,
  }

  // Only update leadership if there's a gain
  if (job.leadershipGain > 0) {
    updateData.leadership = newLeadership
  }

  const { error } = await supabase.from("characters").update(updateData).eq("id", char.id)

  if (error) return NextResponse.json({ error: "Database error" }, { status: 500 })

  // Log the activity
  const statChanges: Record<string, number> = { energy: -job.energy, funds: job.pay }
  if (job.leadershipGain > 0) {
    statChanges.leadership = job.leadershipGain
  }

  await supabase.from("activity_log").insert({
    character_id: char.id,
    user_id: user.id,
    action_type: "work",
    result_text: `Worked as ${job.title}. Earned $${job.pay}${job.leadershipGain > 0 ? ` and +${job.leadershipGain} Leadership` : ""}.`,
    stat_changes: statChanges,
  }).catch(() => {})

  return NextResponse.json({
    success: true,
    resultText: `Completed a shift as ${job.title}. Earned $${job.pay}!${job.leadershipGain > 0 ? ` +${job.leadershipGain} Leadership.` : ""} Energy -${job.energy}.`,
    leadershipGain: job.leadershipGain,
  })
}
