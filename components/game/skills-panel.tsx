"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Mic, PenLine, Guitar, SlidersHorizontal, Sparkles,
  BookOpen, Music, Flame, MessageSquare, Users,
  Megaphone, DollarSign, Moon, Handshake, Dumbbell, Zap
} from "lucide-react"
import { CHARACTER_SKILLS, skillLevelFromXp, type SkillDef } from "@/lib/game/constants"
import type { CharacterSkill } from "@/lib/game/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ReactNode> = {
  "mic": <Mic className="h-4 w-4" />,
  "pen-line": <PenLine className="h-4 w-4" />,
  "guitar": <Guitar className="h-4 w-4" />,
  "sliders-horizontal": <SlidersHorizontal className="h-4 w-4" />,
  "sparkles": <Sparkles className="h-4 w-4" />,
  "book-open": <BookOpen className="h-4 w-4" />,
  "music": <Music className="h-4 w-4" />,
  "flame": <Flame className="h-4 w-4" />,
  "message-square": <MessageSquare className="h-4 w-4" />,
  "users": <Users className="h-4 w-4" />,
  "handshake": <Handshake className="h-4 w-4" />,
  "megaphone": <Megaphone className="h-4 w-4" />,
  "dollar-sign": <DollarSign className="h-4 w-4" />,
  "moon": <Moon className="h-4 w-4" />,
}

const CATEGORY_LABELS: Record<string, string> = {
  music: "Music",
  ministry: "Ministry",
  business: "Business",
  spiritual: "Spiritual",
}

interface SkillsPanelProps {
  skills: CharacterSkill[]
  energy: number
  onTrain: () => void
}

function SkillRow({ def, dbSkill, onTrain, isTraining, energy }: {
  def: SkillDef
  dbSkill?: CharacterSkill
  onTrain: (key: string) => void
  isTraining: string | null
  energy: number
}) {
  const totalXp = dbSkill?.xp_in_skill ?? 0
  const levelInfo = skillLevelFromXp(totalXp)
  const level = levelInfo.level
  const progressPct = levelInfo.xpNeeded > 0 ? (levelInfo.currentXp / levelInfo.xpNeeded) * 100 : 100
  const trained = dbSkill?.times_trained ?? 0
  const isThisTraining = isTraining === def.key
  const justLeveled = false // could track this with state

  return (
    <div className={cn(
      "flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all",
      isThisTraining && "bg-primary/5",
    )}>
      <div className={cn(
        "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
        level >= 50 ? "bg-primary/20 text-primary" :
        level >= 25 ? "bg-amber-600/20 text-amber-600" :
        "bg-muted text-muted-foreground"
      )}>
        {ICON_MAP[def.icon] ?? <Sparkles className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate">{def.name}</p>
            {level >= 50 && <Badge className="h-4 text-[8px] bg-primary/80">Master</Badge>}
            {level >= 25 && level < 50 && <Badge variant="outline" className="h-4 text-[8px]">Skilled</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground tabular-nums">{trained}x</span>
            <Badge variant="outline" className="text-xs tabular-nums font-bold h-5 min-w-[44px] justify-center">
              Lv {level}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progressPct} className="h-1.5 flex-1" />
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-6 px-2 text-[10px] font-bold shrink-0 gap-1 transition-all",
              energy >= 8 && "hover:bg-primary hover:text-primary-foreground"
            )}
            disabled={isTraining !== null || energy < 8 || level >= 100}
            onClick={() => onTrain(def.key)}
          >
            {isThisTraining ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                <Dumbbell className="h-3 w-3" />
                Train
              </>
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[10px] text-muted-foreground truncate">{def.description}</p>
          <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
            {levelInfo.currentXp}/{levelInfo.xpNeeded} XP
          </span>
        </div>
      </div>
    </div>
  )
}

export function SkillsPanel({ skills, energy, onTrain }: SkillsPanelProps) {
  const { toast } = useToast()
  const [trainingSkill, setTrainingSkill] = useState<string | null>(null)
  const skillMap = new Map(skills.map(s => [s.skill_key, s]))
  const categories = ["music", "ministry", "business", "spiritual"]

  const totalLevels = CHARACTER_SKILLS.reduce((sum, def) => {
    const db = skillMap.get(def.key)
    return sum + skillLevelFromXp(db?.xp_in_skill ?? 0).level
  }, 0)
  const avgLevel = Math.round(totalLevels / CHARACTER_SKILLS.length)

  const handleTrain = async (skillKey: string) => {
    setTrainingSkill(skillKey)
    try {
      const res = await fetch("/api/game/skills/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillKey }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({
          title: data.leveledUp ? `${data.skillName} leveled up!` : `${data.skillName} trained!`,
          description: `+${data.xpGained} XP${data.leveledUp ? ` -- Now Level ${data.newLevel}!` : ""} (-${data.energyCost} energy)`,
        })
        onTrain() // refresh game data
      } else {
        toast({ title: "Cannot train", description: data.error })
      }
    } finally {
      setTrainingSkill(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold tracking-wide uppercase flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            Trainable Skills
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>8 EN / train</span>
            </div>
            <Badge className="bg-amber-600 text-white text-xs">
              Avg Lv {avgLevel}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Train skills directly or grow them passively through activities. Higher levels require more practice.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="music">
          <TabsList className="w-full grid grid-cols-4">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {CATEGORY_LABELS[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map(cat => {
            const catSkills = CHARACTER_SKILLS.filter(s => s.category === cat)
            return (
              <TabsContent key={cat} value={cat} className="mt-2">
                <div className="space-y-1">
                  {catSkills.map(def => (
                    <SkillRow
                      key={def.key}
                      def={def}
                      dbSkill={skillMap.get(def.key)}
                      onTrain={handleTrain}
                      isTraining={trainingSkill}
                      energy={energy}
                    />
                  ))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
