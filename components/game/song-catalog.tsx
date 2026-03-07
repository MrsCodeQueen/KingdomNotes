"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Music, Disc, Star, PenLine, TrendingUp,
  Sparkles, Check, Mic2, Headphones, Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Song, Character } from "@/lib/game/types"
import { ACTIVITIES, SONG_TAGS, getCurrentTrend } from "@/lib/game/constants"
import { useState } from "react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const QUALITY_COLORS: Record<string, string> = {
  masterpiece: "border-primary text-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]",
  great: "border-chart-3 text-chart-3",
  good: "border-muted-foreground text-muted-foreground",
  mediocre: "border-border text-muted-foreground",
}

const QUALITY_LABELS: Record<string, string> = {
  masterpiece: "Masterpiece",
  great: "Great",
  good: "Good",
  mediocre: "Mediocre",
}

interface SongCatalogProps {
  character: Character
  inventory: any[] // Added inventory to check for gear
  onWriteSong: (gearIds?: string[], songTags?: string[]) => void
  onUpdate: () => void
  isLoading: boolean
}

export function SongCatalog({ character, inventory = [], onWriteSong, onUpdate, isLoading }: SongCatalogProps) {
  const { toast } = useToast()
  const { data, mutate } = useSWR("/api/game/songs", fetcher)
  const [isPromoting, setIsPromoting] = useState<string | null>(null)

  // New States for Gear Prompt and Album Recording
  const [showGearPrompt, setShowGearPrompt] = useState(false)
  const [selectedGear, setSelectedGear] = useState<string[]>([])
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState<string[]>([])

  const songs: Song[] = data?.songs ?? []
  const masterpieces = songs.filter((s) => s.quality === "masterpiece").length
  const recorded = songs.filter((s) => s.recorded).length

  // Gear Logic
  const songwritingGear = inventory.filter((item: any) => item.item_type === 'instrument' || item.item_type === 'studio' || item.item_type === 'equipment')

  const toggleGear = (id: string) => {
    setSelectedGear(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const trend = getCurrentTrend()

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev)
  }

  const handleStartWriting = () => {
    onWriteSong(selectedGear, selectedTags)
    setShowGearPrompt(false)
    setSelectedGear([])
    setSelectedTags([])
  }

  async function handlePromote(songId: string, songTitle: string) {
    setIsPromoting(songId)
    try {
      const res = await fetch("/api/game/songs/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({
          title: "Song Promoted!",
          description: `"${songTitle}" gained ${data.influenceGain} Influence and ${data.charismaGain} Charisma. (-15 Energy)`,
        })
        onUpdate()
        mutate()
      } else {
        toast({
          title: "Promotion Failed",
          description: data.error || "Could not promote song.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error while promoting.",
        variant: "destructive",
      })
    } finally {
      setIsPromoting(null)
    }
  }

  const [isRecording, setIsRecording] = useState(false)
  const [albumResult, setAlbumResult] = useState<string | null>(null)

  async function handleRecordAlbum() {
    setIsRecording(true)
    try {
      const res = await fetch("/api/game/albums/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songIds: selectedAlbumSongs }),
      })
      const data = await res.json()
      if (res.ok) {
        setAlbumResult(data.resultText)
        setSelectedAlbumSongs([])
        mutate()
        onUpdate()
        setTimeout(() => {
          setShowAlbumModal(false)
          setAlbumResult(null)
        }, 3000)
      } else {
        setAlbumResult(data.error || "Failed to record album.")
      }
    } finally {
      setIsRecording(false)
    }
  }

  if (songs.length === 0) {
    return (
      <Card className="border-border bg-card card-glow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-worship uppercase font-black">
            <Music className="h-5 w-5 text-primary" /> Song Catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <PenLine className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground text-center italic">Your catalog is empty. Let the Spirit move and write your first song.</p>
          <Button
            onClick={() => setShowGearPrompt(true)}
            disabled={isLoading || character.energy < ACTIVITIES.songwriting.energyCost}
            className="gap-2 font-bold uppercase"
          >
            <PenLine className="h-4 w-4" /> Write a Song
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-worship uppercase font-black">
              <Music className="h-5 w-5 text-primary" /> Song Catalog
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAlbumModal(true)}
                disabled={isLoading || songs.length < 3}
                className="gap-1.5 text-xs h-8 border-primary text-primary font-bold uppercase"
              >
                <Disc className="h-3.5 w-3.5" /> Record Album
              </Button>
              <Button
                size="sm"
                onClick={() => setShowGearPrompt(true)}
                disabled={isLoading || character.energy < ACTIVITIES.songwriting.energyCost}
                className="gap-1.5 text-xs h-8 font-bold uppercase"
              >
                <PenLine className="h-3.5 w-3.5" /> Write Song
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary" /> {masterpieces} Masterpieces</span>
            <span className="flex items-center gap-1"><Disc className="h-3 w-3" /> {recorded} Recorded</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {songs.map((song) => (
            <div key={song.id} className="flex flex-col gap-2 rounded-lg border border-border/50 p-3 bg-muted/30 transition-all hover:border-primary/30">
              <div className="flex items-center gap-3">
                {song.recorded ? <Disc className="h-5 w-5 text-primary animate-spin-slow" /> : <Music className="h-5 w-5 text-muted-foreground" />}
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-bold text-foreground truncate">{song.title}</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <Badge variant="outline" className={cn("text-[9px] h-4 uppercase", QUALITY_COLORS[song.quality])}>
                      {QUALITY_LABELS[song.quality]}
                    </Badge>
                    {(song.tags ?? []).map((tag: string) => (
                      <Badge key={tag} variant="outline" className={cn("text-[8px] h-3.5 uppercase", trend.tags.includes(tag) ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground/60 border-border/40")}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                {song.recorded && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary font-bold uppercase"
                    onClick={() => handlePromote(song.id, song.title)}
                    disabled={isLoading || isPromoting === song.id || character.energy < 15}
                  >
                    {isPromoting === song.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />} Promote
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* --- GEAR PREPARATION MODAL --- */}
      <Dialog open={showGearPrompt} onOpenChange={setShowGearPrompt}>
        <DialogContent className="border-border bg-card card-glow sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-worship flex items-center gap-2 uppercase font-black">
              <Mic2 className="h-5 w-5 text-primary" /> Prepare Session
            </DialogTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Select gear to enhance your song quality.</p>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {songwritingGear.length === 0 ? (
              <p className="text-[10px] text-center italic opacity-60">No gear in inventory.</p>
            ) : (
              songwritingGear.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => toggleGear(item.id)}
                  className={cn("flex items-center justify-between p-3 rounded-lg border transition-all",
                    selectedGear.includes(item.id) ? "border-primary bg-primary/10" : "border-border/40 bg-secondary/5")}
                >
                  <div className="text-left"><p className="text-xs font-bold">{item.item_name || item.name}</p></div>
                  {selectedGear.includes(item.id) && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))
            )}
          </div>
          {/* Tag Selection */}
          <div className="space-y-2 border-t border-border/50 pt-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Song Style (pick up to 3 tags):</p>
            <div className="flex flex-wrap gap-1.5">
              {SONG_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase transition-all",
                    selectedTags.includes(tag) ? "border-primary bg-primary/15 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/30",
                    trend.tags.includes(tag) && !selectedTags.includes(tag) && "border-chart-2/30 text-chart-2/70"
                  )}
                >
                  {trend.tags.includes(tag) && <TrendingUp className="inline h-2 w-2 mr-0.5" />}
                  {tag}
                </button>
              ))}
            </div>
            {trend && <p className="text-[9px] text-muted-foreground">Trending: <span className="text-chart-2 font-bold">{trend.tags.join(", ")}</span></p>}
          </div>
          <DialogFooter>
            <Button className="w-full font-black uppercase tracking-widest" onClick={handleStartWriting}>
              Start Writing <Sparkles className="ml-2 h-3 w-3" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- ALBUM RECORDING MODAL --- */}
      <Dialog open={showAlbumModal} onOpenChange={setShowAlbumModal}>
        <DialogContent className="border-border bg-card card-glow sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-worship flex items-center gap-2 uppercase font-black tracking-widest">
              <Disc className="h-5 w-5 text-primary" /> Record Album
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Select tracks from your catalog (Min. 3):</p>
            <div className="max-h-[200px] overflow-y-auto border border-border/40 rounded-lg p-2 space-y-2">
              {songs.map((song) => (
                <div key={song.id} className="flex items-center space-x-3 p-2 rounded hover:bg-primary/5">
                  <Checkbox
                    checked={selectedAlbumSongs.includes(song.id)}
                    onCheckedChange={() => setSelectedAlbumSongs(prev => prev.includes(song.id) ? prev.filter(id => id !== song.id) : [...prev, song.id])}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{song.title}</span>
                    <span className="text-[9px] text-primary font-black uppercase">{song.quality}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {albumResult && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs font-bold text-foreground">
              {albumResult}
            </div>
          )}
          <DialogFooter>
            <div className="w-full space-y-2">
              <p className="text-[10px] text-muted-foreground text-center">
                Studio cost: ${50 + selectedAlbumSongs.length * 10} ({selectedAlbumSongs.length} tracks)
              </p>
              <Button className="w-full font-black uppercase" disabled={selectedAlbumSongs.length < 3 || isRecording} onClick={handleRecordAlbum}>
                {isRecording ? "Recording..." : `Record Album (${selectedAlbumSongs.length} tracks)`}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
