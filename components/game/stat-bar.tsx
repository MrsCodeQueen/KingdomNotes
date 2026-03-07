"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface StatBarProps {
  label: string
  value: number
  max: number
  color?: string
  icon?: React.ReactNode
  suffix?: string
}

export function StatBar({ label, value, max, color = "bg-primary", icon, suffix }: StatBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const prevValue = useRef(value)
  const [flash, setFlash] = useState<"up" | "down" | null>(null)

  useEffect(() => {
    if (value !== prevValue.current) {
      setFlash(value > prevValue.current ? "up" : "down")
      prevValue.current = value
      const t = setTimeout(() => setFlash(null), 1200)
      return () => clearTimeout(t)
    }
  }, [value])

  // Danger states
  const isLow = percent < 20 && label !== "Funds"
  const isFull = percent >= 100

  return (
    <div className={cn(
      "flex flex-col gap-1.5 transition-all duration-300",
      flash === "up" && "scale-[1.02]",
      flash === "down" && "scale-[0.98]",
    )}>
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          "flex items-center gap-1.5 font-medium transition-colors duration-300",
          flash === "up" ? "text-primary" : flash === "down" ? "text-destructive" : "text-foreground",
          isLow && !flash && "text-destructive",
          isFull && !flash && "text-primary",
        )}>
          {icon}
          {label}
        </span>
        <span className={cn(
          "font-mono transition-all duration-300",
          flash === "up" ? "text-primary font-bold" : flash === "down" ? "text-destructive font-bold" : "text-muted-foreground",
        )}>
          {suffix !== undefined
            ? `${suffix}${typeof value === "number" ? value.toFixed(suffix === "$" ? 2 : 0) : value}`
            : `${Math.round(value)}/${max}`}
        </span>
      </div>
      <div className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-secondary relative",
        isLow && "animate-pulse",
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out relative",
            color,
            isFull && "shadow-[0_0_8px_currentColor]",
          )}
          style={{ width: `${percent}%` }}
        >
          {/* Shimmer effect on the bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] rounded-full" />
        </div>

        {/* Flash overlay */}
        {flash && (
          <div className={cn(
            "absolute inset-0 rounded-full animate-in fade-in duration-200",
            flash === "up" ? "bg-primary/20" : "bg-destructive/20",
          )} />
        )}
      </div>

      {/* Low warning */}
      {isLow && label === "Energy" && (
        <p className="text-[9px] font-bold text-destructive uppercase tracking-widest animate-pulse">Low Energy - Rest!</p>
      )}
    </div>
  )
}
