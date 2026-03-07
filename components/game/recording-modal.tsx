"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Disc, Music, Sparkles } from "lucide-react"

export function AlbumRecordingModal({ isOpen, onClose, writtenSongs, onRecord }: any) {
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([])
  const [albumName, setAlbumName] = useState("")

  const toggleSong = (id: string) => {
    setSelectedSongIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card/95 backdrop-blur-md card-glow sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-worship flex items-center gap-2 uppercase font-black tracking-widest">
            <Disc className="h-5 w-5 text-primary animate-spin-slow" /> Record New Album
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Album Title</label>
            <input
              className="w-full bg-background/50 border border-border rounded-md p-2 text-sm focus:outline-primary"
              placeholder="e.g., 'Seasons of Faith'"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Select Tracklist ({selectedSongIds.length} songs)</label>
            <div className="max-h-[200px] overflow-y-auto border border-border/40 rounded-lg p-2 space-y-2 bg-background/20">
              {writtenSongs.map((song: any) => (
                <div key={song.id} className="flex items-center space-x-3 p-2 rounded hover:bg-primary/5 transition-colors">
                  <Checkbox
                    id={song.id}
                    checked={selectedSongIds.includes(song.id)}
                    onCheckedChange={() => toggleSong(song.id)}
                  />
                  <label htmlFor={song.id} className="flex flex-col cursor-pointer">
                    <span className="text-xs font-bold">{song.title}</span>
                    <span className="text-[9px] text-primary uppercase font-black">Quality: {song.quality}%</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full h-10 text-[10px] font-black uppercase tracking-widest bg-primary"
            disabled={selectedSongIds.length < 3 || !albumName}
            onClick={() => onRecord(albumName, selectedSongIds)}
          >
            Enter the Studio <Sparkles className="ml-2 h-3 w-3" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}