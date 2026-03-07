"use client"

import { type Character } from "@/lib/game/types"
import { getLevelFromXp } from "@/lib/game/constants"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Flame, Shield, Sparkles, Crown, Globe,
  Star, TrendingUp, Zap, Heart
} from "lucide-react"

interface CharacterPanelProps {
  character: Character
  onUpgradeSkill: (skillId: string) => void
  isLoading: boolean
}

const SKILLS = [
  { id: "anointing", label: "Anointing", icon: Flame, color: "text-amber-500", description: "Spiritual fire and worship depth" },
  { id: "favor", label: "Favor", icon: Heart, color: "text-rose-400", description: "Divine favor earned through faithful service" },
  { id: "integrity_stat", label: "Integrity", icon: Shield, color: "text-emerald-500", description: "Moral strength - fills Leadership at 250+" },
  { id: "charisma", label: "Charisma", icon: Sparkles, color: "text-violet-400", description: "Stage presence and crowd connection" },
  { id: "leadership", label: "Leadership", icon: Crown, color: "text-sky-400", description: "Ability to guide and mentor others" },
]

export function CharacterPanel({ character, onUpgradeSkill, isLoading }: CharacterPanelProps) {
  const levelInfo = getLevelFromXp(character.xp || 0)
  const xpProgress = levelInfo.xpNeeded > 0
    ? Math.min(100, (levelInfo.currentXp / levelInfo.xpNeeded) * 100)
    : 100

  const skillPoints = Math.max(0, (character.level || 1) - 1 - ((character as Record<string, unknown>).skill_points_used as number || 0))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Character Overview */}
      <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-worship">Character Overview</span>
          </CardTitle>
          <CardDescription>Level {character.level || 1} - {character.region?.replace("_", " ") || "Unknown"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Experience</span>
              <span className="font-mono text-xs">{levelInfo.currentXp} / {levelInfo.xpNeeded} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{character.influence || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
                <Globe className="h-3 w-3" /> Influence
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
              <p className="text-2xl font-bold text-chart-2">${Number(character.funds || 0).toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> Funds
              </p>
            </div>
          </div>

          {skillPoints > 0 && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center animate-pulse">
              <p className="text-sm font-bold text-primary">
                <Zap className="h-4 w-4 inline mr-1" />
                {skillPoints} Skill Point{skillPoints > 1 ? "s" : ""} Available
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Upgrade a skill below</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-worship">Skills</span>
          </CardTitle>
          <CardDescription>Core attributes that define your ministry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {SKILLS.map((skill) => {
            const value = Number((character as Record<string, unknown>)[skill.id] || 0)
            const Icon = skill.icon
            return (
              <div key={skill.id} className="rounded-lg border border-border/40 bg-muted/10 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${skill.color}`} />
                    <span className="text-sm font-semibold">{skill.label}</span>
                    <span className="text-xs font-mono text-muted-foreground">{value}/100</span>
                  </div>
                  {skillPoints > 0 && value < 100 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[10px] font-bold"
                      disabled={isLoading}
                      onClick={() => onUpgradeSkill(skill.id)}
                    >
                      +5
                    </Button>
                  )}
                </div>
                <Progress value={value} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground mt-1">{skill.description}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
