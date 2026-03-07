"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Trophy, TrendingUp, Star, Crown, User, Users, Heart, UserPlus, Wifi } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface LeaderboardEntry {
  id: string
  name: string
  region: string
  influence: number
  anointing: number
  charisma: number
  funds: number
  followers: number
  favor: number
  level: number
  isPlayer: boolean
  isCurrentUser: boolean
  isOnline?: boolean
  lastSeen?: string
  rank: number
}

interface RivalLeaderboardProps {
  regionId: string
  playerInfluence: number
  playerName: string
  playerLevel: number
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

type SortOption = "influence" | "anointing" | "favor" | "followers" | "level"

export function RivalLeaderboard({ regionId, playerInfluence, playerName, playerLevel }: RivalLeaderboardProps) {
  const { toast } = useToast()
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("influence")
  const [sendingFriendRequest, setSendingFriendRequest] = useState<string | null>(null)

  const handleAddFriend = async (entry: LeaderboardEntry) => {
    if (!entry.isPlayer || entry.isCurrentUser) return
    setSendingFriendRequest(entry.id)
    try {
      const res = await fetch("/api/game/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: entry.id })
      })
      const data = await res.json()
      toast({
        title: res.ok ? "Request Sent" : "Error",
        description: data.message || data.error,
        variant: res.ok ? "default" : "destructive"
      })
    } catch {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" })
    }
    setSendingFriendRequest(null)
  }

  const { data, isLoading } = useSWR<{ 
    leaderboard: LeaderboardEntry[]
    onlinePlayers: LeaderboardEntry[]
    totalPlayers: number
    onlineCount: number 
  }>(
    `/api/game/leaderboard?region=${regionId}&sortBy=${sortBy}`,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30s to show online status
  )

  const entries = data?.leaderboard || []
  const onlinePlayers = data?.onlinePlayers || []
  const playerRank = entries.find(e => e.isCurrentUser)?.rank || entries.findIndex(e => e.name === playerName) + 1 || "?"

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "influence", label: "Influence" },
    { value: "anointing", label: "Anointing" },
    { value: "favor", label: "Favor" },
    { value: "followers", label: "Followers" },
    { value: "level", label: "Level" },
  ]

  return (
    <>
      <Card className="card-glow border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <Trophy className="h-5 w-5 text-primary" />
              Leaderboard
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-mono">
              Your Rank: #{playerRank}
            </Badge>
          </div>
          {/* Sort options */}
          <div className="flex flex-wrap gap-1 mt-2">
            {sortOptions.map(opt => (
              <Button
                key={opt.value}
                variant={sortBy === opt.value ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-6 px-2 text-[10px]",
                  sortBy === opt.value && "btn-glow"
                )}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          {data?.totalPlayers !== undefined && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {data.totalPlayers} real players + NPCs
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-secondary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Online Players Section */}
              {onlinePlayers.length > 0 && (
                <div className="mb-3 pb-3 border-b border-accent/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">
                      {onlinePlayers.length} Player{onlinePlayers.length !== 1 ? 's' : ''} Online Now
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {onlinePlayers.map((entry) => (
                      <div
                        key={`online-${entry.id}`}
                        className="flex items-center gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 transition-all cursor-pointer hover:border-emerald-500/60"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        {/* Online indicator */}
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold truncate text-emerald-300">
                              {entry.name}
                            </span>
                            <Badge variant="secondary" className="text-[7px] h-3.5 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-black uppercase shrink-0">
                              Online
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-emerald-400/70 font-mono">
                            <span className="flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5" /> LVL {entry.level}
                            </span>
                            <span>INF: {entry.influence}</span>
                            <span>Rank #{entry.rank}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddFriend(entry)
                          }}
                          disabled={sendingFriendRequest === entry.id}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Leaderboard */}
              {entries.slice(0, 15).map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-2.5 transition-all cursor-pointer",
                  entry.isCurrentUser
                    ? "border-primary/40 bg-primary/10"
                    : entry.isPlayer
                    ? "border-accent/30 bg-accent/5 hover:border-accent/50"
                    : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/40",
                )}
                onClick={() => setSelectedEntry(entry)}
              >
                {/* Rank */}
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black",
                  entry.rank === 1 ? "bg-primary/20 text-primary" : 
                  entry.rank <= 3 ? "bg-accent/15 text-accent" : 
                  "bg-muted text-muted-foreground"
                )}>
                  {entry.rank === 1 ? <Crown className="h-3.5 w-3.5" /> : entry.rank}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold truncate",
                      entry.isCurrentUser && "text-primary",
                      entry.isPlayer && !entry.isCurrentUser && "text-accent"
                    )}>
                      {entry.isCurrentUser ? `${entry.name} (You)` : entry.name}
                    </span>
                    {entry.isPlayer && !entry.isCurrentUser && (
                      <Badge variant="secondary" className="text-[7px] h-3.5 bg-accent/10 text-accent border-accent/20 font-black uppercase shrink-0">
                        Player
                      </Badge>
                    )}
                    {entry.isOnline && !entry.isCurrentUser && (
                      <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5" /> LVL {entry.level}
                    </span>
                    <span>INF: {entry.influence}</span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-2.5 w-2.5" /> {entry.favor}
                    </span>
                  </div>
                </div>

                {entry.isPlayer && !entry.isCurrentUser && (
                  <Users className="h-4 w-4 text-accent/60 shrink-0" />
                )}
              </div>
            ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Entry Detail Panel */}
      {selectedEntry && (
        <Card className="border-primary/30 bg-card mt-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-serif">
                <User className="h-4 w-4 text-primary" />
                {selectedEntry.name}
                {selectedEntry.isPlayer && (
                  <Badge variant="outline" className="text-[8px] ml-1">
                    {selectedEntry.isCurrentUser ? "You" : "Real Player"}
                  </Badge>
                )}
              </CardTitle>
              <button onClick={() => setSelectedEntry(null)} className="text-xs text-muted-foreground hover:text-foreground">
                Close
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Influence", val: selectedEntry.influence },
                { label: "Anointing", val: selectedEntry.anointing },
                { label: "Charisma", val: selectedEntry.charisma },
                { label: "Followers", val: formatNumber(selectedEntry.followers) },
                { label: "Favor", val: selectedEntry.favor },
                { label: "Level", val: selectedEntry.level },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col items-center rounded-md border border-border/50 bg-muted/20 p-2">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">{stat.label}</span>
                  <span className="text-sm font-black text-foreground">{stat.val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Rank #{selectedEntry.rank}</span>
              <span className="flex items-center gap-1 font-mono font-bold text-primary">
                <TrendingUp className="h-3 w-3" /> ${formatNumber(selectedEntry.funds)}
              </span>
            </div>
            
            {/* Add Friend Button for real players */}
            {selectedEntry.isPlayer && !selectedEntry.isCurrentUser && (
              <Button 
                className="w-full mt-2 btn-glow"
                onClick={() => handleAddFriend(selectedEntry)}
                disabled={sendingFriendRequest === selectedEntry.id}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {sendingFriendRequest === selectedEntry.id ? "Sending..." : "Add Friend"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
