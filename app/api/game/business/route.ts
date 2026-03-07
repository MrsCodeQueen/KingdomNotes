import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BUSINESS_TYPES: Record<string, { name: string; startupCost: number; dailyIncome: number; levelRequired: number; leadershipRequired: number; charismaRequired: number }> = {
  music_studio: { name: "Recording Studio", startupCost: 5000, dailyIncome: 150, levelRequired: 8, leadershipRequired: 15, charismaRequired: 20 },
  music_store: { name: "Gospel Music Store", startupCost: 3000, dailyIncome: 80, levelRequired: 5, leadershipRequired: 10, charismaRequired: 15 },
  radio_station: { name: "Gospel Radio Station", startupCost: 10000, dailyIncome: 250, levelRequired: 12, leadershipRequired: 25, charismaRequired: 30 },
  worship_school: { name: "Worship School", startupCost: 7500, dailyIncome: 180, levelRequired: 10, leadershipRequired: 20, charismaRequired: 25 },
  record_label: { name: "Record Label", startupCost: 25000, dailyIncome: 500, levelRequired: 18, leadershipRequired: 35, charismaRequired: 40 },
}

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get character
  const { data: character } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 })
  }

  // Get owned businesses
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("character_id", character.id)

  // Calculate uncollected income (based on time since last collection)
  let uncollectedIncome = 0
  if (businesses && businesses.length > 0) {
    const now = new Date()
    for (const biz of businesses) {
      const lastCollected = new Date(biz.last_collected_at || biz.created_at)
      const hoursSinceCollection = (now.getTime() - lastCollected.getTime()) / (1000 * 60 * 60)
      const daysIncome = Math.min(hoursSinceCollection / 24, 7) // Max 7 days accumulation
      uncollectedIncome += Math.floor(biz.daily_income * daysIncome)
    }
  }

  return NextResponse.json({ 
    businesses: businesses || [], 
    uncollectedIncome 
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { action, businessType } = body

  // Get character
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 })
  }

  if (action === "start") {
    const bizDef = BUSINESS_TYPES[businessType]
    if (!bizDef) {
      return NextResponse.json({ error: "Invalid business type" }, { status: 400 })
    }

    // Check requirements
    if (character.level < bizDef.levelRequired) {
      return NextResponse.json({ error: `Level ${bizDef.levelRequired} required` }, { status: 400 })
    }
    if (character.leadership < bizDef.leadershipRequired) {
      return NextResponse.json({ error: `Leadership ${bizDef.leadershipRequired} required` }, { status: 400 })
    }
    if (character.charisma < bizDef.charismaRequired) {
      return NextResponse.json({ error: `Charisma ${bizDef.charismaRequired} required` }, { status: 400 })
    }
    if (Number(character.funds) < bizDef.startupCost) {
      return NextResponse.json({ error: `$${bizDef.startupCost} required` }, { status: 400 })
    }

    // Check if already owns this type
    const { data: existing } = await supabase
      .from("businesses")
      .select("id")
      .eq("character_id", character.id)
      .eq("business_type", businessType)
      .single()

    if (existing) {
      return NextResponse.json({ error: "You already own this type of business" }, { status: 400 })
    }

    // Deduct funds and create business
    const { error: updateError } = await supabase
      .from("characters")
      .update({ funds: Number(character.funds) - bizDef.startupCost })
      .eq("id", character.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to deduct funds" }, { status: 500 })
    }

    const { data: newBiz, error: createError } = await supabase
      .from("businesses")
      .insert({
        character_id: character.id,
        user_id: user.id,
        business_type: businessType,
        name: bizDef.name,
        daily_income: bizDef.dailyIncome,
        level: 1,
        last_collected_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      // Refund if creation failed
      await supabase
        .from("characters")
        .update({ funds: Number(character.funds) })
        .eq("id", character.id)
      return NextResponse.json({ error: "Failed to create business" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      business: newBiz,
      businessName: bizDef.name
    })
  }

  if (action === "collect") {
    // Get all businesses
    const { data: businesses } = await supabase
      .from("businesses")
      .select("*")
      .eq("character_id", character.id)

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ error: "No businesses to collect from" }, { status: 400 })
    }

    // Calculate and collect income
    const now = new Date()
    let totalCollected = 0

    for (const biz of businesses) {
      const lastCollected = new Date(biz.last_collected_at || biz.created_at)
      const hoursSinceCollection = (now.getTime() - lastCollected.getTime()) / (1000 * 60 * 60)
      const daysIncome = Math.min(hoursSinceCollection / 24, 7)
      totalCollected += Math.floor(biz.daily_income * daysIncome)
    }

    if (totalCollected <= 0) {
      return NextResponse.json({ error: "No income to collect yet" }, { status: 400 })
    }

    // Update character funds
    await supabase
      .from("characters")
      .update({ funds: Number(character.funds) + totalCollected })
      .eq("id", character.id)

    // Update all businesses' last_collected_at
    await supabase
      .from("businesses")
      .update({ last_collected_at: now.toISOString() })
      .eq("character_id", character.id)

    return NextResponse.json({ 
      success: true, 
      collected: totalCollected 
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
