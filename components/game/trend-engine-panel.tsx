"use client"

import { getCurrentTrend, SONG_TAGS } from "@/lib/game/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TrendingUp, Music, ArrowUp, ArrowDown, Flame } from "lucide-react"
import { useEffect, useState } from "react"

function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
  return `${hours}h ${minutes}m`
}

export function TrendEnginePanel() {
  const [, setTick] = useState(0)
  const trend = getCurrentTrend()

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate time until next trend cycle
  const cycleLength = 72 * 60 * 60 * 1000
  const currentCycleStart = Math.floor(Date.now() / cycleLength) * cycleLength
  const nextCycle = currentCycleStart + cycleLength
  const remaining = nextCycle - Date.now()

  const bonusPercent = Math.round((trend.streamBonus - 1) * 100)
  const penaltyPercent = Math.round((1 - trend.streamPenalty) * 100)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Now
          </CardTitle>
          <span className="text-[10px] text-muted-foreground font-mono">
            Rotates in {formatTimeRemaining(remaining)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Trend */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{trend.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{trend.description}</p>

          {/* Matching tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SONG_TAGS.map(tag => {
              const isMatch = trend.tags.includes(tag)
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "text-[9px] font-black uppercase cursor-default transition-all",
                    isMatch
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-muted/30 text-muted-foreground/50 border-border/30"
                  )}
                >
                  {isMatch && <Music className="h-2 w-2 mr-0.5" />}
                  {tag}
                </Badge>
              )
            })}
          </div>

          {/* Bonus/penalty indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUp className="h-3 w-3 text-chart-2" />
              <span className="text-chart-2 font-bold">+{bonusPercent}%</span>
              <span className="text-muted-foreground">streams for matching songs</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowDown className="h-3 w-3 text-destructive" />
              <span className="text-destructive font-bold">-{penaltyPercent}%</span>
              <span className="text-muted-foreground">for non-matching</span>
            </div>
          </div>
        </div>

        {/* Strategy tip */}
        <div className="rounded-md bg-muted/30 border border-border/50 p-3">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground">Strategy: </span>
            Write and record songs with <span className="font-bold text-primary">{trend.tags.join(", ")}</span> tags to maximize streaming revenue during this trend cycle. Songs outside the trend will see reduced visibility.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
