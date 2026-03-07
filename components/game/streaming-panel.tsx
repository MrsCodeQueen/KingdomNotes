"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Disc, TrendingUp, Play, Radio, Headphones, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface RoyaltyEntry {
  id: string
  song_name: string
  income_per_tick: number
  created_at: string
}

function formatStreams(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function StreamingPanel() {
  const { data } = useSWR("/api/game/royalties", fetcher, { refreshInterval: 10000 })
  const royalties: RoyaltyEntry[] = data?.royalties ?? []
  const [streamCounts, setStreamCounts] = useState<Record<string, number>>({})

  // Simulate streaming activity based on income_per_tick
  useEffect(() => {
    if (royalties.length === 0) return

    // Initialize stream counts based on age and income
    const initial: Record<string, number> = {}
    royalties.forEach((r) => {
      const ageHours = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60)
      const baseStreams = Math.floor(ageHours * r.income_per_tick * 150 + Math.random() * 500)
      initial[r.id] = streamCounts[r.id] ?? baseStreams
    })
    setStreamCounts((prev) => {
      const merged = { ...initial }
      Object.keys(prev).forEach((k) => {
        if (merged[k] !== undefined && prev[k] > merged[k]) merged[k] = prev[k]
      })
      return merged
    })

    const interval = setInterval(() => {
      setStreamCounts((prev) => {
        const next = { ...prev }
        royalties.forEach((r) => {
          const increment = Math.floor(r.income_per_tick * 10 + Math.random() * 5)
          next[r.id] = (next[r.id] ?? 0) + increment
        })
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [royalties.length])

  const totalIncome = royalties.reduce((sum, r) => sum + r.income_per_tick, 0)
  const totalStreams = Object.values(streamCounts).reduce((sum, c) => sum + c, 0)

  if (royalties.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5 text-primary" />
            Streaming Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <Headphones className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground text-center">No recordings yet. Record an album to start streaming.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5 text-primary" />
            Streaming Dashboard
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <BarChart3 className="h-3.5 w-3.5 text-chart-2" />
              <span className="text-chart-2 font-bold">{formatStreams(totalStreams)} plays</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary font-bold">${totalIncome.toFixed(2)}/tick</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
        {royalties
          .sort((a, b) => b.income_per_tick - a.income_per_tick)
          .map((r, i) => {
            const streams = streamCounts[r.id] ?? 0
            const isTop = i === 0 && royalties.length > 1
            const isTrending = r.income_per_tick > 0.4

            return (
              <div
                key={r.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-all",
                  isTop ? "border-primary/40 bg-primary/5" : "border-border/50 bg-muted/30",
                  "hover:border-primary/30"
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Disc className={cn("h-4 w-4 text-primary", isTrending && "animate-spin-slow")} />
                </div>

                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground truncate">{r.song_name}</span>
                    {isTop && (
                      <Badge variant="secondary" className="text-[8px] h-3.5 bg-primary/10 text-primary border-primary/20 uppercase font-black shrink-0">
                        #1
                      </Badge>
                    )}
                    {isTrending && (
                      <Badge variant="secondary" className="text-[8px] h-3.5 bg-chart-2/10 text-chart-2 border-chart-2/20 uppercase font-black shrink-0">
                        Trending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                      <Play className="h-2.5 w-2.5" />
                      {formatStreams(streams)} streams
                    </span>
                    <span className="text-[10px] text-chart-2 font-mono font-bold">
                      ${r.income_per_tick.toFixed(2)}/tick
                    </span>
                  </div>
                </div>

                {/* Mini bar showing relative performance */}
                <div className="w-16 h-6 flex items-end gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, j) => {
                    const h = Math.max(4, Math.min(24, (r.income_per_tick / totalIncome) * 80 + Math.random() * 8))
                    return (
                      <div
                        key={j}
                        className={cn(
                          "flex-1 rounded-t-sm transition-all",
                          isTrending ? "bg-chart-2/60" : "bg-muted-foreground/20"
                        )}
                        style={{ height: `${h}px` }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
