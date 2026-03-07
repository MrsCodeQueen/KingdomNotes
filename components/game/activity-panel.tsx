"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ACTIVITIES, type ActivityKey } from "@/lib/game/constants"
import { type Character } from "@/lib/game/types"
import {
  Music, BookOpen, Moon, Flame, Mic, Users,
  Guitar, Coffee, PenLine, GraduationCap, School, Sparkles,
  Heart, Headphones, MessageSquare, Megaphone, Radio, Cross
} from "lucide-react"
import { cn } from "@/lib/utils"

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  busking: <Guitar className="h-4 w-4" />,
  worship: <Flame className="h-4 w-4" />,
  soaking: <Coffee className="h-4 w-4" />,
  scripture: <BookOpen className="h-4 w-4" />,
  nap: <Moon className="h-4 w-4" />,
  songwriting: <PenLine className="h-4 w-4" />,
  jam_session: <Music className="h-4 w-4" />,
  recording: <Mic className="h-4 w-4" />,
  teach_class: <School className="h-4 w-4" />,
  mentor: <GraduationCap className="h-4 w-4" />,
  conference: <Users className="h-4 w-4" />,
  church_service: <Cross className="h-4 w-4" />,
  bible_study: <BookOpen className="h-4 w-4" />,
  choir_rehearsal: <Headphones className="h-4 w-4" />,
  praise_team: <Mic className="h-4 w-4" />,
  testimony: <MessageSquare className="h-4 w-4" />,
  youth_revival: <Megaphone className="h-4 w-4" />,
  live_album: <Radio className="h-4 w-4" />,
}

const ACTIVITY_CATEGORIES = {
  "Restoration": ["nap", "worship", "soaking", "scripture"] as ActivityKey[],
  "Church Life": ["church_service", "bible_study", "choir_rehearsal", "praise_team"] as ActivityKey[],
  "Career": ["busking", "songwriting", "jam_session", "recording"] as ActivityKey[],
  "Ministry": ["testimony", "youth_revival", "live_album"] as ActivityKey[],
  "Leadership": ["teach_class", "mentor", "conference"] as ActivityKey[],
}

interface ActivityPanelProps {
  character: Character
  onPerformAction: (action: ActivityKey) => void
  onPourOut?: () => void // Added for the Pour Out mechanic
  isLoading: boolean
}

export function ActivityPanel({ character, onPerformAction, onPourOut, isLoading }: ActivityPanelProps) {
  // Spirit-led check: High anointing provides a "glow" to creative tasks
  const isSpiritLed = character.anointing >= 70;

  // Pour Out Logic: Vessel is full at 100
  const isVesselFull = character.anointing >= 100;

  return (
    <div className="flex flex-col gap-4">
      {/* NEW: Pour Out Mechanic - Placed at the top for visibility when full */}
      <div className="flex flex-col gap-2">
        <Button
          disabled={!isVesselFull || isLoading}
          onClick={onPourOut}
          className={cn(
            "w-full h-14 font-black uppercase tracking-widest transition-all duration-700 border-2",
            isVesselFull
              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_oklch(0.55_0.16_50)] animate-pulse"
              : "bg-muted/20 text-muted-foreground opacity-50 border-transparent"
          )}
        >
          <Flame className={cn("mr-2 h-5 w-5", isVesselFull && "animate-bounce text-worship")} />
          {isVesselFull ? "Pour Out Before God" : `Vessel Filling (${character.anointing}/100)`}
        </Button>
        {isVesselFull && (
          <p className="text-[10px] text-primary text-center font-black animate-in fade-in slide-in-from-top-1 uppercase tracking-widest">
            <Sparkles className="inline h-3 w-3 mr-1" />
            Your vessel is full. Pour it out to expand your influence.
          </p>
        )}
      </div>

      {Object.entries(ACTIVITY_CATEGORIES).map(([category, activities]) => (
        <Card key={category} className={cn(
          "transition-all duration-500",
          category === "Leadership" && character.influence < 5 && "opacity-60 grayscale"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              {category}
              {category === "Leadership" && character.influence < 5 && (
                <span className="text-[10px] font-bold text-muted-foreground border border-border px-1.5 py-0.5 rounded uppercase">
                  Locked: Need 5 Influence
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {category === "Restoration" ? "Rest your body and renew your spirit" :
                category === "Church Life" ? "Serve the local church and grow in community" :
                  category === "Career" ? "Create music and earn funds" :
                    category === "Ministry" ? "Share your gifts and expand your reach" :
                      "Grow your influence and guide others"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {activities.map((key) => {
                const activity = ACTIVITIES[key]
                const canAfford = character.energy >= activity.energyCost
                const isActive = character.current_activity === key

                // Enhanced Unlock Logic
                const meetsRequirements =
                  key === "recording" ? character.funds >= 25 :
                    key === "conference" ? character.leadership >= 10 && character.funds >= 100 && character.influence >= 20 :
                      key === "mentor" ? character.leadership >= 3 && character.influence >= 5 :
                        key === "teach_class" ? character.charisma >= 15 && character.influence >= 2 :
                          key === "bible_study" ? character.leadership >= 2 :
                            key === "testimony" ? character.charisma >= 10 :
                              key === "youth_revival" ? character.leadership >= 5 && character.charisma >= 15 :
                                key === "live_album" ? character.charisma >= 25 && character.funds >= 75 :
                                  true

                // Visual indicator for Spirit-led sessions
                const showSpiritEffect = isSpiritLed && ["songwriting", "recording", "worship"].includes(key);

                return (
                  <Button
                    key={key}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "h-auto flex-col items-start gap-1 p-3 text-left transition-all",
                      showSpiritEffect && "border-primary/50 bg-primary/5 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)] hover:border-primary",
                      isActive && "ring-2 ring-primary ring-offset-2"
                    )}
                    disabled={isLoading || (!canAfford && !isActive) || (!meetsRequirements && !isActive)}
                    onClick={() => onPerformAction(key)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {ACTIVITY_ICONS[key]}
                        {activity.label}
                        {showSpiritEffect && <Sparkles className="h-3 w-3 text-primary animate-pulse" />}
                      </span>
                      {activity.energyCost > 0 && (
                        <span className="text-xs text-muted-foreground">
                          -{activity.energyCost} EN
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-normal text-muted-foreground">
                      {activity.description}
                    </span>

                    {/* Dynamic Error Messages */}
                    {!meetsRequirements && !isActive && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {key === "recording" && <span className="text-[10px] text-destructive">Need $25</span>}
                        {key === "teach_class" && <span className="text-[10px] text-destructive">Need Charisma 15 & 2 Influence</span>}
                        {key === "mentor" && <span className="text-[10px] text-destructive">Need Leadership 3 & 5 Influence</span>}
                        {key === "conference" && <span className="text-[10px] text-destructive">Need Leadership 10, $100, & 20 Influence</span>}
                        {key === "bible_study" && <span className="text-[10px] text-destructive">Need Leadership 2</span>}
                        {key === "testimony" && <span className="text-[10px] text-destructive">Need Charisma 10</span>}
                        {key === "youth_revival" && <span className="text-[10px] text-destructive">Need Leadership 5 & Charisma 15</span>}
                        {key === "live_album" && <span className="text-[10px] text-destructive">Need Charisma 25 & $75</span>}
                      </div>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
