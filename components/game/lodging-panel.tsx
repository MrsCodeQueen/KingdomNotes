"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, Flame, Bed, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

export function LodgingPanel({ lodgings, currentId, onCheckIn, funds }: any) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-worship uppercase tracking-widest font-black">
          <Home className="h-4 w-4 text-primary" />
          Mission Lodging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lodgings.map((l: any) => {
          const isCurrent = l.id === currentId;
          return (
            <div key={l.id} className={cn(
              "p-3 rounded-lg border transition-all",
              isCurrent ? "border-primary/60 bg-primary/5 shadow-inner" : "border-border/40"
            )}>
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  {l.name} {l.daily_rent === 0 && <Heart className="h-3 w-3 text-primary/60" />}
                </h4>
                <Badge variant="outline" className="text-[9px] border-primary/30 text-primary font-mono">
                  {isCurrent ? "ACTIVE" : l.daily_rent === 0 ? "GRACE" : `$${l.daily_rent}`}
                </Badge>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                  <Bed className="h-3 w-3" /> {l.energy_regen_bonus}% Rest
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                  <Flame className="h-3 w-3" /> +{l.anointing_bonus} Spirit
                </div>
              </div>
              {!isCurrent && (
                <Button
                  size="sm"
                  className="w-full mt-3 h-7 text-[10px] font-black uppercase tracking-widest"
                  disabled={funds < l.daily_rent}
                  onClick={() => onCheckIn(l.id)}
                >
                  Check In
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}