import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: character } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 })
  }

  const { data: royalties } = await supabase
    .from("royalties")
    .select("*")
    .eq("character_id", character.id)
    .order("created_at", { ascending: false })

  return NextResponse.json({ royalties: royalties ?? [] })
}
