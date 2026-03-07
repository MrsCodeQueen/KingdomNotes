"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface RandomEventToastProps {
  event: {
    event_id: string
    text: string
    effects: Record<string, number>
  }
  onDismiss: () => void
}

export function RandomEventToast({ event, onDismiss }: RandomEventToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Card className="border-accent bg-card p-4 max-w-sm shadow-lg">
        <div className="flex items-start gap-2">
          <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">{event.text}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {Object.entries(event.effects).map(([stat, val]) => (
                <span
                  key={stat}
                  className={`text-xs font-mono ${(val as number) >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {(val as number) >= 0 ? "+" : ""}{val as number} {stat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
