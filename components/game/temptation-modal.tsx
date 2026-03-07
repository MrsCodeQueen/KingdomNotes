"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldCheck, AlertCircle, TrendingDown, TrendingUp } from "lucide-react"
import { type TemptationEvent } from "@/lib/game/types"

interface TemptationModalProps {
  temptation: TemptationEvent
  onRespond: (choice: "resist" | "yield") => void
  isLoading: boolean
}

export function TemptationModal({ temptation, onRespond, isLoading }: TemptationModalProps) {
  return (
    <Dialog open={!!temptation}>
      <DialogContent className="sm:max-w-[450px] border-2 border-destructive/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-destructive">
              Moment of Testing
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-foreground font-medium leading-relaxed">
            {temptation.text}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Yield Option - The "Shortcut" */}
          <div className="rounded-lg border border-destructive/10 bg-destructive/5 p-4 transition-all hover:bg-destructive/10">
            <p className="text-xs font-bold text-destructive uppercase mb-1">The Shortcut</p>
            <p className="text-sm font-semibold mb-2">{temptation.yield_description}</p>
            <div className="flex gap-2">
              {Object.entries(temptation.yieldReward).map(([stat, val]) => (
                <span key={stat} className="flex items-center gap-1 text-[10px] font-mono font-bold text-chart-2">
                  <TrendingUp className="h-3 w-3" /> +{val} {stat}
                </span>
              ))}
              {Object.entries(temptation.yieldPenalty).map(([stat, val]) => (
                <span key={stat} className="flex items-center gap-1 text-[10px] font-mono font-bold text-destructive">
                  <TrendingDown className="h-3 w-3" /> -{val} {stat}
                </span>
              ))}
            </div>
          </div>

          {/* Resist Option - The "Narrow Road" */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-bold text-primary uppercase mb-1">The Narrow Road</p>
            <div className="flex gap-2">
              {Object.entries(temptation.resistReward).map(([stat, val]) => (
                <span key={stat} className="flex items-center gap-1 text-[10px] font-mono font-bold text-primary">
                  <ShieldCheck className="h-3 w-3" /> +{val} {stat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 font-bold border-primary/30 hover:bg-primary/10"
            onClick={() => onRespond("resist")}
            disabled={isLoading}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Resist Temptation
          </Button>
          <Button
            variant="destructive"
            className="flex-1 font-bold shadow-lg shadow-destructive/20"
            onClick={() => onRespond("yield")}
            disabled={isLoading}
          >
            {temptation.yield_label || "Yield"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}