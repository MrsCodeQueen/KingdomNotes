import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST - Join a fellowship group
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("id").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  const { groupId } = await request.json()
  if (!groupId) return NextResponse.json({ error: "Group ID required" }, { status: 400 })

  // Check if group exists and has space
  const { data: group } = await supabase
    .from("fellowship_groups")
    .select("id, name, member_count, max_members")
    .eq("id", groupId)
    .single()

  if (!group) return NextResponse.json({ error: "Fellowship not found" }, { status: 404 })
  if (group.member_count >= group.max_members) {
    return NextResponse.json({ error: "Fellowship is full" }, { status: 400 })
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("fellowship_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("character_id", char.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 })
  }

  // Join the group
  const { error } = await supabase.from("fellowship_members").insert({
    group_id: groupId,
    character_id: char.id,
    user_id: user.id,
    role: "member"
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update member count
  await supabase
    .from("fellowship_groups")
    .update({ member_count: group.member_count + 1 })
    .eq("id", groupId)

  return NextResponse.json({ message: `Joined ${group.name}!` })
}

// DELETE - Leave a fellowship group
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("id").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get("groupId")
  if (!groupId) return NextResponse.json({ error: "Group ID required" }, { status: 400 })

  // Check if user is the leader
  const { data: group } = await supabase
    .from("fellowship_groups")
    .select("id, leader_id, member_count")
    .eq("id", groupId)
    .single()

  if (!group) return NextResponse.json({ error: "Fellowship not found" }, { status: 404 })
  if (group.leader_id === char.id) {
    return NextResponse.json({ error: "Leaders cannot leave. Transfer leadership or disband the fellowship." }, { status: 400 })
  }

  // Leave the group
  const { error } = await supabase
    .from("fellowship_members")
    .delete()
    .eq("group_id", groupId)
    .eq("character_id", char.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update member count
  await supabase
    .from("fellowship_groups")
    .update({ member_count: Math.max(1, group.member_count - 1) })
    .eq("id", groupId)

  return NextResponse.json({ message: "Left the fellowship" })
}
