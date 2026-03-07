"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Mic2, Music, Flame, Sparkles } from "lucide-react"

export function StudioSession({ character, onComplete }: any) {
  const [prepLevel, setPrepLevel] = useState(0)
  const [spiritLevel, setSpiritLevel] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

  const handleRecord = () => {
    setIsRecording(true)
    // Quality is calculated based on prep + spirit + character stats
    const qualityScore = (prepLevel * 0.4) + (spiritLevel * 0.6) + (character.anointing / 10);
    setTimeout(() => {
      onComplete(qualityScore > 8 ? 'masterpiece' : qualityScore > 5 ? 'great' : 'good')
      setIsRecording(false)
    }, 3000)
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm card-glow">
      <CardHeader>
        <CardTitle className="text-worship text-base uppercase font-black flex items-center gap-2">
          <Mic2 className="h-4 w-4" /> Studio Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Vocal Warmup</label>
            <Button
              size="sm" variant="outline" className="h-6 text-[9px]"
              disabled={prepLevel >= 10 || character.energy < 10}
              onClick={() => setPrepLevel(prev => prev + 2)}
            >
              Practice (-10 EN)
            </Button>
          </div>
          <Progress value={prepLevel * 10} className="h-1.5" />

          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Spiritual Atmosphere</label>
            <Button
              size="sm" variant="outline" className="h-6 text-[9px]"
              disabled={spiritLevel >= 10 || character.anointing < 5}
              onClick={() => setSpiritLevel(prev => prev + 2)}
            >
              Pray (+Focus)
            </Button>
          </div>
          <Progress value={spiritLevel * 10} className="h-1.5 bg-primary/10" />
        </div>

        <Button
          className="w-full font-black uppercase tracking-widest py-6"
          disabled={isRecording || prepLevel < 2}
          onClick={handleRecord}
        >
          {isRecording ? <Sparkles className="animate-spin mr-2" /> : <Music className="mr-2" />}
          {isRecording ? "Capturing the Sound..." : "Start Recording"}
        </Button>
      </CardContent>
    </Card>
  )
}