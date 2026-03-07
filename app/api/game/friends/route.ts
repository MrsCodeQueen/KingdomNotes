import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Fetch friends and friend requests
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("id").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  // Get accepted friend requests (both directions)
  const { data: friendships } = await supabase
    .from("friend_requests")
    .select(`
      id,
      sender_id,
      receiver_id,
      sender:characters!friend_requests_sender_id_fkey(id, artist_name, level, region),
      receiver:characters!friend_requests_receiver_id_fkey(id, artist_name, level, region)
    `)
    .eq("status", "accepted")
    .or(`sender_id.eq.${char.id},receiver_id.eq.${char.id}`)

  // Transform to friend list
  const friends = friendships?.map(f => {
    const isSender = f.sender_id === char.id
    const friend = isSender ? f.receiver : f.sender
    return {
      friendshipId: f.id,
      ...friend
    }
  }) || []

  // Get pending requests received
  const { data: pendingReceived } = await supabase
    .from("friend_requests")
    .select(`
      id,
      created_at,
      sender:characters!friend_requests_sender_id_fkey(id, artist_name, level, region)
    `)
    .eq("receiver_id", char.id)
    .eq("status", "pending")

  // Get pending requests sent
  const { data: pendingSent } = await supabase
    .from("friend_requests")
    .select(`
      id,
      created_at,
      receiver:characters!friend_requests_receiver_id_fkey(id, artist_name, level, region)
    `)
    .eq("sender_id", char.id)
    .eq("status", "pending")

  return NextResponse.json({
    friends,
    pendingReceived: pendingReceived || [],
    pendingSent: pendingSent || [],
    characterId: char.id
  })
}

// POST - Send friend request
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("id").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  const { receiverId } = await request.json()
  if (!receiverId) return NextResponse.json({ error: "Receiver ID required" }, { status: 400 })
  if (receiverId === char.id) return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 })

  // Check if request already exists
  const { data: existing } = await supabase
    .from("friend_requests")
    .select("id, status")
    .or(`and(sender_id.eq.${char.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${char.id})`)
    .single()

  if (existing) {
    if (existing.status === "accepted") {
      return NextResponse.json({ error: "Already friends" }, { status: 400 })
    }
    return NextResponse.json({ error: "Friend request already pending" }, { status: 400 })
  }

  const { error } = await supabase.from("friend_requests").insert({
    sender_id: char.id,
    receiver_id: receiverId,
    status: "pending"
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: "Friend request sent!" })
}

// PATCH - Accept/decline friend request
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase.from("characters").select("id").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  const { requestId, action } = await request.json()
  if (!requestId || !action) return NextResponse.json({ error: "Request ID and action required" }, { status: 400 })

  // Verify request exists and user is receiver
  const { data: req } = await supabase
    .from("friend_requests")
    .select("id, receiver_id, status")
    .eq("id", requestId)
    .single()

  if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 })
  if (req.receiver_id !== char.id) return NextResponse.json({ error: "Not your request" }, { status: 403 })
  if (req.status !== "pending") return NextResponse.json({ error: "Request already processed" }, { status: 400 })

  const newStatus = action === "accept" ? "accepted" : "declined"

  const { error } = await supabase
    .from("friend_requests")
    .update({ status: newStatus, responded_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: action === "accept" ? "Friend request accepted!" : "Friend request declined" })
}
