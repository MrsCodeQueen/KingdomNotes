"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown, Flame, Star, Zap, Crown, Shield, DollarSign, Music, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { CHARACTER_SKILLS } from "@/lib/game/constants"

interface ActionResultOverlayProps {
  resultText: string
  statChanges: Record<string, number>
  trainedSkills?: { skill: string; xpGained: number; newLevel: number }[]
  leveledUp?: boolean
  newLevel?: number
  newAchievements?: { title: string }[]
  onClose: () => void
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  energy: <Zap className="h-3.5 w-3.5" />,
  anointing: <Flame className="h-3.5 w-3.5" />,
  charisma: <Star className="h-3.5 w-3.5" />,
  integrity: <Shield className="h-3.5 w-3.5" />,
  leadership: <Crown className="h-3.5 w-3.5" />,
  funds: <DollarSign className="h-3.5 w-3.5" />,
  influence: <Music className="h-3.5 w-3.5" />,
  xp: <Sparkles className="h-3.5 w-3.5" />,
}

export function ActionResultOverlay({ resultText, statChanges, trainedSkills, leveledUp, newLevel, newAchievements, onClose }: ActionResultOverlayProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter")

  useEffect(() => {
    setPhase("enter")
    const t1 = setTimeout(() => setPhase("show"), 50)
    const t2 = setTimeout(() => setPhase("exit"), 4500)
    const t3 = setTimeout(onClose, 5000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onClose])

  const gains = Object.entries(statChanges).filter(([, v]) => v > 0)
  const losses = Object.entries(statChanges).filter(([, v]) => v < 0)
  const skillDefs = new Map(CHARACTER_SKILLS.map(s => [s.key, s]))

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none",
      phase === "enter" && "opacity-0",
      phase === "show" && "opacity-100 transition-opacity duration-300",
      phase === "exit" && "opacity-0 transition-opacity duration-500",
    )}>
      {/* Backdrop glow */}
      {leveledUp && (
        <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
      )}

      <Card className={cn(
        "relative max-w-md w-full border-2 shadow-2xl pointer-events-auto cursor-pointer",
        "transition-all duration-500",
        leveledUp ? "border-primary shadow-[0_0_40px_oklch(0.80_0.16_70/0.3)]" : "border-border/50",
        phase === "enter" && "scale-90 translate-y-4",
        phase === "show" && "scale-100 translate-y-0",
        phase === "exit" && "scale-95 -translate-y-4",
      )} onClick={onClose}>
        <div className="p-5 space-y-4">
          {/* Level Up Banner */}
          {leveledUp && (
            <div className="text-center animate-in zoom-in-50 duration-700">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Level Up</p>
              <p className="text-4xl font-black text-worship tracking-tight">Level {newLevel}</p>
              <div className="mt-1 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="h-4 w-4 text-primary animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Result Text */}
          <p className={cn(
            "text-sm font-semibold leading-relaxed text-foreground",
            leveledUp && "text-center"
          )}>
            {resultText.split("[Skills:")[0].trim()}
          </p>

          {/* Stat Changes - animated counters */}
          {(gains.length > 0 || losses.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {gains.map(([stat, val], i) => (
                <Badge
                  key={stat}
                  variant="outline"
                  className={cn(
                    "gap-1.5 border-primary/30 bg-primary/10 text-primary font-mono font-bold text-xs",
                    "animate-in slide-in-from-bottom-2 fade-in duration-300",
                  )}
                  style={{ animationDelay: `${i * 100 + 200}ms` }}
                >
                  {STAT_ICONS[stat] || <TrendingUp className="h-3.5 w-3.5" />}
                  +{typeof val === "number" && val % 1 !== 0 ? val.toFixed(2) : val} {stat}
                </Badge>
              ))}
              {losses.map(([stat, val], i) => (
                <Badge
                  key={stat}
                  variant="outline"
                  className={cn(
                    "gap-1.5 border-destructive/30 bg-destructive/10 text-destructive font-mono font-bold text-xs",
                    "animate-in slide-in-from-bottom-2 fade-in duration-300",
                  )}
                  style={{ animationDelay: `${(gains.length + i) * 100 + 200}ms` }}
                >
                  {STAT_ICONS[stat] || <TrendingDown className="h-3.5 w-3.5" />}
                  {val} {stat}
                </Badge>
              ))}
            </div>
          )}

          {/* Skill Training Results */}
          {trainedSkills && trainedSkills.length > 0 && (
            <div className="border-t border-border/50 pt-3 space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skills Trained</p>
              {trainedSkills.map((s, i) => {
                const def = skillDefs.get(s.skill)
                return (
                  <div
                    key={s.skill}
                    className={cn(
                      "flex items-center justify-between rounded-md bg-secondary/50 px-3 py-1.5",
                      "animate-in slide-in-from-right-4 fade-in duration-300"
                    )}
                    style={{ animationDelay: `${i * 120 + 400}ms` }}
                  >
                    <span className="text-xs font-bold">{def?.name || s.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary">+{s.xpGained} XP</span>
                      <Badge variant="secondary" className="text-[10px] font-black">Lv {s.newLevel}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* New Achievements */}
          {newAchievements && newAchievements.length > 0 && (
            <div className="border-t border-primary/20 pt-3 animate-in zoom-in-75 duration-500">
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3">
                <Crown className="h-5 w-5 text-primary animate-bounce" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Achievement Unlocked</p>
                  <p className="text-sm font-bold">{newAchievements.map(a => a.title).join(", ")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tap to dismiss hint */}
          <p className="text-center text-[10px] text-muted-foreground/50 animate-pulse">tap to dismiss</p>
        </div>
      </Card>
    </div>
  )
}
