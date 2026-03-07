"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { type RandomOpportunity } from "@/lib/game/constants"
import { cn } from "@/lib/utils"
import {
  Radio, Mic, Flame, GraduationCap, Heart, MessageSquare,
  Music, Award, Disc, Zap, DollarSign, Clock, Sparkles,
  Star, RefreshCw, ChevronDown, Trophy, Timer
} from "lucide-react"

const ICON_MAP: Record<string, React.ReactNode> = {
  Radio: <Radio className="h-4 w-4" />,
  Mic: <Mic className="h-4 w-4" />,
  Flame: <Flame className="h-4 w-4" />,
  GraduationCap: <GraduationCap className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  Disc: <Disc className="h-4 w-4" />,
}

const RARITY_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  common: { bg: "bg-muted/30", text: "text-muted-foreground", border: "border-border/40", glow: "" },
  rare: { bg: "bg-chart-3/5", text: "text-chart-3", border: "border-chart-3/30", glow: "" },
  epic: { bg: "bg-primary/5", text: "text-primary", border: "border-primary/30", glow: "shadow-[0_0_15px_oklch(0.55_0.16_50/0.1)]" },
  legendary: { bg: "bg-chart-1/10", text: "text-chart-1", border: "border-chart-1/40", glow: "shadow-[0_0_25px_oklch(0.55_0.16_50/0.2)]" },
}

interface OpportunitiesPanelProps {
  energy: number
  funds: number
  onComplete: () => void
}

