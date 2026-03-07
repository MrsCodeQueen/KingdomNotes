"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Check if user dismissed the prompt recently
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      const dismissedAt = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) return // Don't show for 7 days after dismissal
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString())
  }

  if (isInstalled || !showPrompt || !deferredPrompt) return null

  return (
    <Card className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 p-4 border-primary/30 bg-card/95 backdrop-blur shadow-lg animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-start gap-3 pr-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Install Kingdom Notes</h4>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            Add to your home screen for the full mobile experience
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstall} className="btn-glow h-8 text-xs">
              Install App
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 text-xs">
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
