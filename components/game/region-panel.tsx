"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin, Plane, Users, Flame, Sparkles, ShieldCheck, Zap, Star } from "lucide-react"
import { REGIONS } from "@/lib/game/constants"
import { cn } from "@/lib/utils"

interface RegionPanelProps {
  currentRegion: string
  characterFunds: number
  characterEnergy: number
  onTravel: () => void
  isLoading?: boolean
}

export function RegionPanel({ currentRegion, characterFunds, characterEnergy, onTravel, isLoading: externalLoading }: RegionPanelProps) {
  const [traveling, setTraveling] = useState<string | null>(null)
  const [doingActivity, setDoingActivity] = useState<string | null>(null)
  const [activityResult, setActivityResult] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleTravel(regionId: string) {
    setTraveling(regionId)
    setError("")
    try {
      const res = await fetch("/api/game/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || "Travel failed")
      } else {
        onTravel()
      }
    } catch {
      setError("Travel failed")
    } finally {
      setTraveling(null)
    }
  }

  async function handleRegionActivity(regionId: string, activityIndex: number) {
    setDoingActivity(`${regionId}-${activityIndex}`)
    setError("")
    setActivityResult(null)
    try {
      const res = await fetch("/api/game/region-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId, activityIndex }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || "Activity failed")
      } else {
        setActivityResult(result.resultText)
        onTravel()
      }
    } catch {
      setError("Activity failed")
    } finally {
      setDoingActivity(null)
    }
  }

  const current = REGIONS.find((r) => r.id === currentRegion)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Regional Mission Fields
          </CardTitle>
          {current && (
            <Badge variant="secondary" className="gap-1.5 font-bold">
              <MapPin className="h-3 w-3 text-primary" />
              {current.name}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Travel to different regions to experience unique spiritual climates.
        </CardDescription>
        {error && <p className="text-sm font-bold text-destructive animate-pulse mt-2">{error}</p>}
        {activityResult && (
          <p className="text-sm font-medium text-chart-2 mt-2 animate-in fade-in">{activityResult}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {REGIONS.map((region) => {
          const isCurrent = region.id === currentRegion
          const cantAfford = characterFunds < region.travelCost
          const noEnergy = characterEnergy < 20

          // Simulated Social Pulse
          const activeWorshipers = Math.floor(Math.random() * 500) + 50
          const hasLiveEvent = region.id === "af" || region.id === "sa"

          return (
            <div
              key={region.id}
              className={cn(
                "group relative rounded-lg border p-4 transition-all duration-300",
                isCurrent ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">{region.name}</span>
                    {region.id === "af" && <Flame className="h-3 w-3 text-orange-500" />}
                    {region.id === "eu" && <ShieldCheck className="h-3 w-3 text-blue-500" />}
                    {isCurrent && (
                      <Badge className="text-[9px] h-4 bg-primary text-primary-foreground uppercase font-black">Local Base</Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {region.description}
                  </p>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                      <Users className="h-3 w-3" />
                      {activeWorshipers} Artists
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {region.spiritualHunger}x Hunger
                    </div>
                    {hasLiveEvent && (
                      <div className="flex items-center gap-1.5 text-[10px] text-chart-2 uppercase font-black animate-pulse">
                        <Flame className="h-3 w-3" />
                        Live Conference
                      </div>
                    )}
                  </div>

                  {/* Region-specific activities - only show for current region */}
                  {isCurrent && region.localActivities && (
                    <div className="mt-3 border-t border-border/50 pt-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Local Activities</p>
                      <div className="flex flex-col gap-1.5">
                        {region.localActivities.map((act, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-md border border-border/40 bg-muted/20 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-3 w-3 text-primary" />
                              <span className="text-xs font-medium text-foreground">{act.name}</span>
                              <span className="text-[9px] text-muted-foreground capitalize">+{act.boost} {act.stat}</span>
                              {act.funds > 0 && <span className="text-[9px] text-chart-2 font-mono">+${act.funds}</span>}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-[10px] font-bold gap-1"
                              disabled={externalLoading || doingActivity !== null || characterEnergy < 15}
                              onClick={() => handleRegionActivity(region.id, idx)}
                            >
                              <Zap className="h-2.5 w-2.5" />
                              {doingActivity === `${region.id}-${idx}` ? "..." : "Do (-15 EN)"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!isCurrent ? (
                    <>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Ticket</p>
                        <p className="text-xs font-mono font-bold text-foreground">${region.travelCost} + 20 EN</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 px-4 gap-2 font-bold"
                        disabled={cantAfford || noEnergy || traveling !== null}
                        onClick={() => handleTravel(region.id)}
                      >
                        <Plane className="h-3.5 w-3.5" />
                        {traveling === region.id ? "..." : "Travel"}
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      {hasLiveEvent && (
                        <Button size="sm" className="bg-chart-2 hover:bg-chart-2/90 h-8 gap-2 font-bold text-[10px] uppercase">
                          <Users className="h-3.5 w-3.5" /> Attend
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
