import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()

  // 1. Get the region from the URL search parameters
  const { searchParams } = new URL(request.url)
  const rawRegion = searchParams.get("region")

  if (!rawRegion) {
    return NextResponse.json({ error: "Region parameter is required" }, { status: 400 })
  }

  // Normalize region codes - handle both full names and abbreviations
  const regionMap: Record<string, string> = {
    "north_america": "na", "north america": "na",
    "europe": "eu",
    "africa": "af",
    "south_america": "sa", "south america": "sa",
    "asia": "as",
    "oceania": "oc",
    "na": "na", "eu": "eu", "af": "af", "sa": "sa", "as": "as", "oc": "oc",
  }
  const region = regionMap[rawRegion.toLowerCase()] || "na"

  // 2. Fetch only the lodgings assigned to that specific region
  const { data: lodgings, error } = await supabase
    .from("lodgings")
    .select("*")
    .eq("region", region)
    .order("daily_rent", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch lodgings" }, { status: 500 })
  }

  return NextResponse.json({ lodgings })
}
