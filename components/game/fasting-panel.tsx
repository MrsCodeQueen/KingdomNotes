"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FASTING_DURATIONS } from "@/lib/game/constants"
import { type Character } from "@/lib/game/types"
import { Flame, Zap, Sparkles, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FastingPanelProps {
  character: Character
  onStartFast: (minutes: number) => void
  onEndFast: () => void
  isLoading: boolean
}

export function FastingPanel({ character, onStartFast, onEndFast, isLoading }: FastingPanelProps) {
  const isFasting = character.is_fasting

  if (isFasting && character.fast_started_at) {
    const startTime = new Date(character.fast_started_at).getTime()
    const endTime = startTime + (character.fast_duration_minutes * 60 * 1000)
    const now = Date.now()
    const remaining = Math.max(0, Math.round((endTime - now) / 60000))
    const isComplete = remaining <= 0

    return (
      <Card className="border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4 text-primary animate-pulse" />
            Consecration in Progress
          </CardTitle>
          <CardDescription className="font-medium text-primary/80">
            {isComplete
              ? "The heavens are open! Break your fast to receive the spiritual blessing."
              : `${remaining} minutes until spiritual breakthrough`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-background/50 p-3 border border-primary/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground italic">Current Atmosphere:</span>
              <span className="flex items-center gap-1 font-bold text-primary">
                <Sparkles className="h-3 w-3" />
                Intensifying
              </span>
            </div>
          </div>
          <Button
            variant={isComplete ? "default" : "outline"}
            className={cn(
              "w-full font-bold transition-all",
              isComplete && "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            )}
            onClick={onEndFast}
            disabled={isLoading}
          >
            {isComplete ? "Break Fast & Claim Anointing" : "End Consecration Early"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-primary" />
          Spiritual Fasting
        </CardTitle>
        <CardDescription className="text-xs">
          Drains physical energy to massively multiply Anointing for your next ministry session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            {FASTING_DURATIONS.map((d) => {
              const willExhaust = character.energy < d.energyDrain;

              return (
                <Button
                  key={d.minutes}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex flex-col h-auto py-3 gap-1 items-center border-border/60 hover:border-primary/50 hover:bg-primary/5",
                    willExhaust && "opacity-80"
                  )}
                  disabled={isLoading || character.energy < 15}
                  onClick={() => onStartFast(d.minutes)}
                >
                  <span className="font-bold">{d.label}</span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center text-destructive font-medium">
                      <Zap className="h-2.5 w-2.5 mr-0.5" />
                      -{d.energyDrain}
                    </span>
                    <span className="flex items-center text-primary font-medium">
                      <Flame className="h-2.5 w-2.5 mr-0.5" />
                      +{d.anointingBonus}
                    </span>
                  </div>
                  {willExhaust && (
                    <span className="flex items-center gap-1 text-[9px] text-orange-500 font-bold mt-1 uppercase">
                      <AlertTriangle className="h-2 w-2" />
                      Danger: Exhaustion
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground italic text-center px-4">
            "But this kind goeth not out but by prayer and fasting." — Matthew 17:21
          </p>
        </div>
      </CardContent>
    </Card>
  )
}