export function OpportunitiesPanel({ energy, funds, onComplete }: OpportunitiesPanelProps) {
  const [opportunity, setOpportunity] = useState<RandomOpportunity | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [result, setResult] = useState<{
    fullSuccess: boolean
    narrative: string
    xpGain: number
    fundsGain: number
    statGains: Record<string, number>
    buffGranted: string | null
    buffDuration: number | null
  } | null>(null)
  const { toast } = useToast()

  const checkForOpportunity = useCallback(async () => {
    setIsChecking(true)
    try {
      const res = await fetch("/api/game/opportunities")
      if (res.ok) {
        const data = await res.json()
        if (data.opportunity) {
          setOpportunity(data.opportunity)
          setExpiresAt(data.expiresAt)
          setResult(null)
          setExpanded(true)
        } else {
          setOpportunity(null)
          setExpiresAt(null)
        }
      }
    } finally {
      setIsChecking(false)
    }
  }, [])

  // Auto-check on mount
  useEffect(() => {
    checkForOpportunity()
  }, [checkForOpportunity])

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const remaining = new Date(expiresAt).getTime() - Date.now()
      if (remaining <= 0) {
        setOpportunity(null)
        setExpiresAt(null)
        setTimeLeft("")
        clearInterval(interval)
        return
      }
      const mins = Math.floor(remaining / 60000)
      const secs = Math.floor((remaining % 60000) / 1000)
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const handleJoin = async () => {
    if (!opportunity) return
    setIsJoining(true)
    try {
      const res = await fetch("/api/game/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({
          fullSuccess: data.fullSuccess,
          narrative: data.narrative,
          xpGain: data.xpGain,
          fundsGain: data.fundsGain,
          statGains: data.statGains,
          buffGranted: data.buffGranted,
          buffDuration: data.buffDuration,
        })
        onComplete()
      } else {
        toast({ title: "Cannot Join", description: data.error || "Something went wrong." })
      }
    } finally {
      setIsJoining(false)
    }
  }

  const handleDismissResult = () => {
    setResult(null)
    setOpportunity(null)
    setExpiresAt(null)
  }

  if (!opportunity && !result) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-black uppercase tracking-wider">
            <Star className="h-4 w-4 text-muted-foreground" />
            Random Opportunities
          </CardTitle>
          <CardDescription className="text-xs">
            Special time-limited events that offer unique rewards. Check back often.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center">
              <Timer className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground">No active opportunities right now.</p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={checkForOpportunity}
              disabled={isChecking}
            >
              <RefreshCw className={cn("h-3 w-3 mr-1.5", isChecking && "animate-spin")} />
              {isChecking ? "Checking..." : "Scout for Opportunities"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const rarity = opportunity ? RARITY_STYLES[opportunity.rarity] : RARITY_STYLES.common
  const canJoin = opportunity
    ? energy >= opportunity.energyCost && funds >= opportunity.fundsCost
    : false

  return (
    <Card className={cn("border transition-all duration-500", rarity.border, rarity.glow)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-black uppercase tracking-wider">
            <Star className={cn("h-4 w-4", rarity.text)} />
            Opportunity
          </CardTitle>
          {timeLeft && !result && (
            <Badge variant="outline" className={cn("text-[9px] h-5 font-mono", rarity.text, rarity.border)}>
              <Clock className="h-2.5 w-2.5 mr-0.5" /> {timeLeft}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {result ? (
          /* ===== RESULT VIEW ===== */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-3">
            <div className={cn(
              "rounded-lg p-3",
              result.fullSuccess ? "bg-chart-2/10 border border-chart-2/20" : "bg-chart-1/10 border border-chart-1/20"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {result.fullSuccess ? (
                  <Trophy className="h-4 w-4 text-chart-2" />
                ) : (
                  <Star className="h-4 w-4 text-chart-1" />
                )}
                <span className={cn("text-sm font-bold", result.fullSuccess ? "text-chart-2" : "text-chart-1")}>
                  {result.fullSuccess ? "Success!" : "Partial Success"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{result.narrative}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[9px] h-5 text-chart-3 border-chart-3/30">
                +{result.xpGain} XP
              </Badge>
              {result.fundsGain > 0 && (
                <Badge variant="outline" className="text-[9px] h-5 text-chart-1 border-chart-1/30">
                  +${result.fundsGain.toFixed(2)}
                </Badge>
              )}
              {Object.entries(result.statGains).map(([stat, val]) => (
                <Badge key={stat} variant="outline" className="text-[9px] h-5 text-chart-2 border-chart-2/30">
                  {stat} +{val}
                </Badge>
              ))}
              {result.buffGranted && (
                <Badge className="text-[9px] h-5 bg-primary/15 text-primary border border-primary/30">
                  <Sparkles className="h-2 w-2 mr-0.5" /> {result.buffGranted} ({result.buffDuration}h)
                </Badge>
              )}
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs mt-2" onClick={handleDismissResult}>
              Dismiss
            </Button>
          </div>
        ) : opportunity && (
          /* ===== OPPORTUNITY VIEW ===== */
          <div className="space-y-3">
            {/* Header */}
            <button
              className="flex items-center gap-3 w-full text-left"
              onClick={() => setExpanded(!expanded)}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                rarity.bg, rarity.border, rarity.text
              )}>
                {ICON_MAP[opportunity.icon] ?? <Star className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{opportunity.title}</span>
                  <Badge variant="outline" className={cn("text-[8px] h-3.5 uppercase", rarity.text, rarity.border)}>
                    {opportunity.rarity}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{opportunity.description}</p>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground/50 transition-transform", expanded && "rotate-180")} />
            </button>

            {expanded && (
              <div className="animate-in slide-in-from-top-1 fade-in duration-200 space-y-3 border-t border-border/30 pt-3">
                {/* Narrative */}
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  {`"${opportunity.description}"`}
                </p>

                {/* Requirements */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={cn("text-[9px] h-5", energy >= opportunity.energyCost ? "text-chart-2 border-chart-2/30" : "text-destructive border-destructive/30")}>
                    <Zap className="h-2.5 w-2.5 mr-0.5" /> {opportunity.energyCost} Energy
                  </Badge>
                  {opportunity.fundsCost > 0 && (
                    <Badge variant="outline" className={cn("text-[9px] h-5", funds >= opportunity.fundsCost ? "text-chart-1 border-chart-1/30" : "text-destructive border-destructive/30")}>
                      <DollarSign className="h-2.5 w-2.5 mr-0.5" /> ${opportunity.fundsCost}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[9px] h-5 text-muted-foreground border-border/40">
                    Success: {Math.round(opportunity.successRate * 100)}%
                  </Badge>
                </div>

                {/* Rewards Preview */}
                <div className="rounded-md bg-muted/20 border border-border/30 p-2.5 space-y-1.5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Rewards</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[9px] h-4 text-chart-3 border-chart-3/30">+{opportunity.rewards.xp} XP</Badge>
                    {opportunity.rewards.funds > 0 && (
                      <Badge variant="outline" className="text-[9px] h-4 text-chart-1 border-chart-1/30">+${opportunity.rewards.funds}</Badge>
                    )}
                    {Object.entries(opportunity.rewards.statGains).map(([stat, val]) => (
                      <Badge key={stat} variant="outline" className="text-[9px] h-4 text-chart-2 border-chart-2/30">{stat} +{val}</Badge>
                    ))}
                    {opportunity.rewards.buffType && (
                      <Badge className="text-[9px] h-4 bg-primary/10 text-primary border border-primary/30">
                        <Sparkles className="h-2 w-2 mr-0.5" /> {opportunity.rewards.buffType} ({opportunity.rewards.buffDurationHours}h)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 font-bold uppercase tracking-wider text-xs h-9"
                    disabled={!canJoin || isJoining}
                    onClick={handleJoin}
                  >
                    {isJoining ? "Joining..." : !canJoin ? "Cannot Join" : "Accept Opportunity"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 px-3"
                    onClick={() => { setOpportunity(null); setExpiresAt(null) }}
                  >
                    Pass
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
