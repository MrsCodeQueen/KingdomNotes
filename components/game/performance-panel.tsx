"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type Character } from "@/lib/game/types"
import { type ActivityKey } from "@/lib/game/constants"
import { cn } from "@/lib/utils"
import {
  Music, Mic2, Building2, Plane, Zap, DollarSign,
  Users, Sparkles, Lock, ChevronRight, TrendingUp
} from "lucide-react"

interface PerformanceType {
  key: ActivityKey
  title: string
  subtitle: string
  icon: React.ReactNode
  energyCost: number
  fundsCost: number
  charismaReq: number
  leadershipReq: number
  rewardTier: string
  color: string
  bgGlow: string
  narrative: string
  scalingNote: string
}

const PERFORMANCES: PerformanceType[] = [
  {
    key: "street_performance", title: "Street Performance", subtitle: "Small but honest work",
    icon: <Music className="h-5 w-5" />, energyCost: 10, fundsCost: 0, charismaReq: 0, leadershipReq: 0,
    rewardTier: "$3-15", color: "text-muted-foreground", bgGlow: "",
    narrative: "Set up on the corner with nothing but your voice and an instrument. Some walk by. Some stop. Every coin earned is a seed planted.",
    scalingNote: "Earnings scale with Charisma"
  },
  {
    key: "church_concert", title: "Church Service", subtitle: "Lead worship locally",
    icon: <Mic2 className="h-5 w-5" />, energyCost: 20, fundsCost: 0, charismaReq: 0, leadershipReq: 0,
    rewardTier: "$15-60", color: "text-chart-2", bgGlow: "shadow-[0_0_15px_oklch(0.55_0.18_145/0.1)]",
    narrative: "Step behind the pulpit and lead the congregation in worship. The offering basket and the anointing both grow when you serve the local church.",
    scalingNote: "Anointing scales with region spirituality"
  },
  {
    key: "venue_concert", title: "Venue Concert", subtitle: "Big stage, big rewards",
    icon: <Building2 className="h-5 w-5" />, energyCost: 40, fundsCost: 50, charismaReq: 20, leadershipReq: 0,
    rewardTier: "$50-250+", color: "text-chart-1", bgGlow: "shadow-[0_0_20px_oklch(0.55_0.16_50/0.15)]",
    narrative: "Your name is on the marquee. The venue is packed. Sound check is done. Time to bring the house down for the glory of God.",
    scalingNote: "Earnings and influence scale heavily with Charisma"
  },
  {
    key: "multi_city_tour", title: "Multi-City Tour", subtitle: "Maximum earnings potential",
    icon: <Plane className="h-5 w-5" />, energyCost: 80, fundsCost: 200, charismaReq: 40, leadershipReq: 10,
    rewardTier: "$200-800+", color: "text-primary", bgGlow: "shadow-[0_0_25px_oklch(0.55_0.16_50/0.2)]",
    narrative: "Five cities. Five nights. Five chances to set crowds on fire. The logistics are brutal, but the impact is generational.",
    scalingNote: "All stats and earnings scale with Charisma + Anointing"
  },
]

interface PerformancePanelProps {
  character: Character
  onPerform: (action: ActivityKey) => void
  isLoading: boolean
}

