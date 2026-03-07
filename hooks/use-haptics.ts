"use client"

import { useCallback } from "react"

// Capacitor Haptics types
type ImpactStyle = "light" | "medium" | "heavy"
type NotificationType = "success" | "warning" | "error"

interface HapticsPlugin {
  impact: (options: { style: ImpactStyle }) => Promise<void>
  notification: (options: { type: NotificationType }) => Promise<void>
  vibrate: (options: { duration: number }) => Promise<void>
  selectionStart: () => Promise<void>
  selectionChanged: () => Promise<void>
  selectionEnd: () => Promise<void>
}

// Get Capacitor Haptics if available
async function getHaptics(): Promise<HapticsPlugin | null> {
  if (typeof window === "undefined") return null
  
  try {
    const { Haptics } = await import("@capacitor/haptics")
    return Haptics as unknown as HapticsPlugin
  } catch {
    return null
  }
}

// Fallback to vibration API for web
function vibrateWeb(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export function useHaptics() {
  // Light tap feedback (button presses, selections)
  const lightTap = useCallback(async () => {
    const haptics = await getHaptics()
    if (haptics) {
      await haptics.impact({ style: "light" })
    } else {
      vibrateWeb(10)
    }
  }, [])

  // Medium tap feedback (confirmations, toggles)
  const mediumTap = useCallback(async () => {
    const haptics = await getHaptics()
    if (haptics) {
      await haptics.impact({ style: "medium" })
    } else {
      vibrateWeb(20)
    }
  }, [])

  // Heavy tap feedback (important actions, errors)
  const heavyTap = useCallback(async () => {
    const haptics = await getHaptics()
    if (haptics) {
      await haptics.impact({ style: "heavy" })
    } else {
      vibrateWeb(30)
    }
  }, [])

  // Success notification (achievements, level ups)
  const success = useCallback(async () => {
    const haptics = await getHaptics()
    if (haptics) {
      await haptics.notification({ type: "success" })
    } else {
      vibrateWeb([50, 50, 50])
    }
  }, [])

  // Warning notification
  const warning = useCallback(async () => {
    const haptics = await getHaptics()
    if (haptics) {
      await haptics.notification({ type: "warning" })
    } else {
      vibrateWeb([100, 50, 100])
    }
  }, [])

  // Error notification
  const error = useCallback(async () => {
    const haptics = await getHaptics()
    if (haptics) {
      await haptics.notification({ type: "error" })
    } else {
      vibrateWeb([150, 50, 150, 50, 150])
    }
  }, [])

  // Selection feedback
  const selection = useCallback(async () => {
    const haptics = await getHaptics()
    if (haptics) {
      await haptics.selectionChanged()
    } else {
      vibrateWeb(5)
    }
  }, [])

  return {
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
    selection,
  }
}
