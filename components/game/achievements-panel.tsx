"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Shield, Flame, Globe, Mic, PenLine, Users, Crown, Calendar, DollarSign, Sparkles } from "lucide-react"
import { ACHIEVEMENTS, type AchievementKey } from "@/lib/game/constants"
import type { Achievement } from "@/lib/game/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ICON_MAP: Record<string, React.ReactNode> = {
  pen: <PenLine className="h-4 w-4" />,
  mic: <Mic className="h-4 w-4" />,
  flame: <Flame className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  crown: <Crown className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
  globe: <Globe className="h-4 w-4" />,
  graduation: <Users className="h-4 w-4" />,
  dollar: <DollarSign className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
}

export function AchievementsPanel() {
  const { data } = useSWR("/api/game/achievements", fetcher)
  const unlocked: Achievement[] = data?.achievements ?? []
  const unlockedKeys = new Set(unlocked.map((a) => a.achievement_key))

  const allAchievements = Object.entries(ACHIEVEMENTS) as [AchievementKey, typeof ACHIEVEMENTS[AchievementKey]][]
  const unlockedCount = unlocked.length
  const totalCount = allAchievements.length

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements
          <Badge variant="secondary" className="ml-auto text-xs">{unlockedCount}/{totalCount}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 max-h-72 overflow-y-auto">
        {allAchievements.map(([key, ach]) => {
          const isUnlocked = unlockedKeys.has(key)
          return (
            <div
              key={key}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                isUnlocked ? "border-primary/30 bg-primary/5" : "border-border/50 opacity-40"
              }`}
            >
              <span className={isUnlocked ? "text-primary" : "text-muted-foreground"}>
                {ICON_MAP[ach.icon] || <Star className="h-4 w-4" />}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {ach.title}
                </span>
                <p className="text-xs text-muted-foreground">{ach.description}</p>
              </div>
              {isUnlocked && (
                <Badge variant="outline" className="text-xs border-primary/50 text-primary shrink-0">Unlocked</Badge>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
