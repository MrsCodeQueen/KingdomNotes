"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign, Users, Clock, TrendingUp, Coins,
  Sparkles, ChevronRight, Music, Heart, Gift
} from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface EarningsClaimPanelProps {
  characterId: string
  influence: number
  anointing: number
  followers: number
  lastRoyaltyClaim: string | null
  lastOfferingClaim: string | null
  onClaim: () => void
}

export function EarningsClaimPanel({
  characterId,
  influence,
  anointing,
  followers,
  lastRoyaltyClaim,
  lastOfferingClaim,
  onClaim,
}: EarningsClaimPanelProps) {
  const { data: royaltyData, mutate: mutateRoyalties } = useSWR("/api/game/royalties", fetcher, { refreshInterval: 15000 })
  const royalties = royaltyData?.royalties ?? []

  // Calculate accumulated royalties
  const totalPendingRoyalties = royalties.reduce((sum: number, r: any) => sum + Number(r.income_per_tick), 0)

  // Calculate time since last claims
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(interval)
  }, [])

  const royaltyHours = lastRoyaltyClaim
    ? Math.max(0, (now - new Date(lastRoyaltyClaim).getTime()) / (1000 * 60 * 60))
    : 0
  const offeringHours = lastOfferingClaim
    ? Math.max(0, (now - new Date(lastOfferingClaim).getTime()) / (1000 * 60 * 60))
    : 0

  // Estimate follower offerings accumulation
  const baseFollowers = Math.max(followers, Math.floor(influence * 8 + anointing * 3))
  const anointingMultiplier = 1 + anointing * 0.01
  const hourlyOfferingRate = baseFollowers * 0.05 * anointingMultiplier
  const estimatedOfferings = Math.round(hourlyOfferingRate * offeringHours * 100) / 100

  // Claim states
  const [royaltyClaiming, setRoyaltyClaiming] = useState(false)
  const [offeringClaiming, setOfferingClaiming] = useState(false)
  const [royaltyResult, setRoyaltyResult] = useState<{ net: number; tithe: number; songs: number } | null>(null)
  const [offeringResult, setOfferingResult] = useState<{ net: number; tithe: number; followers: number; newFollowers: number } | null>(null)

  const handleClaimRoyalties = useCallback(async () => {
    if (totalPendingRoyalties < 0.01 || royaltyClaiming) return
    setRoyaltyClaiming(true)
    setRoyaltyResult(null)
    try {
      const res = await fetch("/api/game/royalties/claim", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setRoyaltyResult({ net: data.netAmount, tithe: data.titheAmount, songs: data.songCount })
        // Reset SWR cache so the displayed amount goes to $0.00 immediately
        await mutateRoyalties()
        onClaim()
      }
    } finally {
      setRoyaltyClaiming(false)
    }
  }, [totalPendingRoyalties, royaltyClaiming, onClaim])

  const handleClaimOfferings = useCallback(async () => {
    if (estimatedOfferings < 0.01 || offeringClaiming) return
    setOfferingClaiming(true)
    setOfferingResult(null)
    try {
      const res = await fetch("/api/game/offerings/claim", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setOfferingResult({ net: data.netAmount, tithe: data.titheAmount, followers: data.followers, newFollowers: data.newFollowers })
        onClaim()
      }
    } finally {
      setOfferingClaiming(false)
    }
  }, [estimatedOfferings, offeringClaiming, onClaim])

  function formatHours(h: number) {
    if (h < 0.017) return "just now"
    if (h < 1) return `${Math.round(h * 60)}m ago`
    if (h < 24) return `${h.toFixed(1)}h ago`
    return `${Math.floor(h / 24)}d ${Math.round(h % 24)}h ago`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Coins className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Passive Earnings</h3>
        <p className="text-sm text-muted-foreground ml-auto">Accumulates automatically from your music and ministry</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* ===== ROYALTIES CARD ===== */}
        <div className="card-glow relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-700 p-6 text-white shadow-lg shadow-amber-900/20 transition-all hover:shadow-xl hover:scale-[1.01]">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold font-serif text-lg leading-tight">Accumulated Royalties</h4>
                <p className="text-xs text-white/70">From {royalties.length} active recording{royalties.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-3">
              <span className="text-4xl font-black tracking-tight">
                ${totalPendingRoyalties.toFixed(2)}
              </span>
            </div>

            {/* Time info */}
            <div className="flex items-center gap-2 mb-4 text-sm text-white/80">
              <Clock className="h-3.5 w-3.5" />
              <span>Last claimed {formatHours(royaltyHours)}</span>
            </div>

            {/* Per-song breakdown badge */}
            {royalties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {royalties.slice(0, 3).map((r: any) => (
                  <Badge key={r.id} className="bg-white/15 text-white border-white/20 text-[10px] font-medium backdrop-blur-sm hover:bg-white/25">
                    <Music className="h-2.5 w-2.5 mr-1" />
                    {r.song_name}: ${Number(r.income_per_tick).toFixed(2)}
                  </Badge>
                ))}
                {royalties.length > 3 && (
                  <Badge className="bg-white/15 text-white border-white/20 text-[10px] font-medium backdrop-blur-sm">
                    +{royalties.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Claim button */}
            <Button
              onClick={handleClaimRoyalties}
              disabled={totalPendingRoyalties < 0.01 || royaltyClaiming}
              className={cn(
                "w-full font-bold text-sm rounded-xl h-11 transition-all",
                totalPendingRoyalties >= 0.01
                  ? "bg-white text-amber-700 hover:bg-white/90 shadow-lg"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
              )}
            >
              {royaltyClaiming ? (
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 animate-spin" /> Claiming...</span>
              ) : totalPendingRoyalties >= 0.01 ? (
                <span className="flex items-center gap-2">Claim Royalties <ChevronRight className="h-4 w-4" /></span>
              ) : (
                "No Royalties to Claim"
              )}
            </Button>

            {/* Result toast */}
            {royaltyResult && (
              <div className="mt-3 rounded-xl bg-white/20 backdrop-blur-sm p-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-sm font-bold mb-1">
                  <Sparkles className="h-4 w-4" /> Royalties Claimed!
                </div>
                <div className="text-xs text-white/80 space-y-0.5">
                  <p>Collected from {royaltyResult.songs} song{royaltyResult.songs !== 1 ? "s" : ""}</p>
                  <p>Tithe to the Kingdom: ${royaltyResult.tithe.toFixed(2)}</p>
                  <p className="font-bold text-white">Net added to funds: ${royaltyResult.net.toFixed(2)}</p>
                  <p className="text-[10px] text-white/60 mt-1 italic">+Kingdom Favor buff (Anointing +5, 24h)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== FOLLOWER OFFERINGS CARD ===== */}
        <div className="card-glow relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-600 to-sky-700 p-6 text-white shadow-lg shadow-teal-900/20 transition-all hover:shadow-xl hover:scale-[1.01]">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold font-serif text-lg leading-tight">Follower Offerings</h4>
                <p className="text-xs text-white/70">Your ministry supporters give back</p>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-3">
              <span className="text-4xl font-black tracking-tight">
                ${estimatedOfferings.toFixed(2)}
              </span>
            </div>

            {/* Time and rate info */}
            <div className="flex flex-col gap-1 mb-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Last claimed {formatHours(offeringHours)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5" />
                <span>From {baseFollowers.toLocaleString()} followers</span>
                <span className="text-white/60">|</span>
                <span className="text-white/90 font-medium">${hourlyOfferingRate.toFixed(2)}/hr</span>
              </div>
            </div>

            {/* Follower stat badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <Badge className="bg-white/15 text-white border-white/20 text-[10px] font-medium backdrop-blur-sm">
                <TrendingUp className="h-2.5 w-2.5 mr-1" />
                Influence: {influence}
              </Badge>
              <Badge className="bg-white/15 text-white border-white/20 text-[10px] font-medium backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                Anointing: {anointing} ({((anointingMultiplier - 1) * 100).toFixed(0)}% bonus)
              </Badge>
            </div>

            {/* Claim button */}
            <Button
              onClick={handleClaimOfferings}
              disabled={estimatedOfferings < 0.01 || offeringClaiming}
              className={cn(
                "w-full font-bold text-sm rounded-xl h-11 transition-all",
                estimatedOfferings >= 0.01
                  ? "bg-white text-teal-700 hover:bg-white/90 shadow-lg"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
              )}
            >
              {offeringClaiming ? (
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 animate-spin" /> Claiming...</span>
              ) : estimatedOfferings >= 0.01 ? (
                <span className="flex items-center gap-2">Claim Offerings <ChevronRight className="h-4 w-4" /></span>
              ) : (
                "No Offerings Yet"
              )}
            </Button>

            {/* Result toast */}
            {offeringResult && (
              <div className="mt-3 rounded-xl bg-white/20 backdrop-blur-sm p-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-sm font-bold mb-1">
                  <Gift className="h-4 w-4" /> Offerings Claimed!
                </div>
                <div className="text-xs text-white/80 space-y-0.5">
                  <p>{offeringResult.followers.toLocaleString()} followers contributed</p>
                  {offeringResult.newFollowers > 0 && <p>+{offeringResult.newFollowers} new followers joined!</p>}
                  <p>Tithe to the Kingdom: ${offeringResult.tithe.toFixed(2)}</p>
                  <p className="font-bold text-white">Net added to funds: ${offeringResult.net.toFixed(2)}</p>
                  <p className="text-[10px] text-white/60 mt-1 italic">+Generosity Blessing buff (Influence +8, 12h)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accumulation info bar */}
      <div className="rounded-xl border border-border bg-card/50 px-4 py-3 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 text-sm">
          <span className="font-semibold text-foreground">Automatic Accumulation: </span>
          <span className="text-muted-foreground">
            Your songs earn royalties each tick and followers give offerings over time. Both auto-tithe 10% to the Kingdom, granting you powerful buffs.
          </span>
        </div>
      </div>
    </div>
  )
}
