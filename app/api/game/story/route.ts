import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { STORY_CHAPTERS } from "@/lib/game/constants"

// GET: Fetch story progress + determine which chapters are available
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: character } = await supabase
    .from("characters").select("*").eq("user_id", user.id).single()
  if (!character) return NextResponse.json({ error: "No character" }, { status: 404 })

  // Fetch existing progress
  const { data: progress } = await supabase
    .from("story_progress").select("*").eq("character_id", character.id)
  const progressMap = new Map((progress ?? []).map((p: { chapter_key: string }) => [p.chapter_key, p]))

  // Fetch song count and album count for unlock conditions
  const { count: songCount } = await supabase
    .from("songs").select("*", { count: "exact", head: true }).eq("character_id", character.id)
  const { count: albumCount } = await supabase
    .from("albums").select("*", { count: "exact", head: true }).eq("character_id", character.id)

  // Determine status for each chapter
  const chapters = STORY_CHAPTERS.map(ch => {
    const existing = progressMap.get(ch.key) as Record<string, unknown> | undefined
    if (existing) {
      return { ...ch, status: existing.status as string, choice_made: existing.choice_made as string | null }
    }

    // Check unlock conditions
    const cond = ch.unlockCondition
    let unlocked = true

    if (cond.level && character.level < cond.level) unlocked = false
    if (cond.stat) {
      const charVal = (character as Record<string, unknown>)[cond.stat.key] as number ?? 0
      if (charVal < cond.stat.value) unlocked = false
    }
    if (cond.chaptersCompleted) {
      for (const reqKey of cond.chaptersCompleted) {
        const reqProgress = progressMap.get(reqKey) as Record<string, unknown> | undefined
        if (!reqProgress || reqProgress.status !== "completed") unlocked = false
      }
    }
    if (cond.songsWritten && (songCount ?? 0) < cond.songsWritten) unlocked = false
    if (cond.albumsRecorded && (albumCount ?? 0) < cond.albumsRecorded) unlocked = false

    return { ...ch, status: unlocked ? "available" : "locked", choice_made: null }
  })

  return NextResponse.json({ chapters, character })
}

// POST: Make a story choice
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { chapterKey, choiceId } = await request.json()

  const chapter = STORY_CHAPTERS.find(ch => ch.key === chapterKey)
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 })

  const choice = chapter.choices.find(c => c.id === choiceId)
  if (!choice) return NextResponse.json({ error: "Invalid choice" }, { status: 400 })

  const { data: character } = await supabase
    .from("characters").select("*").eq("user_id", user.id).single()
  if (!character) return NextResponse.json({ error: "No character" }, { status: 404 })

  // Check if already completed
  const { data: existing } = await supabase
    .from("story_progress")
    .select("*")
    .eq("character_id", character.id)
    .eq("chapter_key", chapterKey)
    .single()

  if (existing && (existing as Record<string, unknown>).status === "completed") {
    return NextResponse.json({ error: "Chapter already completed" }, { status: 400 })
  }

  // Apply consequences
  const cons = choice.consequences
  const updates: Record<string, unknown> = {}

  if (cons.statChanges) {
    for (const [stat, val] of Object.entries(cons.statChanges)) {
      const currentVal = (character as Record<string, unknown>)[stat] as number ?? 0
      if (stat === "influence" || stat === "funds") {
        updates[stat] = Math.max(0, currentVal + val)
      } else {
        updates[stat] = Math.min(100, Math.max(0, currentVal + val))
      }
    }
  }
  if (cons.xpGain) {
    updates.xp = (character.xp || 0) + cons.xpGain
  }
  if (cons.fundsChange) {
    updates.funds = Math.max(0, Number(character.funds) + cons.fundsChange)
  }

  // Update character
  if (Object.keys(updates).length > 0) {
    await supabase.from("characters").update(updates).eq("id", character.id)
  }

  // Upsert story progress
  await supabase.from("story_progress").upsert({
    character_id: character.id,
    user_id: user.id,
    chapter_key: chapterKey,
    status: "completed",
    choice_made: choiceId,
    completed_at: new Date().toISOString(),
  }, { onConflict: "character_id,chapter_key" })

  // Add activity log
  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "story_choice",
    result_text: `[Story] ${chapter.title}: ${choice.label} -- ${cons.narrativeResult.slice(0, 120)}...`,
    stat_changes: cons.statChanges ?? {},
  })

  return NextResponse.json({
    success: true,
    narrativeResult: cons.narrativeResult,
    statChanges: cons.statChanges,
    xpGain: cons.xpGain,
    fundsChange: cons.fundsChange,
  })
}
