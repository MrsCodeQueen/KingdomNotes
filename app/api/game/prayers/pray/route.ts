import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST - Pray for a request (gives both parties favor)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: char } = await supabase
    .from("characters")
    .select("id, favor, anointing")
    .eq("user_id", user.id)
    .single()
  if (!char) return NextResponse.json({ error: "No character" }, { status: 404 })

  const { prayerId } = await request.json()
  if (!prayerId) return NextResponse.json({ error: "Prayer ID required" }, { status: 400 })

  // Get the prayer request
  const { data: prayer } = await supabase
    .from("prayer_requests")
    .select("id, character_id, prayer_count")
    .eq("id", prayerId)
    .single()

  if (!prayer) return NextResponse.json({ error: "Prayer request not found" }, { status: 404 })

  // Check if already prayed
  const { data: existing } = await supabase
    .from("prayer_interactions")
    .select("id")
    .eq("prayer_id", prayerId)
    .eq("character_id", char.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Already prayed for this request" }, { status: 400 })
  }

  // Record the prayer
  await supabase.from("prayer_interactions").insert({
    prayer_id: prayerId,
    character_id: char.id,
    user_id: user.id
  })

  // Update prayer count
  await supabase
    .from("prayer_requests")
    .update({ prayer_count: prayer.prayer_count + 1 })
    .eq("id", prayerId)

  // Give favor to the one who prayed (+2 favor, +1 anointing)
  await supabase
    .from("characters")
    .update({ 
      favor: (char.favor || 0) + 2,
      anointing: Math.min(100, (char.anointing || 0) + 1)
    })
    .eq("id", char.id)

  // Give favor to the one who requested prayer (+1 favor)
  if (prayer.character_id !== char.id) {
    await supabase
      .from("characters")
      .update({ favor: supabase.rpc ? undefined : 1 }) // Will use raw SQL instead
    
    await supabase.rpc("increment_favor", { char_id: prayer.character_id, amount: 1 }).catch(() => {
      // If RPC doesn't exist, do it manually
      supabase
        .from("characters")
        .select("favor")
        .eq("id", prayer.character_id)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase
              .from("characters")
              .update({ favor: (data.favor || 0) + 1 })
              .eq("id", prayer.character_id)
          }
        })
    })
  }

  return NextResponse.json({ 
    message: "Prayer lifted! +2 Favor, +1 Anointing",
    favorGained: 2,
    anointingGained: 1
  })
}
