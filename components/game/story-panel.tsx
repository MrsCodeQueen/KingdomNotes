"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BookOpen, Lock, CheckCircle2, ChevronRight, Sparkles, Star, ArrowLeft } from "lucide-react"
import type { StoryChapter } from "@/lib/game/constants"

interface ChapterWithStatus extends StoryChapter {
  status: string
  choice_made: string | null
}

interface StoryPanelProps {
  onStoryComplete?: () => void
}

export function StoryPanel({ onStoryComplete }: StoryPanelProps) {
  const [chapters, setChapters] = useState<ChapterWithStatus[]>([])
  const [activeChapter, setActiveChapter] = useState<ChapterWithStatus | null>(null)
  const [narrativeResult, setNarrativeResult] = useState<string | null>(null)
  const [isChoosing, setIsChoosing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/game/story")
      if (res.ok) {
        const data = await res.json()
        setChapters(data.chapters ?? [])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchStory() }, [fetchStory])

  const handleChoice = async (chapterKey: string, choiceId: string) => {
    setIsChoosing(true)
    try {
      const res = await fetch("/api/game/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterKey, choiceId }),
      })
      if (res.ok) {
        const data = await res.json()
        setNarrativeResult(data.narrativeResult)
        setTimeout(() => {
          fetchStory()
          onStoryComplete?.()
        }, 1000)
      }
    } finally {
      setIsChoosing(false)
    }
  }

  const actGroups = [1, 2, 3].map(act => ({
    act,
    label: act === 1 ? "Act I: The Calling" : act === 2 ? "Act II: The Rise" : "Act III: The Cost",
    chapters: chapters.filter(ch => ch.act === act),
  }))

  const completedCount = chapters.filter(c => c.status === "completed").length
  const totalCount = chapters.length

  // -------- CHAPTER DETAIL VIEW --------
  if (activeChapter) {
    const ch = activeChapter
    const isCompleted = ch.status === "completed"
    const completedChoice = isCompleted ? ch.choices.find(c => c.id === ch.choice_made) : null

    return (
      <Card className="border-2 border-primary/20 bg-card/95 overflow-hidden">
        <CardHeader className="pb-3">
          <button
            onClick={() => { setActiveChapter(null); setNarrativeResult(null) }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Story
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] uppercase tracking-wider">Act {ch.act}</Badge>
            {isCompleted && (
              <Badge className="bg-chart-2/10 text-chart-2 text-[9px] border border-chart-2/20">Completed</Badge>
            )}
          </div>
          <CardTitle className="text-xl font-black tracking-tight text-foreground">{ch.title}</CardTitle>
          <p className="text-xs text-primary/80 font-semibold italic">{ch.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Narrative */}
          <div>
            {ch.narrative.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/90 mb-3">{para}</p>
            ))}
          </div>

          {/* Result after choosing */}
          {narrativeResult && (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-2 slide-in-bottom">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-wider text-primary">What Happened</p>
              </div>
              {narrativeResult.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/90">{para}</p>
              ))}
            </div>
          )}

          {/* Previously completed choice */}
          {isCompleted && completedChoice && !narrativeResult && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Your Choice</p>
              <p className="text-sm font-bold text-foreground">{completedChoice.label}</p>
              <p className="text-xs text-foreground/70 leading-relaxed">{completedChoice.consequences.narrativeResult}</p>
            </div>
          )}

          {/* Choices (if available) */}
          {!isCompleted && !narrativeResult && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">What Will You Do?</p>
              {ch.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(ch.key, choice.id)}
                  disabled={isChoosing}
                  className={cn(
                    "w-full rounded-lg border-2 p-4 text-left transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "border-border/50 bg-card",
                    isChoosing && "opacity-50 cursor-wait"
                  )}
                >
                  <p className="text-sm font-bold text-foreground">{choice.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{choice.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {choice.consequences.statChanges && Object.entries(choice.consequences.statChanges).map(([stat, val]) => (
                      <Badge key={stat} variant="outline" className={cn(
                        "text-[8px] h-4",
                        val > 0 ? "text-chart-2 border-chart-2/30" : "text-destructive border-destructive/30"
                      )}>
                        {stat.replace("_stat", "")} {val > 0 ? `+${val}` : val}
                      </Badge>
                    ))}
                    {choice.consequences.xpGain && (
                      <Badge variant="outline" className="text-[8px] h-4 text-chart-1 border-chart-1/30">
                        +{choice.consequences.xpGain} XP
                      </Badge>
                    )}
                    {choice.consequences.fundsChange && (
                      <Badge variant="outline" className={cn(
                        "text-[8px] h-4",
                        choice.consequences.fundsChange > 0 ? "text-chart-2 border-chart-2/30" : "text-destructive border-destructive/30"
                      )}>
                        {choice.consequences.fundsChange > 0 ? "+" : ""}${choice.consequences.fundsChange}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // -------- CHAPTER LIST VIEW --------
  return (
    <Card className="border-2 border-primary/20 bg-card/95">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-black tracking-tight">Your Story</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {completedCount}/{totalCount} Chapters
          </Badge>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-2">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          actGroups.map((group) => (
            <div key={group.act} className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{group.label}</p>
              <div className="space-y-1.5">
                {group.chapters.map((ch) => {
                  const isLocked = ch.status === "locked"
                  const isAvailable = ch.status === "available"
                  const isDone = ch.status === "completed"

                  return (
                    <button
                      key={ch.key}
                      onClick={() => !isLocked && setActiveChapter(ch)}
                      disabled={isLocked}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        isLocked && "opacity-40 cursor-not-allowed border-border/30",
                        isAvailable && "border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer",
                        isDone && "border-chart-2/20 bg-chart-2/5 hover:bg-chart-2/10 cursor-pointer",
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                        isLocked && "bg-muted",
                        isAvailable && "bg-primary/15",
                        isDone && "bg-chart-2/15",
                      )}>
                        {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        {isAvailable && <Star className="h-3.5 w-3.5 text-primary" />}
                        {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-bold truncate", isLocked ? "text-muted-foreground" : "text-foreground")}>
                          {ch.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate italic">{ch.subtitle}</p>
                      </div>
                      {!isLocked && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
