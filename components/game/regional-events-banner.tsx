"use client"

import { useState } from "react"
import { getActiveRegionalEvents, type RegionalEvent } from "@/lib/game/constants"
import { cn } from "@/lib/utils"
import { Zap, Flame, Shield, Clock, ChevronRight, Sparkles, Heart, Swords, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RegionalEventsBannerProps {
  regionId: string
  energy?: number
  funds?: number
  onJoin?: () => void
}

function rarityColor(rarity: string) {
  switch (rarity) {
    case "epic": return "border-primary/60 bg-primary/10"
    case "rare": return "border-chart-2/50 bg-chart-2/10"
    default: return "border-border/60 bg-muted/30"
  }
}

function rarityBadge(rarity: string) {
  switch (rarity) {
    case "epic": return "bg-primary/20 text-primary border-primary/30"
    case "rare": return "bg-chart-2/20 text-chart-2 border-chart-2/30"
    default: return "bg-muted text-muted-foreground border-border"
  }
}

function effectLabel(effects: RegionalEvent["effects"]): string[] {
  const labels: string[] = []
  if (effects.anointingMult && effects.anointingMult > 1) labels.push(`Anointing x${effects.anointingMult}`)
  if (effects.xpMult && effects.xpMult > 1) labels.push(`XP x${effects.xpMult}`)
  if (effects.xpMult && effects.xpMult < 1) labels.push(`XP x${effects.xpMult}`)
  if (effects.fundsMult && effects.fundsMult > 1) labels.push(`Funds x${effects.fundsMult}`)
  if (effects.fundsMult && effects.fundsMult < 1) labels.push(`Costs x${effects.fundsMult}`)
  if (effects.energyDrainMult && effects.energyDrainMult < 1) labels.push(`-${Math.round((1 - effects.energyDrainMult) * 100)}% Energy Drain`)
  if (effects.energyDrainMult && effects.energyDrainMult > 1) labels.push(`+${Math.round((effects.energyDrainMult - 1) * 100)}% Energy Drain`)
  if (effects.statBonus) {
    Object.entries(effects.statBonus).forEach(([stat, val]) => {
      if (val) labels.push(`+${val} ${stat.replace("_stat", "")}`)
    })
  }
  return labels
}

export function RegionalEventsBanner({ regionId, energy = 100, funds = 999, onJoin }: RegionalEventsBannerProps) {
  const events = getActiveRegionalEvents(regionId)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [joiningEvent, setJoiningEvent] = useState<string | null>(null)
  const [joinResult, setJoinResult] = useState<{
    eventId: string
    isFullSuccess: boolean
    resultText: string
    xpGain: number
    statGains: Record<string, number>
    buffType: string
    buffBonus: number
    buffDurationHours: number
    leveledUp?: boolean
    newLevel?: number
  } | null>(null)

  if (events.length === 0) return null

  const handleJoinEvent = async (eventId: string) => {
    setJoiningEvent(eventId)
    try {
      const res = await fetch("/api/game/events/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      })
      const data = await res.json()
      if (res.ok) {
        setJoinResult({ eventId, ...data })
        onJoin?.()
      } else {
        setJoinResult({
          eventId,
          isFullSuccess: false,
          resultText: data.error || "Failed to join event.",
          xpGain: 0,
          statGains: {},
          buffType: "",
          buffBonus: 0,
          buffDurationHours: 0,
        })
      }
    } finally {
      setJoiningEvent(null)
    }
  }

  const dismissResult = () => {
    setJoinResult(null)
    setExpandedEvent(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-primary" />
        Active Regional Events
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">Click to participate</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {events.map(event => {
          const isExpanded = expandedEvent === event.id
          const hasResult = joinResult?.eventId === event.id
          const canAffordEnergy = energy >= event.participation.energyCost
          const canAffordFunds = funds >= event.participation.fundsCost

          return (
            <Card
              key={event.id}
              className={cn(
                "overflow-hidden border transition-all duration-300 cursor-pointer",
                rarityColor(event.rarity),
                event.rarity === "epic" && !isExpanded && "critical-pulse",
                isExpanded && "ring-1 ring-primary/30",
              )}
              onClick={() => !hasResult && setExpandedEvent(isExpanded ? null : event.id)}
            >
              <CardContent className="p-0">
                {/* Header row */}
                <div className="flex items-center gap-2 p-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {event.rarity === "epic" ? <Flame className="h-4 w-4 shrink-0 text-primary" /> : event.rarity === "rare" ? <Sparkles className="h-4 w-4 shrink-0 text-chart-2" /> : <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-black uppercase tracking-tight block truncate">{event.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">{event.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className={cn("text-[8px] h-4 font-black uppercase", rarityBadge(event.rarity))}>
                      {event.rarity}
                    </Badge>
                    <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                  </div>
                </div>

                {/* Passive effects strip */}
                <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
                  {effectLabel(event.effects).map((label, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-background/50 border border-border/50 px-2 py-0.5 text-[9px] font-bold uppercase">
                      {label}
                    </span>
                  ))}
                  <span className="ml-auto flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {event.duration}
                  </span>
                </div>

                {/* Expanded participation panel */}
                {isExpanded && !hasResult && (
                  <div className="border-t border-border/30 bg-background/40 p-3 space-y-3" onClick={e => e.stopPropagation()}>
                    {/* Cost and requirements */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-3 w-3 text-destructive" />
                        <span className={cn("text-xs font-bold", !canAffordEnergy && "text-destructive")}>{event.participation.energyCost} Energy</span>
                      </div>
                      {event.participation.fundsCost > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-xs font-bold", !canAffordFunds && "text-destructive")}>${event.participation.fundsCost}</span>
                        </div>
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        Success: {Math.round(event.participation.successRate * 100)}%
                      </span>
                    </div>

                    {/* Rewards preview */}
                    <div className="rounded-md border border-border/40 bg-background/60 p-2.5 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Rewards on Participation</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[9px] h-4 text-chart-2 border-chart-2/30">+{event.participation.rewards.xp} XP</Badge>
                        {Object.entries(event.participation.rewards.statGains).map(([stat, val]) => (
                          <Badge key={stat} variant="outline" className="text-[9px] h-4 text-primary border-primary/30">
                            +{val} {stat.replace("_stat", "")}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary">{event.participation.rewards.buffType}</span>
                        <span className="text-[10px] text-muted-foreground">+{event.participation.rewards.buffBonus} {event.participation.rewards.buffStat.replace("_stat", "")} for {event.participation.rewards.buffDurationHours}h</span>
                      </div>
                    </div>

                    {/* Join button */}
                    <Button
                      className={cn(
                        "w-full font-black uppercase tracking-widest text-xs",
                        event.rarity === "epic" && "bg-primary hover:bg-primary/90",
                      )}
                      size="sm"
                      disabled={!canAffordEnergy || !canAffordFunds || joiningEvent === event.id}
                      onClick={() => handleJoinEvent(event.id)}
                    >
                      {joiningEvent === event.id ? (
                        <span className="flex items-center gap-2"><Swords className="h-3 w-3 animate-pulse" /> Joining...</span>
                      ) : !canAffordEnergy ? (
                        "Not Enough Energy"
                      ) : !canAffordFunds ? (
                        "Not Enough Funds"
                      ) : (
                        <span className="flex items-center gap-2"><Swords className="h-3 w-3" /> Join Event</span>
                      )}
                    </Button>
                  </div>
                )}

                {/* Result display */}
                {hasResult && joinResult && (
                  <div className="border-t border-border/30 bg-background/40 p-3 space-y-3" onClick={e => e.stopPropagation()}>
                    {/* Success/Partial banner */}
                    <div className={cn(
                      "rounded-lg border p-3 space-y-2",
                      joinResult.isFullSuccess ? "border-chart-2/40 bg-chart-2/10" : "border-primary/30 bg-primary/5"
                    )}>
                      <div className="flex items-center gap-2">
                        {joinResult.isFullSuccess ? (
                          <Flame className="h-4 w-4 text-chart-2 shrink-0" />
                        ) : (
                          <Shield className="h-4 w-4 text-primary shrink-0" />
                        )}
                        <span className={cn("text-xs font-black uppercase", joinResult.isFullSuccess ? "text-chart-2" : "text-primary")}>
                          {joinResult.isFullSuccess ? "Full Success!" : "Partial Success"}
                        </span>
                        {joinResult.leveledUp && (
                          <Badge className="ml-auto bg-primary text-primary-foreground text-[9px] h-4 font-black">
                            LEVEL UP: {joinResult.newLevel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-line">
                        {joinResult.resultText}
                      </p>
                    </div>

                    {/* Earned rewards */}
                    {(joinResult.xpGain > 0 || Object.keys(joinResult.statGains).length > 0) && (
                      <div className="flex flex-wrap gap-1.5">
                        {joinResult.xpGain > 0 && (
                          <Badge variant="outline" className="text-[9px] h-4 text-chart-2 border-chart-2/30 xp-flash">+{joinResult.xpGain} XP</Badge>
                        )}
                        {Object.entries(joinResult.statGains).map(([stat, val]) => (
                          <Badge key={stat} variant="outline" className="text-[9px] h-4 text-primary border-primary/30 xp-flash">
                            +{val} {stat.replace("_stat", "")}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Buff earned */}
                    {joinResult.buffBonus > 0 && (
                      <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <div>
                          <p className="text-[10px] font-black text-primary">{joinResult.buffType}</p>
                          <p className="text-[9px] text-muted-foreground">+{joinResult.buffBonus} {joinResult.buffType.includes("Anointing") || joinResult.buffType.includes("Glory") || joinResult.buffType.includes("Fire") || joinResult.buffType.includes("Revival") || joinResult.buffType.includes("Cathedral") || joinResult.buffType.includes("Deep") || joinResult.buffType.includes("Ocean") || joinResult.buffType.includes("Fiesta") ? "anointing" : joinResult.buffType.includes("Integrity") || joinResult.buffType.includes("Authentic") || joinResult.buffType.includes("Servant") || joinResult.buffType.includes("Theological") ? "integrity" : joinResult.buffType.includes("Influence") || joinResult.buffType.includes("Spotlight") || joinResult.buffType.includes("Crusade") || joinResult.buffType.includes("Tour") ? "influence" : "charisma"} for {joinResult.buffDurationHours}h</p>
                        </div>
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full text-xs font-bold" onClick={dismissResult}>
                      <X className="h-3 w-3 mr-1.5" /> Dismiss
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
