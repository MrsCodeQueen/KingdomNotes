"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Zap, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { LOCAL_JOBS } from "@/lib/game/constants"

export function JobPanel({ character, onWork, isLoading }: any) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-worship uppercase tracking-widest font-black">
          <Briefcase className="h-4 w-4 text-primary" />
          The Marketplace
        </CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
          Steady income for your ministry journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {LOCAL_JOBS.map((job) => {
          const meetsReq = job.req === "none" || (character[job.req] >= job.val);
          return (
            <div key={job.id} className={cn(
              "p-3 rounded-lg border transition-all",
              meetsReq ? "border-border/40 bg-secondary/10" : "border-dashed opacity-50 bg-muted/5"
            )}>
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {job.title} {!meetsReq && <Lock className="h-3 w-3" />}
                </h4>
                <span className="font-mono font-bold text-primary">${job.pay}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> -{job.energy} EN
                </span>
                <Button
                  size="sm"
                  variant={meetsReq ? "default" : "secondary"}
                  className="h-7 px-4 text-[10px] font-black uppercase tracking-widest"
                  disabled={isLoading || !meetsReq || character.energy < job.energy}
                  onClick={() => onWork(job.id)}
                >
                  Work Shift
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
