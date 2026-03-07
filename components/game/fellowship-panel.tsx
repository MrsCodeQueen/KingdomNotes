"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, Heart, UserPlus, MessageCircle, Church, 
  Music, HandHeart, Megaphone, Guitar, Plus,
  Check, X, Crown, Clock
} from "lucide-react"

const GROUP_TYPES = [
  { id: "worship_team", label: "Worship Team", icon: Music },
  { id: "choir", label: "Choir", icon: Users },
  { id: "prayer_group", label: "Prayer Group", icon: HandHeart },
  { id: "outreach", label: "Outreach", icon: Megaphone },
  { id: "band", label: "Band", icon: Guitar },
]

interface FellowshipPanelProps {
  characterId?: string
  region?: string
}

export function FellowshipPanel({ characterId, region }: FellowshipPanelProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("groups")
  const [groups, setGroups] = useState<any[]>([])
  const [prayers, setPrayers] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Create group form
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDesc, setNewGroupDesc] = useState("")
  const [newGroupType, setNewGroupType] = useState("worship_team")
  
  // Create prayer form
  const [showCreatePrayer, setShowCreatePrayer] = useState(false)
  const [prayerTitle, setPrayerTitle] = useState("")
  const [prayerContent, setPrayerContent] = useState("")

  useEffect(() => {
    if (activeTab === "groups") fetchGroups()
    else if (activeTab === "prayers") fetchPrayers()
    else if (activeTab === "friends") fetchFriends()
  }, [activeTab])

  const fetchGroups = async () => {
    setLoading(true)
    const res = await fetch(`/api/game/fellowship?region=${region || ""}`)
    const data = await res.json()
    if (data.groups) setGroups(data.groups)
    setLoading(false)
  }

  const fetchPrayers = async () => {
    setLoading(true)
    const res = await fetch("/api/game/prayers")
    const data = await res.json()
    if (data.prayers) setPrayers(data.prayers)
    setLoading(false)
  }

  const fetchFriends = async () => {
    setLoading(true)
    const res = await fetch("/api/game/friends")
    const data = await res.json()
    if (data.friends) setFriends(data.friends)
    if (data.pendingReceived) setPendingRequests(data.pendingReceived)
    setLoading(false)
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    const res = await fetch("/api/game/fellowship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: newGroupName, 
        description: newGroupDesc,
        group_type: newGroupType 
      })
    })
    const data = await res.json()
    if (res.ok) {
      toast({ title: "Fellowship Created", description: data.message })
      setShowCreateGroup(false)
      setNewGroupName("")
      setNewGroupDesc("")
      fetchGroups()
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" })
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    const res = await fetch("/api/game/fellowship/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId })
    })
    const data = await res.json()
    toast({ 
      title: res.ok ? "Joined!" : "Error", 
      description: data.message || data.error,
      variant: res.ok ? "default" : "destructive"
    })
    if (res.ok) fetchGroups()
  }

  const handleLeaveGroup = async (groupId: string) => {
    const res = await fetch(`/api/game/fellowship/join?groupId=${groupId}`, {
      method: "DELETE"
    })
    const data = await res.json()
    toast({ 
      title: res.ok ? "Left" : "Error", 
      description: data.message || data.error,
      variant: res.ok ? "default" : "destructive"
    })
    if (res.ok) fetchGroups()
  }

  const handleCreatePrayer = async () => {
    if (!prayerTitle.trim() || !prayerContent.trim()) return
    const res = await fetch("/api/game/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: prayerTitle, content: prayerContent })
    })
    const data = await res.json()
    if (res.ok) {
      toast({ title: "Prayer Submitted", description: "Your request has been shared" })
      setShowCreatePrayer(false)
      setPrayerTitle("")
      setPrayerContent("")
      fetchPrayers()
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" })
    }
  }

  const handlePray = async (prayerId: string) => {
    const res = await fetch("/api/game/prayers/pray", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerId })
    })
    const data = await res.json()
    toast({ 
      title: res.ok ? "Prayer Lifted" : "Error", 
      description: data.message || data.error,
      variant: res.ok ? "default" : "destructive"
    })
    if (res.ok) fetchPrayers()
  }

  const handleFriendAction = async (requestId: string, action: "accept" | "decline") => {
    const res = await fetch("/api/game/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action })
    })
    const data = await res.json()
    toast({ 
      title: action === "accept" ? "Friend Added" : "Declined", 
      description: data.message,
      variant: res.ok ? "default" : "destructive"
    })
    if (res.ok) fetchFriends()
  }

  const GroupTypeIcon = ({ type }: { type: string }) => {
    const found = GROUP_TYPES.find(t => t.id === type)
    const Icon = found?.icon || Users
    return <Icon className="h-4 w-4" />
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-serif">
          <Church className="h-5 w-5 text-primary" />
          Fellowship
        </CardTitle>
        <CardDescription>Connect with other believers on this journey</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="groups" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="prayers" className="text-xs">
              <HandHeart className="h-3 w-3 mr-1" />
              Prayers
            </TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">
              <UserPlus className="h-3 w-3 mr-1" />
              Friends
            </TabsTrigger>
          </TabsList>

          {/* GROUPS TAB */}
          <TabsContent value="groups" className="space-y-3 mt-0">
            {!showCreateGroup ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-dashed"
                onClick={() => setShowCreateGroup(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start a Fellowship
              </Button>
            ) : (
              <Card className="p-3 bg-muted/30 space-y-2">
                <Input 
                  placeholder="Fellowship name..." 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Textarea 
                  placeholder="Description (optional)..." 
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-1 flex-wrap">
                  {GROUP_TYPES.map(t => (
                    <Button 
                      key={t.id}
                      variant={newGroupType === t.id ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setNewGroupType(t.id)}
                    >
                      <t.icon className="h-3 w-3 mr-1" />
                      {t.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateGroup}>Create</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCreateGroup(false)}>Cancel</Button>
                </div>
              </Card>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
            ) : groups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No fellowships yet. Be the first!</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {groups.map(group => (
                  <div 
                    key={group.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <GroupTypeIcon type={group.group_type} />
                        <span className="font-medium text-sm truncate">{group.name}</span>
                        {group.isLeader && (
                          <Crown className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {group.member_count}/{group.max_members} members
                        {group.leader?.artist_name && ` • Led by ${group.leader.artist_name}`}
                      </p>
                    </div>
                    {group.isMember ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleLeaveGroup(group.id)}
                        disabled={group.isLeader}
                      >
                        {group.isLeader ? "Leader" : "Leave"}
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={group.member_count >= group.max_members}
                      >
                        Join
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PRAYERS TAB */}
          <TabsContent value="prayers" className="space-y-3 mt-0">
            {!showCreatePrayer ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-dashed"
                onClick={() => setShowCreatePrayer(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Prayer Request
              </Button>
            ) : (
              <Card className="p-3 bg-muted/30 space-y-2">
                <Input 
                  placeholder="Prayer title..." 
                  value={prayerTitle}
                  onChange={(e) => setPrayerTitle(e.target.value)}
                />
                <Textarea 
                  placeholder="Share your prayer request..." 
                  value={prayerContent}
                  onChange={(e) => setPrayerContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreatePrayer}>Submit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCreatePrayer(false)}>Cancel</Button>
                </div>
              </Card>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
            ) : prayers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No prayer requests yet</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {prayers.map(prayer => (
                  <div 
                    key={prayer.id} 
                    className="p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{prayer.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prayer.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{prayer.character?.artist_name || "Anonymous"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {prayer.prayer_count} prayers
                          </span>
                        </div>
                      </div>
                      {!prayer.isOwn && (
                        <Button 
                          size="sm" 
                          variant={prayer.hasPrayed ? "outline" : "default"}
                          onClick={() => handlePray(prayer.id)}
                          disabled={prayer.hasPrayed}
                          className="shrink-0"
                        >
                          <HandHeart className="h-4 w-4 mr-1" />
                          {prayer.hasPrayed ? "Prayed" : "Pray"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* FRIENDS TAB */}
          <TabsContent value="friends" className="space-y-3 mt-0">
            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pending Requests ({pendingRequests.length})
                </p>
                {pendingRequests.map(req => (
                  <div 
                    key={req.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <div>
                      <p className="font-medium text-sm">{req.sender?.artist_name}</p>
                      <p className="text-xs text-muted-foreground">Level {req.sender?.level}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        onClick={() => handleFriendAction(req.id, "accept")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleFriendAction(req.id, "decline")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
            ) : friends.length === 0 ? (
              <div className="text-center py-6">
                <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No friends yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Visit the leaderboard to add friends!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {friends.map(friend => (
                  <div 
                    key={friend.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{friend.artist_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Level {friend.level} • {friend.region}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
