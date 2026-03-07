import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getRegionalRivals } from "@/lib/game/constants"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region") || "Atlanta"
  const sortBy = searchParams.get("sortBy") || "influence"

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real players from the database with online status
  // We select the top players sorted by the chosen stat
  const validSortColumns = ["influence", "anointing", "charisma", "funds", "followers", "favor", "level"]
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "influence"

  // Clean up offline players first (inactive for 15+ minutes) - ignore errors
  await supabase.rpc("cleanup_offline_players").catch(() => {})

  const { data: realPlayers, error } = await supabase
    .from("characters")
    .select("id, user_id, artist_name, region, influence, anointing, charisma, funds, followers, favor, level, is_online, last_seen")
    .not("user_id", "is", null) // Only get real players with user accounts
    .order(sortColumn, { ascending: false })
    .limit(50)

  console.log("[v0] Leaderboard query - realPlayers count:", realPlayers?.length, "error:", error?.message)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get NPCs for this region as fallback/filler
  const npcRivals = getRegionalRivals(region)

  // Transform real players into leaderboard format
  const playerEntries = (realPlayers || []).map((player, index) => ({
    id: player.id,
    name: player.artist_name,
    region: player.region,
    influence: player.influence,
    anointing: player.anointing,
    charisma: player.charisma,
    funds: player.funds,
    followers: player.followers || 0,
    favor: player.favor || 0,
    level: player.level || 1,
    isPlayer: true,
    isCurrentUser: user ? player.user_id === user.id : false,
    isOnline: player.is_online || false,
    lastSeen: player.last_seen,
    rank: index + 1,
  }))

  // Transform NPCs (use them to fill out the leaderboard if needed)
  const npcEntries = npcRivals.map((npc, index) => ({
    id: `npc-${npc.name.toLowerCase().replace(/\s/g, "-")}`,
    name: npc.name,
    region: region,
    influence: npc.influence,
    anointing: npc.anointing || Math.floor(npc.influence * 0.8),
    charisma: npc.charisma || Math.floor(npc.influence * 0.6),
    funds: Math.floor(npc.influence * 10),
    followers: Math.floor(npc.influence * 5),
    favor: Math.floor(npc.influence * 0.3),
    level: Math.max(1, Math.floor(npc.influence / 20)),
    isPlayer: false,
    isCurrentUser: false,
    rank: playerEntries.length + index + 1,
  }))

  // Merge and sort all entries
  const allEntries = [...playerEntries, ...npcEntries]
    .sort((a, b) => {
      const aVal = a[sortColumn as keyof typeof a] as number
      const bVal = b[sortColumn as keyof typeof b] as number
      return bVal - aVal
    })
    .slice(0, 20)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  // Get online players for a separate "Online Now" section
  const onlinePlayers = playerEntries.filter(p => p.isOnline && !p.isCurrentUser)

  return NextResponse.json({
    leaderboard: allEntries,
    onlinePlayers,
    sortBy: sortColumn,
    region,
    totalPlayers: realPlayers?.length || 0,
    onlineCount: onlinePlayers.length,
  })
}
