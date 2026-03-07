"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, MessageCircle, Heart, UserPlus,
  Coffee, Handshake, ShieldCheck, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FellowshipPanel } from "./fellowship-panel"

const FELLOWSHIP_ACTIONS = [
  { id: "encourage", label: "Encourage", energy: 10, bonus: "Anointing", icon: <Sparkles className="h-3 w-3" /> },
  { id: "share_testimony", label: "Share Testimony", energy: 15, bonus: "Charisma", icon: <MessageCircle className="h-3 w-3" /> },
  { id: "iron_sharpens", label: "Iron Sharpens Iron", energy: 20, bonus: "Leadership", icon: <ShieldCheck className="h-3 w-3" /> }
]

interface SocialPanelProps {
  nearbyPlayers?: any[]
  relationships?: any[]
  onAction?: (playerId: string, actionId: string) => void
  isLoading?: boolean
  characterId?: string
  region?: string
}

export function SocialPanel({ 
  nearbyPlayers = [], 
  relationships = [], 
  onAction, 
  isLoading,
  characterId,
  region 
}: SocialPanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Fellowship Panel - Groups, Prayers, Friends */}
      <FellowshipPanel characterId={characterId} region={region} />

      {/* Regional Fellowship (Nearby Players) */}
      <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
        <CardHeader>
          <CardTitle className="text-worship text-base uppercase font-black flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Regional Believers
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase">Active players in your region</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {nearbyPlayers.length === 0 ? (
            <div className="text-center py-6">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No nearby believers right now</p>
              <p className="text-xs text-muted-foreground mt-1">Check back later or travel to a new region</p>
            </div>
          ) : (
            nearbyPlayers.map((player: any) => (
              <div key={player.id} className="p-3 rounded-lg border border-border/40 bg-secondary/5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground">{player.name}</p>
                      <p className="text-[9px] text-primary font-bold uppercase">Level {player.level} {player.focus}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[8px] border-chart-4 text-chart-4">Online</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {FELLOWSHIP_ACTIONS.map((action) => (
                    <Button
                      key={action.id}
                      size="sm"
                      variant="outline"
                      className="h-auto flex-col py-1.5 px-1 text-[8px] gap-1 font-bold uppercase"
                      disabled={isLoading}
                      onClick={() => onAction?.(player.id, action.id)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Covenant Bonds (Relationships) */}
      <Card className="border-border bg-card/50 backdrop-blur-sm card-glow lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-worship text-base uppercase font-black flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Covenant Bonds
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase">Your ministry partnerships and bond levels</CardDescription>
        </CardHeader>
        <CardContent>
          {relationships.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No bonds yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Interact with other believers to build covenant bonds
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {relationships.map((rel: any) => (
                <div key={rel.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{rel.friend_name}</span>
                    <span className="text-primary font-mono text-xs">{rel.bond_type} Lv.{rel.bond_level}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${(rel.bond_xp / 100) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {rel.bond_xp}/100 XP to next level
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs italic text-muted-foreground text-center mt-4">
            "A friend loveth at all times, and a brother is born for adversity." — Proverbs 17:17
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
