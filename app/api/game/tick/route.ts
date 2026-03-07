import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Security Check for Cron Trigger
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()

  // 1. Fetch all royalties and join with their respective character stats
  // This fetch ensures we get all royalties for recorded songs
  const { data: activeRoyalties, error: fetchError } = await supabase
    .from("royalties")
    .select(`
      id, 
      income_per_tick, 
      character_id,
      characters (
        anointing,
        charisma,
        level
      )
    `)

  if (fetchError || !activeRoyalties) {
    return NextResponse.json({ error: "Failed to fetch active royalties" }, { status: 500 })
  }

  // 2. Calculate the "Earnings Increase" for this tick
  const updates = activeRoyalties.map((item) => {
    const stats = item.characters as any

    // Logic: Base pay + (Anointing * 0.15) + (Charisma * 0.10)
    const baseEarnings = 0.50
    const anointingBonus = stats.anointing * 0.15
    const charismaBonus = stats.charisma * 0.10

    const tickIncrease = Math.round((baseEarnings + anointingBonus + charismaBonus) * 100) / 100

    return {
      id: item.id,
      character_id: item.character_id,
      income_per_tick: Number(item.income_per_tick) + tickIncrease
    }
  })

  // 3. Bulk Update the database using upsert on the primary key 'id'
  const { error: updateError } = await supabase
    .from("royalties")
    .upsert(updates, { onConflict: 'id' })

  if (updateError) {
    return NextResponse.json({ error: "Tick accumulation failed" }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: `Processed growth for ${activeRoyalties.length} songs.`
  })
}