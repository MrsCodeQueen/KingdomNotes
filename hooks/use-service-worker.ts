"use client"

import { useEffect } from "react"

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Every hour
        })
        .catch(() => {
          // Silent fail - SW not critical for app function
        })
    }
  }, [])
}
