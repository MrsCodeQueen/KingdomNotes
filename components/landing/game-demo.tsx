"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Mic2, PenLine, Flame, BookOpen, Music,
  Zap, Star, TrendingUp, ChevronRight, Users,
  Shield, Heart, Crown, DollarSign
} from "lucide-react"

// ------ MINI STAT BAR ------
function MiniStat({ label, value, max, icon: Icon, color }: {
  label: string; value: number; max: number;
  icon: React.ElementType; color: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("h-3 w-3 shrink-0", color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className="text-[9px] font-mono text-foreground">{value}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-700", color.replace("text-", "bg-"))} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

// ------ LIVE CHARACTER PREVIEW ------
// An interactive mini character card that shows stats animating
export function LiveCharacterPreview() {
  const [stats, setStats] = useState({ energy: 72, anointing: 34, charisma: 21, integrity: 48, level: 4, funds: 137 })
  const [lastAction, setLastAction] = useState("Private Worship")
  const [flash, setFlash] = useState<string | null>(null)

  const actions = [
    { label: "Worship", icon: Flame, stat: "anointing", gain: 8, energy: -5, text: "Your spirit rises in deep worship..." },
    { label: "Write Song", icon: PenLine, stat: "charisma", gain: 4, energy: 12, text: "New melody flows from your heart..." },
    { label: "Read Word", icon: BookOpen, stat: "integrity", gain: 6, energy: 3, text: "Scripture illuminates your path..." },
    { label: "Busking", icon: Music, stat: "charisma", gain: 3, energy: 8, text: "Passersby stop to listen..." },
  ]

  const doAction = (action: typeof actions[0]) => {
    setStats(prev => ({
      ...prev,
      [action.stat]: Math.min(100, prev[action.stat as keyof typeof prev] + action.gain),
      energy: Math.max(0, Math.min(100, prev.energy - action.energy)),
      funds: action.label === "Busking" ? prev.funds + 12 : prev.funds,
    }))
    setLastAction(action.text)
    setFlash(action.stat)
    setTimeout(() => setFlash(null), 800)
  }

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
            <Star className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground leading-none">Sister Grace</p>
            <p className="text-[9px] text-primary font-bold uppercase">Worship Intern -- LVL {stats.level}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[8px] h-4 gap-0.5 font-mono text-muted-foreground">
          <DollarSign className="h-2 w-2" />{stats.funds}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <MiniStat label="Energy" value={stats.energy} max={100} icon={Zap} color={flash === "energy" ? "text-chart-2" : "text-chart-1"} />
          <MiniStat label="Anointing" value={stats.anointing} max={100} icon={Flame} color={flash === "anointing" ? "text-chart-2" : "text-primary"} />
          <MiniStat label="Charisma" value={stats.charisma} max={100} icon={Heart} color={flash === "charisma" ? "text-chart-2" : "text-accent"} />
          <MiniStat label="Integrity" value={stats.integrity} max={100} icon={Shield} color={flash === "integrity" ? "text-chart-2" : "text-chart-2"} />
        </div>
        <p className="text-[10px] text-center text-muted-foreground italic min-h-4">{lastAction}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {actions.map(a => (
            <button
              key={a.label}
              onClick={() => doAction(a)}
              className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-2.5 py-1.5 text-[10px] font-bold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-95"
            >
              <a.icon className="h-3 w-3 text-primary" />
              {a.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ------ ANIMATED SKILL TREE PREVIEW ------
export function SkillTreePreview() {
  const [selected, setSelected] = useState(0)
  const skills = [
    { name: "Vocals", level: 23, xp: 340, max: 520, category: "Music" },
    { name: "Songwriting", level: 18, xp: 210, max: 450, category: "Music" },
    { name: "Worship Leading", level: 31, xp: 480, max: 600, category: "Ministry" },
    { name: "Preaching", level: 12, xp: 140, max: 380, category: "Ministry" },
    { name: "Networking", level: 8, xp: 90, max: 300, category: "Business" },
  ]

  // Auto-cycle through skills
  useEffect(() => {
    const t = setInterval(() => setSelected(p => (p + 1) % skills.length), 3000)
    return () => clearInterval(t)
  }, [skills.length])

  const s = skills[selected]
  const pct = (s.xp / s.max) * 100

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Skill Training</p>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {skills.map((sk, i) => (
            <button
              key={sk.name}
              onClick={() => setSelected(i)}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase transition-all",
                i === selected ? "border-primary bg-primary/15 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/30"
              )}
            >
              {sk.name}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{s.name}</span>
            <Badge variant="secondary" className="text-[9px] h-4 font-mono">LVL {s.level}</Badge>
          </div>
          <p className="text-[9px] text-muted-foreground uppercase">{s.category}</p>
          <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground text-right font-mono">{s.xp}/{s.max} XP</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ------ MINI RIVAL LEADERBOARD ------
export function MiniLeaderboard() {
  const rivals = [
    { name: "Prophet Kwame", level: 18, influence: 342, trending: true },
    { name: "Sister Grace (You)", level: 4, influence: 48, trending: false, isPlayer: true },
    { name: "Pastor Mike", level: 15, influence: 298, trending: false },
    { name: "DJ Sanctified", level: 12, influence: 187, trending: true },
    { name: "Mama Praise", level: 22, influence: 512, trending: false },
  ].sort((a, b) => b.influence - a.influence)

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regional Leaderboard</p>
        <Badge variant="outline" className="text-[8px] h-4 text-chart-1">Africa</Badge>
      </div>
      <CardContent className="p-0">
        {rivals.map((r, i) => (
          <div
            key={r.name}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 transition-colors",
              r.isPlayer && "bg-primary/5"
            )}
          >
            <span className={cn("text-xs font-bold w-4 text-center", i === 0 ? "text-primary" : "text-muted-foreground")}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs font-bold truncate", r.isPlayer ? "text-primary" : "text-foreground")}>
                {r.name}
                {r.trending && <TrendingUp className="inline h-2.5 w-2.5 ml-1 text-chart-2" />}
              </p>
              <p className="text-[9px] text-muted-foreground">LVL {r.level}</p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{r.influence} inf</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ------ STORY CHAPTER PREVIEW ------
export function StoryPreview() {
  const [step, setStep] = useState(0)
  const panels = [
    { chapter: "Ch. 1", title: "The Calling", text: "You were just a choir kid with a dream. A dusty guitar, a small church, and a voice that refused to stay quiet.", color: "text-primary" },
    { chapter: "Ch. 2", title: "First Mic", text: "Street corners become your stage. Tips are scarce, but the fire inside grows with every song.", color: "text-chart-2" },
    { chapter: "Ch. 3", title: "The Temptation", text: "A secular label offers everything. Fame. Money. But at what cost to your anointing?", color: "text-destructive" },
    { chapter: "Ch. 4", title: "Revival", text: "The Spirit moves. Your worship ignites a city-wide revival. This is what you were made for.", color: "text-primary" },
  ]

  useEffect(() => {
    const t = setInterval(() => setStep(p => (p + 1) % panels.length), 4000)
    return () => clearInterval(t)
  }, [panels.length])

  const p = panels[step]

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden relative">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Story Mode</p>
        <div className="flex gap-1">
          {panels.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30")} />
          ))}
        </div>
      </div>
      <CardContent className="p-5 space-y-2 min-h-[140px] flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[8px] h-4 uppercase font-bold", p.color)}>{p.chapter}</Badge>
          <h3 className={cn("text-sm font-bold", p.color)}>{p.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{p.text}</p>
        <div className="pt-1">
          <span className="text-[9px] font-bold text-primary flex items-center gap-0.5 cursor-pointer hover:underline">
            Play Chapter <ChevronRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ------ LIVE ACTIVITY FEED ------
export function LiveActivityFeed() {
  const [entries, setEntries] = useState([
    { id: 1, text: "Levite_99 wrote a masterpiece: \"Still Waters\"", time: "2m ago", type: "song" },
    { id: 2, text: "Prophet_Isaiah resisted the secular contract temptation", time: "5m ago", type: "integrity" },
    { id: 3, text: "Sister_Harmony leveled up to LVL 22!", time: "8m ago", type: "level" },
    { id: 4, text: "DJ_Sanctified's \"Fire\" is trending on streams", time: "12m ago", type: "trending" },
    { id: 5, text: "Mama_Grace reached 500 influence in Africa", time: "15m ago", type: "milestone" },
  ])

  const newEvents = [
    "Brother_Cross completed a 3-hour fast, anointing surging!",
    "Worship_Val's album \"Altar\" just dropped!",
    "Pastor_Mike hosted a conference with 200 attendees",
    "Psalmist_Nia's vocals reached skill level 50!",
    "Revival broke out in Lagos -- all artists gaining +25% anointing",
  ]

  useEffect(() => {
    const t = setInterval(() => {
      setEntries(prev => {
        const newEntry = {
          id: Date.now(),
          text: newEvents[Math.floor(Math.random() * newEvents.length)],
          time: "Just now",
          type: "song"
        }
        return [newEntry, ...prev.slice(0, 4)]
      })
    }, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live World Feed</p>
      </div>
      <CardContent className="p-0">
        {entries.map((e, i) => (
          <div key={e.id} className={cn("flex items-start gap-2 px-4 py-2 border-b border-border/20 last:border-0 transition-all", i === 0 && "bg-primary/3")}>
            <Users className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-foreground leading-relaxed">{e.text}</p>
              <p className="text-[8px] text-muted-foreground/60">{e.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
