import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type ActivityLogEntry } from "@/lib/game/types"
import { Clock } from "lucide-react"

interface ActivityLogProps {
  entries: ActivityLogEntry[]
}

export function ActivityLog({ entries }: ActivityLogProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activities yet. Start your journey!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="flex flex-col gap-3">
            {entries.map((entry) => {
              const time = new Date(entry.created_at)
              const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              return (
                <div key={entry.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="shrink-0 text-xs font-mono text-muted-foreground pt-0.5">{timeStr}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-foreground">{entry.result_text}</span>
                    {entry.stat_changes && Object.keys(entry.stat_changes).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(entry.stat_changes).map(([stat, change]) => (
                          <span
                            key={stat}
                            className={`text-xs font-mono ${Number(change) >= 0 ? "text-chart-3" : "text-destructive"}`}
                          >
                            {Number(change) >= 0 ? "+" : ""}{change} {stat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
