import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Fetch fellowship groups
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")

  // Get user's character
  const { data: char } = await supabase.from("characters").select("id").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  // Get all groups (optionally filtered by region)
  let query = supabase
    .from("fellowship_groups")
    .select(`
      *,
      leader:characters!fellowship_groups_leader_id_fkey(id, artist_name)
    `)
    .order("member_count", { ascending: false })

  if (region) {
    query = query.eq("region", region)
  }

  const { data: groups } = await query.limit(20)

  // Get user's memberships
  const { data: memberships } = await supabase
    .from("fellowship_members")
    .select("group_id, role")
    .eq("character_id", char.id)

  const membershipMap = new Map(memberships?.map(m => [m.group_id, m.role]) || [])

  const enrichedGroups = groups?.map(g => ({
    ...g,
    isMember: membershipMap.has(g.id),
    myRole: membershipMap.get(g.id) || null,
    isLeader: g.leader_id === char.id
  })) || []

  return NextResponse.json({ groups: enrichedGroups, characterId: char.id })
}

// POST - Create a new fellowship group
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("id, region, leadership").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  // Need leadership 10+ to create a group
  if ((char.leadership || 0) < 10) {
    return NextResponse.json({ error: "Need Leadership 10+ to start a fellowship" }, { status: 400 })
  }

  const body = await request.json()
  const { name, description, group_type } = body

  if (!name || name.length < 3) {
    return NextResponse.json({ error: "Name must be at least 3 characters" }, { status: 400 })
  }

  const { data: group, error } = await supabase
    .from("fellowship_groups")
    .insert({
      name,
      description: description || "",
      leader_id: char.id,
      group_type: group_type || "worship_team",
      region: char.region,
      member_count: 1
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A fellowship with that name already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Add leader as first member
  await supabase.from("fellowship_members").insert({
    group_id: group.id,
    character_id: char.id,
    user_id: user.id,
    role: "leader"
  })

  return NextResponse.json({ group, message: "Fellowship created!" })
}
