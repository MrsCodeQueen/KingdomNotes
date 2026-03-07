"use client"

import { useEffect, useState } from "react"
import { GOSPEL_NEWS, SCRIPTURE_BANNERS } from "@/lib/game/constants"
import { Newspaper, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export function NewsTicker() {
  const [index, setIndex] = useState(0)
  const [isScripture, setIsScripture] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        // 30% chance of showing a scripture banner instead of news
        if (Math.random() < 0.3) {
          setIsScripture(true)
          setIndex(Math.floor(Math.random() * SCRIPTURE_BANNERS.length))
        } else {
          setIsScripture(false)
          setIndex(Math.floor(Math.random() * GOSPEL_NEWS.length))
        }
        setVisible(true)
      }, 500)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const content = isScripture ? SCRIPTURE_BANNERS[index] : null
  const newsText = !isScripture ? GOSPEL_NEWS[index] : null

  return (
    <div className={cn(
      "relative overflow-hidden border-b border-border/50 bg-card/80 backdrop-blur-sm px-4 py-1.5",
      "transition-opacity duration-500",
      visible ? "opacity-100" : "opacity-0"
    )}>
      <div className="mx-auto max-w-7xl flex items-center gap-3">
        {isScripture ? (
          <>
            <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs truncate">
              <span className="font-black text-primary mr-1.5">{content?.verse}</span>
              <span className="text-muted-foreground italic">{content?.text}</span>
            </p>
          </>
        ) : (
          <>
            <Newspaper className="h-3.5 w-3.5 text-accent shrink-0" />
            <p className="text-xs font-medium text-muted-foreground truncate">{newsText}</p>
          </>
        )}
      </div>
    </div>
  )
}
