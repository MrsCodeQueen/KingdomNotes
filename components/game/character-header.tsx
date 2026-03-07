"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Character } from "@/lib/game/types"
import { getRegion, getLevelFromXp, getMinistryTitle } from "@/lib/game/constants"
import { MapPin, LogOut, Star, TrendingUp, Clock, Heart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CharacterHeaderProps {
  character: Character
}

export function CharacterHeader({ character }: CharacterHeaderProps) {
  const router = useRouter()
  const region = getRegion(character.region)
  const ministryTitle = getMinistryTitle(character.level)
  const { currentXp, xpNeeded } = getLevelFromXp(character.xp)
  const xpPercent = Math.round((currentXp / xpNeeded) * 100)

  // Kingdom Clock Logic (Accelerated: 1 real hour = 1 game day)
  const [gameTime, setGameTime] = useState("")

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      // Logic to convert real-time seconds into game-time minutes
      const totalRealSecondsToday = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds()
      const gameMinutesElapsed = (totalRealSecondsToday * 24) / 60

      const gHours = Math.floor((gameMinutesElapsed / 60) % 24)
      const gMins = Math.floor(gameMinutesElapsed % 60)
      const ampm = gHours >= 12 ? 'PM' : 'AM'
      const displayHours = gHours % 12 || 12

      setGameTime(`${displayHours}:${gMins.toString().padStart(2, '0')} ${ampm}`)
    }

    const timer = setInterval(updateClock, 1000)
    updateClock()
    return () => clearInterval(timer)
  }, [])

  // Dynamic visual feedback based on Anointing level
  const isHighAnointing = character.anointing > 70
  const glowIntensity = Math.min(character.anointing / 10, 10)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 md:px-6 transition-all duration-1000",
        isHighAnointing && "border-primary/50 shadow-[0_0_15px_rgba(217,170,60,0.25)]"
      )}
      style={{
        // Inline shadow style that grows as Anointing grows
        boxShadow: character.anointing > 20
          ? `0 4px ${glowIntensity * 2}px -2px rgba(217, 170, 60, ${character.anointing / 180})`
          : 'none'
      }}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex items-center gap-2 transition-all duration-500",
          character.anointing > 50 && "animate-pulse"
        )}>
          <Logo size="sm" />
        </div>

        <div className="hidden items-center gap-3 text-sm md:flex border-l border-border pl-4">
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{character.artist_name}</span>
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", ministryTitle.color)}>{ministryTitle.title}</span>
          </div>
          <Badge variant="secondary" className="text-[10px] h-5 gap-1 font-mono">
            <Star className="h-2.5 w-2.5 fill-current" />
            LVL {character.level}
          </Badge>
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="h-3 w-3" />
            {region.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Kingdom Clock - Vital for Fasting/Sims-speed gameplay */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-mono font-bold w-16">{gameTime}</span>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              <TrendingUp className="h-3 w-3" />
              Progress
            </div>
            <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden border border-border/50">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-3 text-sm font-mono sm:flex">
            <span className="text-primary">{`Influence: ${character.influence}`}</span>
            <span className="flex items-center gap-1 text-accent">
              <Heart className="h-3 w-3 fill-current" />
              {character.favor || 0}
            </span>
          </span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
