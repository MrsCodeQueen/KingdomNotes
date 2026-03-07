import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET: Fetch shop items and player inventory
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [shopRes, inventoryRes, charRes] = await Promise.all([
    supabase.from("shop_items").select("*").order("level_required", { ascending: true }),
    supabase.from("inventory").select("*").eq("user_id", user.id),
    supabase.from("characters").select("level, funds").eq("user_id", user.id).single(),
  ])

  return NextResponse.json({
    shopItems: shopRes.data ?? [],
    inventory: inventoryRes.data ?? [],
    level: charRes.data?.level ?? 1,
    funds: charRes.data?.funds ?? 0,
  })
}

// POST: Purchase an item
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { shopItemId } = await request.json()
  if (!shopItemId) return NextResponse.json({ error: "Missing shopItemId" }, { status: 400 })

  // Get character
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()
  if (!character) return NextResponse.json({ error: "No character found" }, { status: 404 })

  // Get shop item
  const { data: shopItem } = await supabase
    .from("shop_items")
    .select("*")
    .eq("id", shopItemId)
    .single()
  if (!shopItem) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  // Check level requirement
  if (character.level < shopItem.level_required) {
    return NextResponse.json({ error: `Requires Level ${shopItem.level_required}` }, { status: 400 })
  }

  // Check funds
  if (Number(character.funds) < Number(shopItem.price)) {
    return NextResponse.json({ error: "Not enough funds" }, { status: 400 })
  }

  // Check if already owned
  const { data: existing } = await supabase
    .from("inventory")
    .select("id")
    .eq("character_id", character.id)
    .eq("item_name", shopItem.item_name)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ error: "You already own this item" }, { status: 400 })
  }

  // Deduct funds
  const newFunds = Number(character.funds) - Number(shopItem.price)
  await supabase
    .from("characters")
    .update({ funds: newFunds })
    .eq("id", character.id)

  // Add to inventory
  await supabase.from("inventory").insert({
    character_id: character.id,
    user_id: user.id,
    item_type: shopItem.item_type,
    item_name: shopItem.item_name,
    stat_bonus: shopItem.stat_bonus,
    equipped: true,
  })

  // Log the purchase
  await supabase.from("activity_log").insert({
    character_id: character.id,
    user_id: user.id,
    action_type: "purchase",
    result_text: `Purchased ${shopItem.item_name} for $${Number(shopItem.price).toFixed(2)}.`,
    stat_changes: { funds: -Number(shopItem.price) },
  })

  return NextResponse.json({ success: true, newFunds })
}
