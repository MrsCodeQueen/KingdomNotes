"use client"

import { useEffect, useRef } from "react"

/**
 * Hook to track player online presence.
 * Updates last_seen every 2 minutes while the player is active.
 * Marks player offline when they leave/close the page.
 */
export function useOnlinePresence(characterId: string | null) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!characterId) return

    // Mark player online via API
    const markOnline = async () => {
      try {
        await fetch("/api/game/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "online" })
        })
      } catch (e) {
        console.log("[v0] Failed to mark online:", e)
      }
    }

    // Mark player offline via API
    const markOffline = async () => {
      try {
        await fetch("/api/game/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "offline" })
        })
      } catch (e) {
        console.log("[v0] Failed to mark offline:", e)
      }
    }

    // Initial mark online
    markOnline()

    // Heartbeat every 2 minutes
    intervalRef.current = setInterval(markOnline, 2 * 60 * 1000)

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markOnline()
      }
    }

    // Handle before unload (closing tab/window)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline marking on page close
      const url = `/api/game/presence?action=offline&characterId=${characterId}`
      navigator.sendBeacon(url)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      // Mark offline on unmount
      markOffline()
    }
  }, [characterId, supabase])
}
