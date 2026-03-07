"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Gift, Sparkles, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Challenge {
  key: string
  title: string
  description: string
  target: number
  action_type: string
  reward: Record<string, number>
  id?: string
  completed: boolean
  completed_at?: string
}

interface DailyChallengesProps {
  onChallengeComplete?: () => void
}

export function DailyChallenges({ onChallengeComplete }: DailyChallengesProps) {
  const { data, mutate, isLoading } = useSWR<{ challenges: Challenge[]; date: string }>(
    "/api/game/challenges",
    fetcher,
    { refreshInterval: 30000 }
  )
  const [claiming, setClaiming] = useState<string | null>(null)

  const handleClaim = async (challengeKey: string) => {
    setClaiming(challengeKey)
    try {
      const res = await fetch("/api/game/challenges/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeKey }),
      })
      if (res.ok) {
        await mutate()
        onChallengeComplete?.()
      }
    } finally {
      setClaiming(null)
    }
  }

  const completedCount = data?.challenges?.filter(c => c.completed).length || 0
  const totalCount = data?.challenges?.length || 3

  // Calculate time until reset (midnight)
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const hoursUntilReset = Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60))
  const minutesUntilReset = Math.floor(((midnight.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Card className="card-glow border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <Sparkles className="h-5 w-5 text-primary" />
            Daily Challenges
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Resets in {hoursUntilReset}h {minutesUntilReset}m
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          data?.challenges?.map((challenge) => (
            <div
              key={challenge.key}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                challenge.completed
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card/50 border-border hover:border-primary/30"
              )}
            >
              <div className="shrink-0">
                {challenge.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground">{challenge.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{challenge.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Gift className="h-3 w-3 text-accent" />
                  <span className="text-xs text-accent">
                    {Object.entries(challenge.reward).map(([k, v]) => `+${v} ${k}`).join(", ")}
                  </span>
                </div>
              </div>
              {!challenge.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 btn-glow"
                  onClick={() => handleClaim(challenge.key)}
                  disabled={claiming === challenge.key}
                >
                  {claiming === challenge.key ? "..." : "Claim"}
                </Button>
              )}
              {challenge.completed && (
                <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded">
                  Done
                </span>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
