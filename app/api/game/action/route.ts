import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { ACTIVITIES, type ActivityKey, getRegion, RANDOM_EVENTS, TEMPTATIONS, getLevelFromXp, ACTIVITY_SKILL_GAINS, skillLevelFromXp, SONG_TAGS, getActiveRegionalEvents } from "@/lib/game/constants"

// Check and award achievements after any action
async function checkAchievements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  characterId: string,
  userId: string,
  character: Record<string, unknown>
) {
  const checks: { key: string; condition: boolean }[] = [
    { key: "reach_level_5", condition: (character.level as number) >= 5 },
    { key: "reach_level_10", condition: (character.level as number) >= 10 },
    { key: "reach_level_20", condition: (character.level as number) >= 20 },
    { key: "integrity_50", condition: (character.integrity_stat as number) >= 50 },
    { key: "charisma_50", condition: (character.charisma as number) >= 50 },
    { key: "anointing_80", condition: (character.anointing as number) >= 80 },
    { key: "leadership_25", condition: (character.leadership as number) >= 25 },
    { key: "influence_100", condition: (character.influence as number) >= 100 },
    { key: "influence_500", condition: (character.influence as number) >= 500 },
    { key: "funds_1000", condition: Number(character.funds) >= 1000 },
  ]

  const newAchievements: string[] = []
  for (const check of checks) {
    if (!check.condition) continue
    const { data: existing } = await supabase
      .from("achievements")
      .select("id")
      .eq("character_id", characterId)
      .eq("achievement_key", check.key)
      .maybeSingle()
    if (!existing) {
      await supabase.from("achievements").insert({
        character_id: characterId,
        user_id: userId,
        achievement_key: check.key,
      })
      newAchievements.push(check.key)
    }
  }
  return newAchievements
}

function rollRandomEvent(): typeof RANDOM_EVENTS[number] | null {
  for (const event of RANDOM_EVENTS) {
    if (Math.random() < event.chance) return event
  }
  return null
}

