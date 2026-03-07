"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Music, Users, Check, X, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function CollabPanel({ invitations, activeCollabs, onAccept, onDecline, isLoading }: any) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Pending Invitations */}
      <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
        <CardHeader className="pb-3">
          <CardTitle className="text-worship text-base uppercase font-black flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" /> Collab Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invitations.length === 0 ? (
            <p className="text-[10px] text-muted-foreground uppercase text-center py-4 italic">No pending invitations</p>
          ) : (
            invitations.map((inv: any) => (
              <div key={inv.id} className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs font-black text-foreground">{inv.sender_name}</p>
                  <Badge variant="outline" className="text-[8px] uppercase">{inv.collab_type}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-destructive text-destructive" onClick={() => onDecline(inv.id)} disabled={isLoading}>
                    <X className="h-3 w-3" />
                  </Button>
                  <Button size="sm" className="h-7 w-7 p-0 bg-chart-4" onClick={() => onAccept(inv.id)} disabled={isLoading}>
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Active Ministry Partnerships */}
      <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
        <CardHeader className="pb-3">
          <CardTitle className="text-worship text-base uppercase font-black flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Active Collabs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeCollabs.map((collab: any) => (
            <div key={collab.id} className="p-3 rounded-lg border border-border/40 bg-secondary/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest">{collab.project_name}</span>
                <span className="text-[9px] font-bold text-primary italic">Progress: {collab.progress}%</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>With {collab.partner_name}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full h-7 text-[9px] font-black uppercase">
                Work on Project (-20 EN)
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}