"use client"

import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { flame: "h-5 w-5", container: "w-8 h-10", noteSize: 8, text: "text-base", gap: "gap-1.5" },
  md: { flame: "h-7 w-7", container: "w-10 h-14", noteSize: 10, text: "text-xl", gap: "gap-2" },
  lg: { flame: "h-10 w-10", container: "w-14 h-18", noteSize: 12, text: "text-3xl", gap: "gap-2.5" },
  xl: { flame: "h-14 w-14", container: "w-20 h-24", noteSize: 16, text: "text-5xl", gap: "gap-3" },
}

// Musical symbols as tiny SVG paths
const NOTES = [
  { // Treble clef
    path: "M12 2C12 2 8 6 8 10C8 12 9.5 13.5 11 13.5C11 13.5 9 12 9 10C9 7 12 4 12 2ZM12 8V22M12 18C12 20 10 22 8 22C6 22 4 20 4 18C4 16 6 14 8 14C10 14 12 16 12 18Z",
    viewBox: "0 0 24 24",
    label: "treble-clef",
  },
  { // Bass clef
    path: "M4 6C4 6 6 4 8 4C12 4 14 8 14 11C14 15 10 18 6 18M16 8H17M16 12H17",
    viewBox: "0 0 24 24",
    label: "bass-clef",
  },
  { // Whole note
    path: "M12 8C15.3 8 18 9.8 18 12C18 14.2 15.3 16 12 16C8.7 16 6 14.2 6 12C6 9.8 8.7 8 12 8ZM12 10C10.3 10 9 10.9 9 12C9 13.1 10.3 14 12 14C13.7 14 15 13.1 15 12C15 10.9 13.7 10 12 10Z",
    viewBox: "0 0 24 24",
    label: "whole-note",
  },
  { // Thirty-second note (stem + triple flag)
    path: "M10 4V20M10 20C10 20 7 19 5 17C5 17 7 17.5 10 16M10 4C10 4 16 5 16 8C16 10 13 10 10 8M10 7C10 7 15 8 15 11C15 13 12 13 10 11M10 10C10 10 15 11 15 14C15 16 12 16 10 14",
    viewBox: "0 0 24 24",
    label: "thirty-second",
  },
  { // Music heart note
    path: "M12 21C12 21 4 15 4 9.5C4 7 6 5 8 5C9.5 5 11 6 12 7.5C13 6 14.5 5 16 5C18 5 20 7 20 9.5C20 15 12 21 12 21ZM9 9V15M9 12L13 12M13 9V15",
    viewBox: "0 0 24 24",
    label: "heart-note",
  },
]

// Deterministic positions so they spread nicely
const NOTE_POSITIONS = [
  { x: -40, delay: 0 },
  { x: -20, delay: 0.7 },
  { x: 0, delay: 1.4 },
  { x: 20, delay: 2.1 },
  { x: 40, delay: 2.8 },
]

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizeMap[size]

  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <span className={cn("relative inline-flex items-center justify-center shrink-0", s.container)}>
        {/* The flame */}
        <Flame className={cn(s.flame, "text-primary animate-pulse drop-shadow-[0_0_8px_rgba(217,170,60,0.5)] relative z-10")} />

        {/* Floating music notes */}
        {NOTES.map((note, i) => {
          const pos = NOTE_POSITIONS[i]
          return (
            <svg
              key={note.label}
              viewBox={note.viewBox}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="floating-note absolute text-primary/60"
              style={{
                width: s.noteSize,
                height: s.noteSize,
                left: `calc(50% + ${pos.x}%)`,
                bottom: "40%",
                animationDelay: `${pos.delay}s`,
              }}
              aria-hidden="true"
            >
              <path d={note.path} />
            </svg>
          )
        })}
      </span>
      {showText && (
        <span className={cn("font-bold font-serif text-worship tracking-tight", s.text)}>
          Kingdom Notes
        </span>
      )}
    </span>
  )
}