function rollTemptation(): typeof TEMPTATIONS[number] | null {
  if (Math.random() < 0.08) {
    return TEMPTATIONS[Math.floor(Math.random() * TEMPTATIONS.length)]
  }
  return null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const action = body.action as ActivityKey
  const equipmentUsed = body.equipment_used as string[] || []
  const songTags = (body.song_tags as string[] || []).filter((t: string) => (SONG_TAGS as readonly string[]).includes(t)).slice(0, 3)

  if (!action || !ACTIVITIES[action]) return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  const { data: character, error: charError } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (charError || !character) return NextResponse.json({ error: "Character not found" }, { status: 404 })

  // --- NEW: FETCH EQUIPMENT FOR BOOSTS ---
  let equipmentBoost = 0
  if (equipmentUsed.length > 0) {
    const { data: gear } = await supabase
      .from("inventory")
      .select("stat_bonus")
      .in("id", equipmentUsed)

    equipmentBoost = gear?.reduce((acc, item) => acc + (item.stat_bonus?.song_quality || 0), 0) || 0
  }

  const activity = ACTIVITIES[action]
  const region = getRegion(character.region)

  if (character.energy < activity.energyCost) return NextResponse.json({ error: "Not enough energy" }, { status: 400 })

  const statChanges: Record<string, number> = {}
  let resultText = ""
  const updates: Record<string, unknown> = {
    current_activity: action,
    last_tick_at: new Date().toISOString(),
  }

  const roll = Math.random()

  switch (action) {
    case "nap": {
      const energyGain = Math.min(100 - character.energy, 25 + Math.floor(Math.random() * 15))
      updates.energy = character.energy + energyGain
      statChanges.energy = energyGain
      resultText = `You took a refreshing nap and recovered ${energyGain} energy.`
      break
    }
    case "worship": {
      const anointingGain = Math.floor(8 + Math.random() * 12 * region.spiritualHunger)
      const energyGain = Math.min(100 - character.energy + activity.energyCost, 10)
      updates.energy = Math.min(100, character.energy - activity.energyCost + energyGain)
      updates.anointing = Math.min(100, character.anointing + anointingGain)
      statChanges.energy = energyGain - activity.energyCost
      statChanges.anointing = anointingGain
      resultText = roll > 0.6 ? `Deep worship session. Earned offerings.` : `You felt the presence surges.`
      break
    }
    case "songwriting": {
      updates.energy = character.energy - activity.energyCost
      statChanges.energy = -activity.energyCost

      const anointingFactor = character.anointing / 100
      const charismaBonus = character.charisma / 100
      const gearFactor = equipmentBoost / 100
      const qualityRoll = Math.random() + (anointingFactor * 0.4) + (charismaBonus * 0.2) + gearFactor

      let songQuality: "masterpiece" | "great" | "good" | "mediocre"
      if (qualityRoll > 1.3) songQuality = "masterpiece"
      else if (qualityRoll > 0.9) songQuality = "great"
      else if (qualityRoll > 0.5) songQuality = "good"
      else songQuality = "mediocre"

      // Unique title generator
      const songPrefixes = ["Redeemer's","Valley of","Morning","Worthy","Still","Breakthrough","Altar","Open","Unfailing","Rise and","The Cross","Living","Rivers of","Holy","Eternal","Crown of","Heavenly","Sacred","Faithful","Glorious","Anointed","Spirit-Led","Psalm of","Anthem of","Song of","Prayer for","Cry of","Sound of","Heart of","Grace of","Light of","Promise of"]
      const songSuffixes = ["Grace","Praise","the Lamb","Waters","Anthem","Fire","Heavens","Love","Worship","Stands","Water","Mercy","Surrender","Flame","Him","Glory","Redemption","Hope","Deliverance","Restoration","Revival","Blessing","Joy","Thunder","Rain","Peace","Righteousness","Salvation","Freedom","Victory","Majesty","Wonder"]
      const { data: existingSongs } = await supabase.from("songs").select("title").eq("character_id", character.id)
      const existingTitles = new Set((existingSongs ?? []).map((s: { title: string }) => s.title))
      let title = ""
      for (let i = 0; i < 50; i++) {
        const candidate = `${songPrefixes[Math.floor(Math.random() * songPrefixes.length)]} ${songSuffixes[Math.floor(Math.random() * songSuffixes.length)]}`
        if (!existingTitles.has(candidate)) { title = candidate; break }
      }
      if (!title) title = `Worship Song #${(existingSongs?.length ?? 0) + 1}`

      // Auto-assign tags based on quality and randomness, plus user-selected tags
      const autoTags: string[] = [...songTags]
      if (autoTags.length === 0) {
        // Random tag assignment if user didn't choose
        const available = [...SONG_TAGS]
        const count = 1 + Math.floor(Math.random() * 2)
        for (let t = 0; t < count; t++) {
          const idx = Math.floor(Math.random() * available.length)
          if (!autoTags.includes(available[idx])) autoTags.push(available[idx])
        }
      }
      await supabase.from("songs").insert({ character_id: character.id, user_id: user.id, title, quality: songQuality, tags: autoTags })
      resultText = equipmentUsed.length > 0
        ? `Using ${equipmentUsed.length} piece(s) of gear, you wrote "${title}" - a ${songQuality}!`
        : `You penned "${title}" - it's a ${songQuality}!`
      break
    }
    case "soaking": {
      updates.energy = character.energy - activity.energyCost
      const soakAnointing = Math.floor(4 + Math.random() * 6 * region.spiritualHunger)
      const soakEnergy = Math.floor(5 + Math.random() * 5)
      updates.energy = Math.min(100, (updates.energy as number) + soakEnergy)
      updates.anointing = Math.min(100, character.anointing + soakAnointing)
      statChanges.energy = -activity.energyCost + soakEnergy
      statChanges.anointing = soakAnointing
      resultText = `Soaking in prayer restored your spirit. Anointing +${soakAnointing}.`
      break
    }
    case "scripture": {
      updates.energy = character.energy - activity.energyCost
      const scrIntegrity = Math.floor(3 + Math.random() * 5)
      const scrAnointing = Math.floor(2 + Math.random() * 4 * region.spiritualHunger)
      updates.integrity_stat = Math.min(100, character.integrity_stat + scrIntegrity)
      updates.anointing = Math.min(100, character.anointing + scrAnointing)
      statChanges.energy = -activity.energyCost
      statChanges.integrity = scrIntegrity
      statChanges.anointing = scrAnointing
      resultText = `Scripture study deepened your roots. Integrity +${scrIntegrity}, Anointing +${scrAnointing}.`
      break
    }
    case "busking": {
      updates.energy = character.energy - activity.energyCost
      const buskFunds = Math.round((5 + Math.random() * 20 + character.charisma * 0.3) * 100) / 100
      const buskCharisma = Math.floor(1 + Math.random() * 3)
      updates.funds = Number(character.funds) + buskFunds
      updates.charisma = Math.min(100, character.charisma + buskCharisma)
      statChanges.energy = -activity.energyCost
      statChanges.funds = buskFunds
      statChanges.charisma = buskCharisma
      resultText = roll > 0.5 ? `Great crowd today! Earned $${buskFunds.toFixed(2)}.` : `Slow day busking but earned $${buskFunds.toFixed(2)}.`
      break
    }
    case "jam_session": {
      updates.energy = character.energy - activity.energyCost
      const jamCharisma = Math.floor(2 + Math.random() * 4)
      const jamLeadership = roll > 0.6 ? Math.floor(1 + Math.random() * 2) : 0
      updates.charisma = Math.min(100, character.charisma + jamCharisma)
      if (jamLeadership) updates.leadership = Math.min(100, character.leadership + jamLeadership)
      statChanges.energy = -activity.energyCost
      statChanges.charisma = jamCharisma
      if (jamLeadership) statChanges.leadership = jamLeadership
      resultText = `Jam session was fire! Charisma +${jamCharisma}${jamLeadership ? `, Leadership +${jamLeadership}` : ""}.`
      break
    }
    case "recording": {
      if (Number(character.funds) < 25) return NextResponse.json({ error: "Need $25 for studio time" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      updates.funds = Number(character.funds) - 25
      statChanges.energy = -activity.energyCost
      statChanges.funds = -25
      const recQuality = character.anointing > 60 ? "anointed" : "solid"
      const recIncome = recQuality === "anointed" ? 0.5 + Math.random() * 0.5 : 0.2 + Math.random() * 0.3
      const recRounded = Math.round(recIncome * 100) / 100
      const { data: unrecorded } = await supabase.from("songs").select("id, title").eq("character_id", character.id).eq("recorded", false).limit(5)
      let recSongName: string
      if (unrecorded && unrecorded.length > 0) {
        const picked = unrecorded[Math.floor(Math.random() * unrecorded.length)]
        recSongName = picked.title
        await supabase.from("songs").update({ recorded: true }).eq("id", picked.id)
      } else {
        recSongName = `Studio Session #${Date.now().toString(36)}`
      }
      await supabase.from("royalties").insert({ character_id: character.id, user_id: user.id, song_name: recSongName, income_per_tick: recRounded })
      resultText = `Recorded "${recSongName}"! ${recQuality === "anointed" ? "The Spirit moved." : "Solid session."} Royalties: $${recRounded}/tick.`
      break
    }
    case "teach_class": {
      if (character.charisma < 15) return NextResponse.json({ error: "Need Charisma 15+" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      const tcLeadership = Math.floor(2 + Math.random() * 3)
      const tcInfluence = Math.floor(1 + Math.random() * 3)
      updates.leadership = Math.min(100, character.leadership + tcLeadership)
      updates.influence = character.influence + tcInfluence
      statChanges.energy = -activity.energyCost
      statChanges.leadership = tcLeadership
      statChanges.influence = tcInfluence
      resultText = `You taught a class on worship leading. Leadership +${tcLeadership}, Influence +${tcInfluence}.`
      break
    }
    case "mentor": {
      if (character.leadership < 3) return NextResponse.json({ error: "Need Leadership 3+" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      const mLeadership = Math.floor(2 + Math.random() * 3)
      const mIntegrity = Math.floor(1 + Math.random() * 3)
      updates.leadership = Math.min(100, character.leadership + mLeadership)
      updates.integrity_stat = Math.min(100, character.integrity_stat + mIntegrity)
      statChanges.energy = -activity.energyCost
      statChanges.leadership = mLeadership
      statChanges.integrity = mIntegrity
      resultText = `Mentoring session was fruitful. Leadership +${mLeadership}, Integrity +${mIntegrity}.`
      break
    }
    case "conference": {
      if (character.leadership < 10 || Number(character.funds) < 100) return NextResponse.json({ error: "Need Leadership 10+ and $100" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      updates.funds = Number(character.funds) - 100
      const confInfluence = Math.floor(10 + Math.random() * 15)
      updates.influence = character.influence + confInfluence
      statChanges.energy = -activity.energyCost
      statChanges.funds = -100
      statChanges.influence = confInfluence
      resultText = `Conference was a success! Influence +${confInfluence}.`
      break
    }
    case "church_service": {
      updates.energy = character.energy - activity.energyCost
      const csAnointing = Math.floor(6 + Math.random() * 8 * region.spiritualHunger)
      const csIntegrity = Math.floor(1 + Math.random() * 3)
      updates.anointing = Math.min(100, character.anointing + csAnointing)
      updates.integrity_stat = Math.min(100, character.integrity_stat + csIntegrity)
      statChanges.energy = -activity.energyCost
      statChanges.anointing = csAnointing
      statChanges.integrity = csIntegrity
      resultText = `Sunday service was powerful. Anointing +${csAnointing}, Integrity +${csIntegrity}.`
      break
    }
    case "bible_study": {
      if (character.leadership < 2) return NextResponse.json({ error: "Need Leadership 2+" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      const bsLeadership = Math.floor(1 + Math.random() * 3)
      const bsIntegrity = Math.floor(2 + Math.random() * 3)
      const bsAnointing = Math.floor(2 + Math.random() * 4)
      updates.leadership = Math.min(100, character.leadership + bsLeadership)
      updates.integrity_stat = Math.min(100, character.integrity_stat + bsIntegrity)
      updates.anointing = Math.min(100, character.anointing + bsAnointing)
      statChanges.energy = -activity.energyCost
      statChanges.leadership = bsLeadership
      statChanges.integrity = bsIntegrity
      statChanges.anointing = bsAnointing
      resultText = `Bible study on the Psalms moved everyone. Leadership +${bsLeadership}, Integrity +${bsIntegrity}.`
      break
    }
    case "choir_rehearsal": {
      updates.energy = character.energy - activity.energyCost
      const crCharisma = Math.floor(2 + Math.random() * 3)
      const crAnointing = Math.floor(1 + Math.random() * 3)
      updates.charisma = Math.min(100, character.charisma + crCharisma)
      updates.anointing = Math.min(100, character.anointing + crAnointing)
      statChanges.energy = -activity.energyCost
      statChanges.charisma = crCharisma
      statChanges.anointing = crAnointing
      resultText = `Choir rehearsal went well. Charisma +${crCharisma}, Anointing +${crAnointing}.`
      break
    }
    case "praise_team": {
      updates.energy = character.energy - activity.energyCost
      const ptCharisma = Math.floor(2 + Math.random() * 3)
      const ptAnointing = Math.floor(2 + Math.random() * 3)
      const ptLeadership = roll > 0.5 ? Math.floor(1 + Math.random() * 2) : 0
      updates.charisma = Math.min(100, character.charisma + ptCharisma)
      updates.anointing = Math.min(100, character.anointing + ptAnointing)
      if (ptLeadership) updates.leadership = Math.min(100, character.leadership + ptLeadership)
      statChanges.energy = -activity.energyCost
      statChanges.charisma = ptCharisma
      statChanges.anointing = ptAnointing
      if (ptLeadership) statChanges.leadership = ptLeadership
      resultText = `Praise team is sounding tighter. Charisma +${ptCharisma}${ptLeadership ? `, Leadership +${ptLeadership}` : ""}.`
      break
    }
    case "testimony": {
      if (character.charisma < 10) return NextResponse.json({ error: "Need Charisma 10+" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      const tInfluence = Math.floor(2 + Math.random() * 5)
      const tIntegrity = Math.floor(2 + Math.random() * 3)
      updates.influence = character.influence + tInfluence
      updates.integrity_stat = Math.min(100, character.integrity_stat + tIntegrity)
      statChanges.energy = -activity.energyCost
      statChanges.influence = tInfluence
      statChanges.integrity = tIntegrity
      resultText = `Your testimony moved hearts. Influence +${tInfluence}, Integrity +${tIntegrity}.`
      break
    }
    case "youth_revival": {
      if (character.leadership < 5 || character.charisma < 15) return NextResponse.json({ error: "Need Leadership 5+ and Charisma 15+" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      const yrInfluence = Math.floor(5 + Math.random() * 8)
      const yrAnointing = Math.floor(5 + Math.random() * 10)
      const yrFunds = Math.round((10 + Math.random() * 30) * 100) / 100
      updates.influence = character.influence + yrInfluence
      updates.anointing = Math.min(100, character.anointing + yrAnointing)
      updates.funds = Number(character.funds) + yrFunds
      statChanges.energy = -activity.energyCost
      statChanges.influence = yrInfluence
      statChanges.anointing = yrAnointing
      statChanges.funds = yrFunds
      resultText = `The youth revival was on fire! Influence +${yrInfluence}, earned $${yrFunds.toFixed(2)}.`
      break
    }
    case "live_album": {
      if (character.charisma < 25 || Number(character.funds) < 75) return NextResponse.json({ error: "Need Charisma 25+ and $75" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      updates.funds = Number(character.funds) - 75
      statChanges.energy = -activity.energyCost
      statChanges.funds = -75
      const laIncome = character.anointing > 60 ? 0.8 + Math.random() * 0.7 : 0.3 + Math.random() * 0.4
      const laRounded = Math.round(laIncome * 100) / 100
      const laInfluence = Math.floor(5 + Math.random() * 10)
      updates.influence = character.influence + laInfluence
      statChanges.influence = laInfluence
      const liveNames = ["Live at The Upper Room","Worship from Revival Hall","Night of Glory","Evening at The Tabernacle","Live from Bethel"]
      const laName = liveNames[Math.floor(Math.random() * liveNames.length)]
      await supabase.from("royalties").insert({ character_id: character.id, user_id: user.id, song_name: laName, income_per_tick: laRounded })
      resultText = `LIVE ALBUM "${laName}" recorded! Royalties: $${laRounded}/tick. Influence +${laInfluence}.`
      break
    }
    // ===== PERFORMANCE ACTIONS =====
    case "street_performance": {
      updates.energy = character.energy - activity.energyCost
      const spCharismaFactor = 1 + character.charisma * 0.02
      const spAnointingFactor = 1 + character.anointing * 0.015
      const spFunds = Math.round((3 + Math.random() * 12) * spCharismaFactor * 100) / 100
      const spInfluence = Math.floor(1 + Math.random() * 2)
      const spCharisma = Math.floor(1 + Math.random() * 2)
      const spAnointing = roll > 0.5 ? Math.floor(1 + Math.random() * Math.floor(spAnointingFactor)) : 0
      updates.funds = Number(character.funds) + spFunds
      updates.charisma = Math.min(100, character.charisma + spCharisma)
      updates.influence = character.influence + spInfluence
      if (spAnointing) updates.anointing = Math.min(100, character.anointing + spAnointing)
      statChanges.energy = -activity.energyCost
      statChanges.funds = spFunds
      statChanges.charisma = spCharisma
      statChanges.influence = spInfluence
      if (spAnointing) statChanges.anointing = spAnointing
      const spFollowers = Math.floor(1 + Math.random() * 3)
      updates.followers = (character.followers ?? 0) + spFollowers
      statChanges.followers = spFollowers
      const streetScenes = [
        "A passerby stops, listens, and drops money in your case.",
        "A small crowd gathers. One woman is in tears by the end.",
        "Not many stop, but those who do are deeply moved.",
        "A kid starts dancing. The crowd grows. Tips pour in.",
      ]
      resultText = `${streetScenes[Math.floor(Math.random() * streetScenes.length)]} Earned $${spFunds.toFixed(2)}.`
      break
    }
    case "church_concert": {
      updates.energy = character.energy - activity.energyCost
      const ccCharismaFactor = 1 + character.charisma * 0.025
      const ccAnointingFactor = 1 + character.anointing * 0.03
      const ccFunds = Math.round((15 + Math.random() * 30) * ccCharismaFactor * 100) / 100
      const ccAnointing = Math.floor(3 + Math.random() * 5 * ccAnointingFactor * region.spiritualHunger)
      const ccInfluence = Math.floor(2 + Math.random() * 4)
      const ccIntegrity = Math.floor(1 + Math.random() * 3)
      updates.funds = Number(character.funds) + ccFunds
      updates.anointing = Math.min(100, character.anointing + ccAnointing)
      updates.influence = character.influence + ccInfluence
      updates.integrity_stat = Math.min(100, character.integrity_stat + ccIntegrity)
      statChanges.energy = -activity.energyCost
      statChanges.funds = ccFunds
      statChanges.anointing = ccAnointing
      statChanges.influence = ccInfluence
      statChanges.integrity = ccIntegrity
      const ccFollowers = Math.floor(5 + Math.random() * 15)
      updates.followers = (character.followers ?? 0) + ccFollowers
      statChanges.followers = ccFollowers
      const churchScenes = [
        "The congregation rises to their feet during worship. The pastor invites you back.",
        "An elderly woman grabs your hand after and whispers, 'The Lord is on you, child.'",
        "The Spirit moves powerfully. Three people come to the altar weeping.",
        "Solid service. The worship team tells you they want to learn your songs.",
      ]
      resultText = `${churchScenes[Math.floor(Math.random() * churchScenes.length)]} Earned $${ccFunds.toFixed(2)}, Anointing +${ccAnointing}.`
      break
    }
    case "venue_concert": {
      if (character.charisma < 20 || Number(character.funds) < 50) return NextResponse.json({ error: "Need Charisma 20+ and $50" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      updates.funds = Number(character.funds) - 50
      const vcCharismaFactor = 1 + character.charisma * 0.03
      const vcAnointingFactor = 1 + character.anointing * 0.025
      const vcEarnings = Math.round((50 + Math.random() * 100) * vcCharismaFactor * 100) / 100
      updates.funds = (updates.funds as number) + vcEarnings
      const vcInfluence = Math.floor(5 + Math.random() * 10)
      const vcCharisma = Math.floor(2 + Math.random() * 4)
      const vcAnointing = Math.floor(2 + Math.random() * 5 * vcAnointingFactor)
      updates.influence = character.influence + vcInfluence
      updates.charisma = Math.min(100, character.charisma + vcCharisma)
      updates.anointing = Math.min(100, character.anointing + vcAnointing)
      statChanges.energy = -activity.energyCost
      statChanges.funds = vcEarnings - 50
      statChanges.influence = vcInfluence
      statChanges.charisma = vcCharisma
      statChanges.anointing = vcAnointing
      const vcFollowers = Math.floor(20 + Math.random() * 50)
      updates.followers = (character.followers ?? 0) + vcFollowers
      statChanges.followers = vcFollowers
      const venueScenes = [
        "The venue sells out. Standing ovation. Merch table emptied.",
        "The sound was perfect. Three encores. Promoters want you back.",
        "A record exec is in the crowd. They hand you a business card after.",
        "Electric night. The audience sings your lyrics back louder than the speakers.",
      ]
      resultText = `${venueScenes[Math.floor(Math.random() * venueScenes.length)]} Net profit: $${(vcEarnings - 50).toFixed(2)}, Influence +${vcInfluence}.`
      break
    }
    case "multi_city_tour": {
      if (character.charisma < 40 || character.leadership < 10 || Number(character.funds) < 200) return NextResponse.json({ error: "Need Charisma 40+, Leadership 10+, and $200" }, { status: 400 })
      updates.energy = character.energy - activity.energyCost
      updates.funds = Number(character.funds) - 200
      const mtCharismaFactor = 1 + character.charisma * 0.04
      const mtAnointingFactor = 1 + character.anointing * 0.03
      const mtEarnings = Math.round((200 + Math.random() * 400) * mtCharismaFactor * 100) / 100
      updates.funds = (updates.funds as number) + mtEarnings
      const mtInfluence = Math.floor(15 + Math.random() * 25)
      const mtCharisma = Math.floor(3 + Math.random() * 5)
      const mtAnointing = Math.floor(3 + Math.random() * 7 * mtAnointingFactor)
      const mtLeadership = Math.floor(2 + Math.random() * 4)
      updates.influence = character.influence + mtInfluence
      updates.charisma = Math.min(100, character.charisma + mtCharisma)
      updates.anointing = Math.min(100, character.anointing + mtAnointing)
      updates.leadership = Math.min(100, character.leadership + mtLeadership)
      statChanges.energy = -activity.energyCost
      statChanges.funds = mtEarnings - 200
      statChanges.influence = mtInfluence
      statChanges.charisma = mtCharisma
      statChanges.anointing = mtAnointing
      statChanges.leadership = mtLeadership
      const mtFollowers = Math.floor(100 + Math.random() * 300)
      updates.followers = (character.followers ?? 0) + mtFollowers
      statChanges.followers = mtFollowers
      const tourScenes = [
        "Five cities. Five sold-out crowds. The Kingdom expands.",
        "Your crew becomes family on the road. Every city brings revival.",
        "City after city, the altars fill. Tour profits exceed expectations.",
        "The tour documentary goes viral. Your story inspires thousands.",
      ]
      resultText = `${tourScenes[Math.floor(Math.random() * tourScenes.length)]} Net profit: $${(mtEarnings - 200).toFixed(2)}, Influence +${mtInfluence}, Leadership +${mtLeadership}.`
      break
    }
    default: {
      updates.energy = character.energy - activity.energyCost
      statChanges.energy = -activity.energyCost
      resultText = `You completed ${activity.label}.`
      break
    }
  }

  // --- APPLY REGIONAL EVENT MODIFIERS ---
  const activeEvents = getActiveRegionalEvents(character.region)
  for (const evt of activeEvents) {
    const fx = evt.effects
    // Apply stat bonuses from events
    if (fx.statBonus) {
      for (const [stat, bonus] of Object.entries(fx.statBonus)) {
        if (bonus) {
          const key = stat === "integrity" ? "integrity_stat" : stat
          if (typeof updates[key] === "number") {
            updates[key] = Math.min(key === "influence" ? 99999 : 100, (updates[key] as number) + bonus)
          } else if (typeof (character as Record<string,unknown>)[key] === "number") {
            updates[key] = Math.min(key === "influence" ? 99999 : 100, ((character as Record<string,unknown>)[key] as number) + bonus)
          }
          if (!statChanges[stat]) statChanges[stat] = 0
          statChanges[stat] += bonus
        }
      }
    }
    // Apply anointing multiplier
    if (fx.anointingMult && typeof updates.anointing === "number") {
      const base = updates.anointing as number - (character.anointing || 0)
      const boosted = Math.floor(base * fx.anointingMult)
      updates.anointing = Math.min(100, (character.anointing || 0) + boosted)
    }
  }

  // --- INTEGRITY -> LEADERSHIP CONVERSION ---
  // When integrity reaches 250+ total accumulated, it starts building Leadership
  const currentIntegrity = (updates.integrity_stat as number) ?? character.integrity_stat ?? 0
  if (currentIntegrity >= 100 && statChanges.integrity && statChanges.integrity > 0) {
    // Overflow integrity converts to leadership at 40% rate
    const overflowIntegrity = Math.max(0, currentIntegrity - 100 + statChanges.integrity)
    if (overflowIntegrity > 0) {
      const leadershipGain = Math.floor(overflowIntegrity * 0.4)
      if (leadershipGain > 0) {
        const currentLeadership = (updates.leadership as number) ?? character.leadership ?? 0
        updates.leadership = Math.min(100, currentLeadership + leadershipGain)
        statChanges.leadership = (statChanges.leadership || 0) + leadershipGain
        resultText += ` Your integrity overflows into leadership! +${leadershipGain} Leadership.`
      }
    }
  }

  // --- XP & SKILL IMPROVEMENT SYSTEM ---
  let xpGain = Math.max(1, Math.abs(activity.energyCost) * 3)
  // Apply XP multipliers from regional events
  for (const evt of activeEvents) {
    if (evt.effects.xpMult) xpGain = Math.floor(xpGain * evt.effects.xpMult)
  }
  const newTotalXp = (character.xp || 0) + xpGain
  const levelInfo = getLevelFromXp(newTotalXp)

  updates.xp = newTotalXp
  updates.level = levelInfo.level
  statChanges.xp = xpGain

  const mergedCharacter = { ...character, ...updates }

  const { error: updateError } = await supabase.from("characters").update(updates).eq("id", character.id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // --- SKILL TRAINING SYSTEM ---
  const skillGains = ACTIVITY_SKILL_GAINS[action as ActivityKey] ?? []
  const trainedSkills: { skill: string; xpGained: number; newLevel: number }[] = []

  for (const gain of skillGains) {
    if (gain.xp <= 0) continue

    // Upsert skill row: increment xp_in_skill and times_trained
    const { data: existing } = await supabase
      .from("character_skills")
      .select("id, xp_in_skill, times_trained")
      .eq("character_id", character.id)
      .eq("skill_key", gain.skill)
      .single()

    if (existing) {
      const newXp = (existing.xp_in_skill || 0) + gain.xp
      const newLevelInfo = skillLevelFromXp(newXp)
      await supabase.from("character_skills").update({
        xp_in_skill: newXp,
        skill_level: newLevelInfo.level,
        times_trained: (existing.times_trained || 0) + 1,
        last_trained_at: new Date().toISOString(),
      }).eq("id", existing.id)
      trainedSkills.push({ skill: gain.skill, xpGained: gain.xp, newLevel: newLevelInfo.level })
    } else {
      const newLevelInfo = skillLevelFromXp(gain.xp)
      await supabase.from("character_skills").insert({
        character_id: character.id,
        user_id: user.id,
        skill_key: gain.skill,
        xp_in_skill: gain.xp,
        skill_level: newLevelInfo.level,
        times_trained: 1,
        last_trained_at: new Date().toISOString(),
      })
      trainedSkills.push({ skill: gain.skill, xpGained: gain.xp, newLevel: newLevelInfo.level })
    }
  }

  // Append skill gains to result text
  if (trainedSkills.length > 0) {
    const skillText = trainedSkills.map(s => `${s.skill} +${s.xpGained}xp`).join(", ")
    resultText += ` [Skills: ${skillText}]`
  }

  await supabase.from("activity_log").insert({
    character_id: character.id, user_id: user.id,
    action_type: action, result_text: resultText, stat_changes: statChanges,
  })

  const newAchievements = await checkAchievements(supabase, character.id, user.id, mergedCharacter)

  return NextResponse.json({
    success: true, resultText, statChanges,
    newAchievements,
    trainedSkills,
    leveledUp: (updates.level as number) > character.level,
    newLevel: updates.level,
  })
}
