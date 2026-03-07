import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Fetch prayer requests
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("id").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get("filter") || "all" // all, mine, answered

  let query = supabase
    .from("prayer_requests")
    .select(`
      *,
      character:characters!prayer_requests_character_id_fkey(id, artist_name)
    `)
    .order("created_at", { ascending: false })
    .limit(30)

  if (filter === "mine") {
    query = query.eq("character_id", char.id)
  } else if (filter === "answered") {
    query = query.eq("answered", true)
  } else {
    query = query.eq("answered", false)
  }

  const { data: prayers } = await query

  // Get which prayers user has prayed for
  const { data: myPrayers } = await supabase
    .from("prayer_interactions")
    .select("prayer_id")
    .eq("character_id", char.id)

  const prayedSet = new Set(myPrayers?.map(p => p.prayer_id) || [])

  const enrichedPrayers = prayers?.map(p => ({
    ...p,
    hasPrayed: prayedSet.has(p.id),
    isOwn: p.character_id === char.id
  })) || []

  return NextResponse.json({ prayers: enrichedPrayers, characterId: char.id })
}

// POST - Create a prayer request
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("id").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  const { title, content, isPublic } = await request.json()

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 })
  }

  const { data: prayer, error } = await supabase
    .from("prayer_requests")
    .insert({
      character_id: char.id,
      user_id: user.id,
      title,
      content,
      is_public: isPublic !== false
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ prayer, message: "Prayer request submitted" })
}
