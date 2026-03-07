import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Simple GET endpoint for sendBeacon to mark offline
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const characterId = searchParams.get("characterId")

  if (action === "offline" && characterId) {
    const supabase = await createClient()
    await supabase
      .from("characters")
      .update({ is_online: false })
      .eq("id", characterId)
    
    return new Response("OK", { status: 200 })
  }

  return new Response("Bad Request", { status: 400 })
}

// POST endpoint for explicit online/offline status changes
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { action } = await request.json()

  const { data: char } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!char) {
    return NextResponse.json({ error: "No character" }, { status: 404 })
  }

  if (action === "online") {
    // Direct update instead of RPC to ensure it works
    const { error } = await supabase
      .from("characters")
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq("id", char.id)
    
    console.log("[v0] Presence update for", char.id, "- error:", error?.message)
    return NextResponse.json({ success: !error, status: "online", characterId: char.id })
  } else if (action === "offline") {
    await supabase
      .from("characters")
      .update({ is_online: false })
      .eq("id", char.id)
    return NextResponse.json({ success: true, status: "offline" })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
