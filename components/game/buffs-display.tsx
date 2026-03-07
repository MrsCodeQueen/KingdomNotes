"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Buff } from "@/lib/game/types"
import { Sparkles } from "lucide-react"

interface BuffsDisplayProps {
  buffs: Buff[]
}

export function BuffsDisplay({ buffs }: BuffsDisplayProps) {
  const activeBuffs = buffs.filter((b) => new Date(b.expires_at) > new Date())

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          Active Buffs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeBuffs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active buffs</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeBuffs.map((buff) => {
              const minutesLeft = Math.max(0, Math.round((new Date(buff.expires_at).getTime() - Date.now()) / 60000))
              return (
                <Badge key={buff.id} variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span>{buff.buff_type}</span>
                  <span className="text-muted-foreground">+{buff.bonus} {buff.stat_affected}</span>
                  <span className="text-xs text-muted-foreground">({minutesLeft}m)</span>
                </Badge>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