export function PerformancePanel({ character, onPerform, isLoading }: PerformancePanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-wider">
          <Sparkles className="h-5 w-5 text-primary" />
          Performances
        </CardTitle>
        <CardDescription className="text-xs">
          Perform live to earn funds and followers. Rewards scale with your Charisma and Anointing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {PERFORMANCES.map((perf) => {
          const isExpanded = expanded === perf.key
          const hasEnergy = character.energy >= perf.energyCost
          const hasFunds = Number(character.funds) >= perf.fundsCost
          const hasCharisma = character.charisma >= perf.charismaReq
          const hasLeadership = character.leadership >= perf.leadershipReq
          const isLocked = !hasCharisma || !hasLeadership
          const canPerform = hasEnergy && hasFunds && !isLocked

          return (
            <div
              key={perf.key}
              className={cn(
                "group relative rounded-lg border transition-all duration-300 overflow-hidden",
                isExpanded ? "border-primary/40 bg-card" : "border-border/40 hover:border-border/80 bg-card/50",
                isLocked && "opacity-60",
                perf.bgGlow && !isLocked && isExpanded && perf.bgGlow
              )}
            >
              {/* Header Row */}
              <button
                className="flex w-full items-center gap-3 p-3 text-left"
                onClick={() => setExpanded(isExpanded ? null : perf.key)}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  isLocked ? "border-border/30 bg-muted/30 text-muted-foreground/50"
                    : isExpanded ? "border-primary/40 bg-primary/10 text-primary" : "border-border/40 bg-muted/50 " + perf.color
                )}>
                  {isLocked ? <Lock className="h-4 w-4" /> : perf.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold", isLocked ? "text-muted-foreground" : "text-foreground")}>{perf.title}</span>
                    {isLocked && (
                      <Badge variant="outline" className="text-[8px] h-4 uppercase text-muted-foreground border-border/40">
                        Locked
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{perf.subtitle}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={cn("text-xs font-bold", perf.color)}>{perf.rewardTier}</p>
                    <p className="text-[10px] text-muted-foreground">-{perf.energyCost} EN</p>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground/50 transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-border/30 px-3 pb-3 pt-3 animate-in slide-in-from-top-1 fade-in duration-200">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{perf.narrative}</p>

                  {/* Requirements */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className={cn("text-[9px] h-5", hasEnergy ? "text-chart-2 border-chart-2/30" : "text-destructive border-destructive/30")}>
                      <Zap className="h-2.5 w-2.5 mr-0.5" /> {perf.energyCost} Energy
                    </Badge>
                    {perf.fundsCost > 0 && (
                      <Badge variant="outline" className={cn("text-[9px] h-5", hasFunds ? "text-chart-1 border-chart-1/30" : "text-destructive border-destructive/30")}>
                        <DollarSign className="h-2.5 w-2.5 mr-0.5" /> ${perf.fundsCost}
                      </Badge>
                    )}
                    {perf.charismaReq > 0 && (
                      <Badge variant="outline" className={cn("text-[9px] h-5", hasCharisma ? "text-chart-1 border-chart-1/30" : "text-destructive border-destructive/30")}>
                        Charisma {character.charisma}/{perf.charismaReq}
                      </Badge>
                    )}
                    {perf.leadershipReq > 0 && (
                      <Badge variant="outline" className={cn("text-[9px] h-5", hasLeadership ? "text-chart-5 border-chart-5/30" : "text-destructive border-destructive/30")}>
                        Leadership {character.leadership}/{perf.leadershipReq}
                      </Badge>
                    )}
                  </div>

                  {/* Scaling Note */}
                  <div className="flex items-center gap-1.5 mb-3 text-[10px] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>{perf.scalingNote}</span>
                    <span className="text-foreground/60 ml-auto">
                      Charisma: {character.charisma} | Anointing: {character.anointing}
                    </span>
                  </div>

                  {/* Estimated Earnings Preview */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-md bg-muted/30 p-2 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase">Funds</p>
                      <p className="text-xs font-bold text-chart-1">{perf.rewardTier}</p>
                    </div>
                    <div className="rounded-md bg-muted/30 p-2 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase">Influence</p>
                      <p className="text-xs font-bold text-chart-3">
                        +{perf.key === "street_performance" ? "1-3" : perf.key === "church_concert" ? "2-6" : perf.key === "venue_concert" ? "5-15" : "15-40"}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted/30 p-2 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase">Anointing</p>
                      <p className="text-xs font-bold text-chart-2">
                        +{perf.key === "street_performance" ? "0-2" : perf.key === "church_concert" ? "3-8" : perf.key === "venue_concert" ? "2-7" : "3-10"}
                      </p>
                    </div>
                  </div>

                  <Button
                    className={cn(
                      "w-full font-bold uppercase tracking-wider text-xs h-9",
                      canPerform && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    disabled={!canPerform || isLoading}
                    onClick={() => onPerform(perf.key)}
                  >
                    {isLoading ? "Performing..." : isLocked ? "Requirements Not Met" : !hasEnergy ? "Not Enough Energy" : !hasFunds ? "Not Enough Funds" : (
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {perf.key === "multi_city_tour" ? "Launch Tour" : perf.key === "venue_concert" ? "Take the Stage" : perf.key === "church_concert" ? "Lead Worship" : "Start Performing"}
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
