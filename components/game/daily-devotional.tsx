"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Flame } from "lucide-react"

interface DailyDevotionalProps {
  lastDailyLogin: string | null
  dailyStreak: number
  onClaim: () => void
}

export function DailyDevotional({ lastDailyLogin, dailyStreak, onClaim }: DailyDevotionalProps) {
  const [claiming, setClaiming] = useState(false)
  const [result, setResult] = useState<{
    devotional: string
    streak: number
    statChanges: Record<string, number>
    leveledUp?: boolean
    newLevel?: number
  } | null>(null)
  const [error, setError] = useState("")

  const today = new Date().toISOString().split("T")[0]
  const alreadyClaimed = lastDailyLogin === today

  async function handleClaim() {
    setClaiming(true)
    setError("")
    try {
      const res = await fetch("/api/game/daily", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to claim")
      } else {
        setResult(data)
        onClaim()
      }
    } catch {
      setError("Failed to claim")
    } finally {
      setClaiming(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          Daily Devotional
          {dailyStreak > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs gap-1">
              <Flame className="h-3 w-3" /> {dailyStreak} day streak
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-2">
            <p className="text-sm text-foreground italic leading-relaxed">{result.devotional}</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(result.statChanges).map(([stat, val]) => (
                <span key={stat} className="text-xs font-mono text-primary">+{val} {stat}</span>
              ))}
            </div>
            {result.leveledUp && (
              <p className="text-sm font-medium text-primary">Level Up! You are now Level {result.newLevel}!</p>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Day {result.streak} streak
            </div>
          </div>
        ) : alreadyClaimed ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">You have already claimed your daily devotional today. Come back tomorrow!</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Current streak: {dailyStreak} days
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Start your day with the Word. Claim your daily devotional for energy, anointing, and XP.
              Consecutive days increase the rewards!
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full"
            >
              {claiming ? "Claiming..." : "Claim Daily Devotional"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
