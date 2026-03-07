import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { songIds, title } = await req.json()
  if (!songIds || !Array.isArray(songIds) || songIds.length < 3) {
    return NextResponse.json({ error: "Select at least 3 songs for an album" }, { status: 400 })
  }

  // Fetch character
  const { data: char } = await supabase.from("characters").select("*").eq("user_id", user.id).single()
  if (!char) return NextResponse.json({ error: "No character found" }, { status: 404 })

  // Studio cost: $50 base + $10 per track
  const studioCost = 50 + songIds.length * 10
  const currentFunds = Number(char.funds) || 0
  if (currentFunds < studioCost) {
    return NextResponse.json({ error: `Need $${studioCost} for studio time (base $50 + $10/track)` }, { status: 400 })
  }

  // Fetch the selected songs to calculate album quality
  const { data: songs } = await supabase
    .from("songs")
    .select("id, title, quality")
    .in("id", songIds)
    .eq("character_id", char.id)

  if (!songs || songs.length < 3) {
    return NextResponse.json({ error: "Could not find the selected songs" }, { status: 400 })
  }

  // Calculate album quality from song qualities
  const qualityScores: Record<string, number> = { masterpiece: 4, great: 3, good: 2, mediocre: 1 }
  const avgScore = songs.reduce((sum, s) => sum + (qualityScores[s.quality] || 1), 0) / songs.length
  let albumQuality = "good"
  if (avgScore >= 3.5) albumQuality = "masterpiece"
  else if (avgScore >= 2.5) albumQuality = "great"
  else if (avgScore >= 1.5) albumQuality = "good"
  else albumQuality = "mediocre"

  // Generate royalty income based on quality and track count
  const qualityMultiplier: Record<string, number> = { masterpiece: 2.5, great: 1.5, good: 1.0, mediocre: 0.5 }
  const baseIncome = 0.5 + songs.length * 0.15
  const albumIncome = Math.round(baseIncome * (qualityMultiplier[albumQuality] || 1) * 100) / 100

  // Generate album title if not provided
  const albumPrefixes = ["Songs from the", "Live from", "The", "Psalms of", "Revival at", "Worship from", "Altar of", "Into the", "Beyond the", "Heart of"]
  const albumSuffixes = ["Tabernacle", "Upper Room", "Valley", "Mountain", "Revival", "Throne Room", "Wilderness", "Harvest", "Promised Land", "Holy Ground", "Anointing"]
  const albumTitle = title || `${albumPrefixes[Math.floor(Math.random() * albumPrefixes.length)]} ${albumSuffixes[Math.floor(Math.random() * albumSuffixes.length)]}`

  // Create album
  const { data: album, error: albumError } = await supabase.from("albums").insert({
    character_id: char.id,
    user_id: user.id,
    title: albumTitle,
    song_count: songs.length,
    quality: albumQuality,
    income_per_tick: albumIncome,
  }).select("id").single()

  if (albumError) {
    console.log("[v0] Album insert error:", albumError)
    return NextResponse.json({ error: `Failed to create album: ${albumError.message}` }, { status: 500 })
  }

  // Link songs to album and mark them as recorded
  await supabase.from("songs").update({ album_id: album.id, recorded: true }).in("id", songIds)

  // Deduct studio cost
  await supabase.from("characters").update({
    funds: Math.round((currentFunds - studioCost) * 100) / 100,
  }).eq("id", char.id)

  // Create royalty stream for the album
  await supabase.from("royalties").insert({
    character_id: char.id,
    user_id: user.id,
    song_name: albumTitle,
    income_per_tick: albumIncome,
  })

  return NextResponse.json({
    success: true,
    album: {
      id: album.id,
      title: albumTitle,
      quality: albumQuality,
      songCount: songs.length,
      incomePerTick: albumIncome,
      studioCost,
    },
    resultText: `Album "${albumTitle}" recorded! ${songs.length} tracks, ${albumQuality} quality. Royalties: $${albumIncome}/tick. Studio cost: $${studioCost}.`,
  })
}
