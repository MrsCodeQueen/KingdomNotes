"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  GraduationCap, DollarSign, TrendingUp, Flame,
  Star, Crown, ScrollText, Sparkles
} from "lucide-react"
import { UNIVERSITY_CLASSES } from "@/lib/game/constants"
import { cn } from "@/lib/utils"

const STAT_ICONS: Record<string, React.ReactNode> = {
  charisma: <Star className="h-3 w-3" />,
  anointing: <Flame className="h-3 w-3" />,
  leadership: <Crown className="h-3 w-3" />,
}

const STAT_COLORS: Record<string, string> = {
  charisma: "text-chart-1",
  anointing: "text-primary",
  leadership: "text-chart-5",
}

export function UniversityPanel({ funds, character, onEnroll, isLoading }: {
  funds: number
  character: any
  onEnroll: (classId: string) => void
  isLoading: boolean
}) {
  const [hasApplied, setHasApplied] = useState(false)
  const [statement, setStatement] = useState("")

  const isEligible = character?.integrity_stat >= 25 || character?.anointing >= 40
  const isRejected = character?.integrity_stat < 5

  const getBoardMessage = () => {
    if (isRejected) return "The Board is concerned about your current reputation. Admission is denied.";
    if (character?.charisma > 25) return "The Board was moved by your eloquent statement. Welcome, Scholar!";
    return "Your application has been accepted. Welcome to the Conservatory.";
  };

  if (!hasApplied) {
    return (
      <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-worship uppercase tracking-widest font-black">
            <GraduationCap className="h-4 w-4 text-primary" />
            University Application
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
            Submit your Statement of Faith to the Board.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs">
            Admission requires a statement. Students with high **Integrity** or **Anointing** qualify for a 50% Tuition Scholarship.
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-1">
              <ScrollText className="h-3 w-3" /> Statement of Faith
            </label>
            <Textarea
              placeholder="Enter your calling and purpose..."
              className="bg-background/40 border-border resize-none h-20 text-xs"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
            />
          </div>
          <Button
            className="w-full h-10 text-[10px] font-black uppercase tracking-widest"
            disabled={statement.length < 10 || isLoading}
            onClick={() => setHasApplied(true)}
          >
            Apply for Admission
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-worship uppercase tracking-widest font-black">
          <GraduationCap className="h-4 w-4 text-primary" />
          The University
        </CardTitle>
        <div className="flex flex-col gap-1">
          <CardDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
            Board Status: <span className={isRejected ? "text-destructive" : "text-primary"}>
              {isRejected ? "Admission Denied" : "Accepted"}
            </span>
          </CardDescription>
          {!isRejected && <p className="text-[10px] italic text-muted-foreground leading-tight">"{getBoardMessage()}"</p>}
          {isEligible && !isRejected && (
            <span className="text-[9px] font-black text-primary uppercase flex items-center gap-1 animate-pulse mt-1">
              <Sparkles className="h-3 w-3" /> 50% Scholarship Applied
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {UNIVERSITY_CLASSES.map((cls) => {
          const finalCost = isEligible ? cls.cost * 0.5 : cls.cost
          const canAfford = funds >= finalCost

          return (
            <div key={cls.id} className={cn(
              "p-3 rounded-lg border transition-all",
              (canAfford && !isRejected) ? "border-border/40 bg-secondary/10" : "border-dashed opacity-50 bg-muted/5"
            )}>
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold">{cls.name}</h4>
                <div className="flex flex-col items-end">
                  <span className="font-mono font-bold text-destructive flex items-center gap-0.5">
                    <DollarSign className="h-3 w-3" />{finalCost}
                  </span>
                  {isEligible && <span className="text-[8px] line-through opacity-40 italic">${cls.cost}</span>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={cn("text-[10px] font-bold flex items-center gap-1 uppercase", STAT_COLORS[cls.stat] || "text-primary")}>
                  {STAT_ICONS[cls.stat]} +{cls.boost} {cls.stat}
                  <TrendingUp className="h-2.5 w-2.5 ml-0.5" />
                </span>
                <Button
                  size="sm"
                  variant={(canAfford && !isRejected) ? "default" : "secondary"}
                  className="h-7 px-4 text-[10px] font-black uppercase tracking-widest"
                  disabled={isLoading || !canAfford || isRejected}
                  onClick={() => onEnroll(cls.id)}
                >
                  {isRejected ? "Denied" : "Enroll"}
                </Button>
              </div>
            </div>
          )
        })}
        <Button
          variant="ghost"
          className="text-[9px] uppercase font-bold text-muted-foreground mt-1 h-6 hover:text-primary"
          onClick={() => setHasApplied(false)}
        >
          {isRejected ? "Appeal Decision" : "View Application"}
        </Button>
      </CardContent>
    </Card>
  )
}