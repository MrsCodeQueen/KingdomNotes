"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { type Character, type Buff, type ActivityLogEntry, type Royalty, type RandomEventResult, type TemptationEvent, type CharacterSkill } from "@/lib/game/types"
import { type ActivityKey } from "@/lib/game/constants"
import { CharacterHeader } from "@/components/game/character-header"
import { StatBar } from "@/components/game/stat-bar"
import { ActivityPanel } from "@/components/game/activity-panel"
import { BuffsDisplay } from "@/components/game/buffs-display"
import { ActivityLog } from "@/components/game/activity-log"
import { FastingPanel } from "@/components/game/fasting-panel"
import { ShopPanel } from "@/components/game/shop-panel"
import { InventoryPanel } from "@/components/game/inventory-panel"
import { SongCatalog } from "@/components/game/song-catalog"
import { AchievementsPanel } from "@/components/game/achievements-panel"
import { RegionPanel } from "@/components/game/region-panel"
import { DailyDevotional } from "@/components/game/daily-devotional"
import { TemptationModal } from "@/components/game/temptation-modal"
import { RandomEventToast } from "@/components/game/random-event-toast"
import { JobPanel } from "@/components/game/job-panel"
import { WorkPanel } from "@/components/game/work-panel"
import { UniversityPanel } from "@/components/game/university-panel"
import { StreamingPanel } from "@/components/game/streaming-panel"
import { LodgingPanel } from "@/components/game/lodging-panel"
import { HousingPanel } from "@/components/game/housing-panel"
// NEW COMPONENTS
import { CharacterPanel } from "@/components/game/character-panel"
import { SocialPanel } from "@/components/game/social-panel"
import { CollabPanel } from "@/components/game/collab-panel"
import { SkillsPanel } from "@/components/game/skills-panel"
import { ActionResultOverlay } from "@/components/game/action-result-overlay"
import { NewsTicker } from "@/components/game/news-ticker"
import { RegionalEventsBanner } from "@/components/game/regional-events-banner"
import { RivalLeaderboard } from "@/components/game/rival-leaderboard"
import { TrendEnginePanel } from "@/components/game/trend-engine-panel"
import { StoryPanel } from "@/components/game/story-panel"
import { PerformancePanel } from "@/components/game/performance-panel"
import { OpportunitiesPanel } from "@/components/game/opportunities-panel"
import { EarningsClaimPanel } from "@/components/game/earnings-claim-panel"
import { BusinessPanel } from "@/components/game/business-panel"
import { DailyChallenges } from "@/components/game/daily-challenges"
import { MobileNav } from "@/components/game/mobile-nav"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { TutorialModal } from "@/components/game/tutorial-modal"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useServiceWorker } from "@/hooks/use-service-worker"
import { useOnlinePresence } from "@/hooks/use-online-presence"
import {
  Zap, Flame, DollarSign, Star, Shield,
  Crown, Music, Swords, ShoppingBag,
  Trophy, Globe, BookOpen, Coins, Heart,
  Briefcase, GraduationCap, Radio, User, Users, Share2, Home, HelpCircle, Building2
} from "lucide-react"

export default function GamePage() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [buffs, setBuffs] = useState<Buff[]>([])
  const [log, setLog] = useState<ActivityLogEntry[]>([])
  const [royalties, setRoyalties] = useState<Royalty[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [lodgings, setLodgings] = useState<any[]>([])
  const [skills, setSkills] = useState<CharacterSkill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [randomEvent, setRandomEvent] = useState<RandomEventResult | null>(null)
  const [temptation, setTemptation] = useState<TemptationEvent | null>(null)
  const [actionResult, setActionResult] = useState<{
    resultText: string
    statChanges: Record<string, number>
    trainedSkills?: { skill: string; xpGained: number; newLevel: number }[]
    leveledUp?: boolean
    newLevel?: number
    newAchievements?: { title: string }[]
  } | null>(null)
  const [activeTab, setActiveTab] = useState("actions")
  const [showTutorial, setShowTutorial] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  
  // Register service worker for PWA
  useServiceWorker()
  
  // Track online presence for multiplayer features
  useOnlinePresence(character?.id ?? null)

  const fetchGameData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const [charRes, buffsRes, logRes, royaltiesRes, invRes, skillsRes] = await Promise.all([
      supabase.from("characters").select("*").eq("user_id", user.id).single(),
      supabase.from("buffs").select("*").eq("user_id", user.id).gte("expires_at", new Date().toISOString()),
      supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("royalties").select("*").eq("user_id", user.id),
      supabase.from("inventory").select("*").eq("user_id", user.id),
      supabase.from("character_skills").select("*").eq("user_id", user.id),
    ])

    if (charRes.error || !charRes.data) {
      router.push("/game/onboarding")
      return
    }

    setCharacter(charRes.data as Character)
    setBuffs((buffsRes.data ?? []) as Buff[])
    setLog((logRes.data ?? []) as ActivityLogEntry[])
    setRoyalties((royaltiesRes.data ?? []) as Royalty[])
    setInventory(invRes.data ?? [])
    setSkills((skillsRes.data ?? []) as CharacterSkill[])

    // Fetch lodgings for current region
    if (charRes.data) {
      const lodgingsRes = await fetch(`/api/game/lodgings?region=${charRes.data.region}`)
      if (lodgingsRes.ok) {
        const lodgingsData = await lodgingsRes.json()
        setLodgings(lodgingsData.lodgings ?? [])
      }
    }

    setInitialLoading(false)
  }, [supabase, router])

  useEffect(() => {
    fetchGameData()
    // Show tutorial for first-time players
    const tutorialComplete = localStorage.getItem("kingdom-notes-tutorial-complete")
    if (!tutorialComplete) {
      setShowTutorial(true)
    }
  }, [fetchGameData])

  const handleWriteSong = async (gearIds?: string[], songTags?: string[]) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/game/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "songwriting",
          equipment_used: gearIds,
          song_tags: songTags,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        // Show the action result overlay with the songwriting result
        setActionResult({
          text: data.resultText || "Song written!",
          statChanges: data.statChanges || {},
          skillGains: data.skillGains || [],
        })
        await fetchGameData()
      } else {
        toast({
          title: "Failed to Write Song",
          description: data.error || "Could not write song.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error while writing song.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: ActivityKey) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/game/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (res.ok) {
        // Show the action result overlay with stat changes and skill gains
        setActionResult({
          resultText: data.resultText,
          statChanges: data.statChanges || {},
          trainedSkills: data.trainedSkills,
          leveledUp: data.leveledUp,
          newLevel: data.newLevel,
          newAchievements: data.newAchievements,
        })
        if (data.randomEvent) {
          setTimeout(() => setRandomEvent(data.randomEvent), 2500)
        }
        if (data.temptation) {
          setTimeout(() => setTemptation(data.temptation), 3000)
        }
      } else {
        toast({ title: "Failed", description: data.error || "Action could not be completed." })
      }
      await fetchGameData()
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartFast = async (minutes: number) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/game/fasting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", minutes }),
      })
      if (res.ok) {
        await fetchGameData()
        toast({ title: "Fast Begun", description: `You have begun a ${minutes}-minute fast.` })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndFast = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/game/fasting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      })
      const data = await res.json()
      if (res.ok) {
        await fetchGameData()
        toast({ title: "Fast Complete", description: data.resultText || "Your spirit is renewed." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePourOut = async () => {
    if (!character || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/game/action/pour-out", { method: "POST" });
      if (response.ok) {
        await fetchGameData();
        toast({ title: "Vessel Poured Out", description: "Your influence has grown." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (lodgingId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/game/lodgings/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lodgingId }),
      })
      if (res.ok) {
        await fetchGameData()
        toast({ title: "Checked In", description: "Your lodging has been updated." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async (classId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/game/university/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      })
      const data = await res.json()
      if (res.ok) {
        await fetchGameData()
        toast({ title: "Enrolled!", description: `Class completed! Your stats have increased.` })
      } else {
        toast({ title: "Failed", description: data.error || "Could not enroll." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleWork = async (jobId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/game/jobs/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json()
      if (res.ok) {
        await fetchGameData()
        toast({ title: "Shift Complete", description: data.resultText || `You earned money from your job.` })
      } else {
        // Refresh character data to sync with server state
        await fetchGameData()
        toast({ title: "Failed", description: data.error || "Could not work shift.", variant: "destructive" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgradeSkill = async (skillId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/game/character/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId }),
      });
      const data = await res.json()
      if (res.ok) {
        await fetchGameData()
        toast({ title: "Stat Upgraded!", description: `${skillId.replace("_stat", "")} increased to ${data.newValue}. ${data.pointsRemaining} point(s) remaining.` })
      } else {
        toast({ title: "Cannot Upgrade", description: data.error || "Something went wrong." })
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (initialLoading || !character) return null

  const unclaimedRoyalties = royalties.reduce((sum, r) => sum + Number(r.income_per_tick), 0)

  return (
    <div className="relative z-10 flex min-h-svh flex-col bg-background/95 safe-top safe-x no-select">
<CharacterHeader character={character} />
  
  {/* Help Button - Fixed position */}
  <Button
    variant="outline"
    size="sm"
    className="fixed bottom-20 right-4 z-50 h-10 w-10 rounded-full p-0 shadow-lg md:bottom-4"
    onClick={() => setShowTutorial(true)}
  >
    <HelpCircle className="h-5 w-5" />
    <span className="sr-only">Help & Tutorial</span>
  </Button>
  
  {/* Tutorial Modal */}
  <TutorialModal open={showTutorial} onOpenChange={setShowTutorial} />
  
  <NewsTicker />

      {/* Action Result Overlay */}
      {actionResult && (
        <ActionResultOverlay
          resultText={actionResult.resultText}
          statChanges={actionResult.statChanges}
          trainedSkills={actionResult.trainedSkills}
          leveledUp={actionResult.leveledUp}
          newLevel={actionResult.newLevel}
          newAchievements={actionResult.newAchievements}
          onClose={() => setActionResult(null)}
        />
      )}

      {/* Random Event Toast */}
      {randomEvent && <RandomEventToast event={randomEvent} onClose={() => setRandomEvent(null)} />}

      {/* Temptation Modal */}
      {temptation && <TemptationModal temptation={temptation} onClose={() => { setTemptation(null); fetchGameData() }} />}

      <main className="flex-1 p-4 md:p-6 has-mobile-nav md:pb-6">
        <div className="mx-auto max-w-7xl">
<div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
  <Card className="p-3 border-border/50"><StatBar label="Energy" value={character.energy} max={100} color="bg-chart-3" icon={<Zap className="h-3.5 w-3.5" />} /></Card>
  <Card className="p-3 border-border/50"><StatBar label="Anointing" value={character.anointing} max={100} color="bg-primary" icon={<Flame className="h-3.5 w-3.5" />} /></Card>
  <Card className="p-3 border-border/50"><StatBar label="Favor" value={character.favor ?? 0} max={100} color="bg-rose-500" icon={<Heart className="h-3.5 w-3.5" />} /></Card>
  <Card className="p-3 border-border/50"><StatBar label="Funds" value={Number(character.funds)} max={1000} color="bg-chart-2" icon={<DollarSign className="h-3.5 w-3.5" />} suffix="$" /></Card>
  <Card className="p-3 border-border/50"><StatBar label="Charisma" value={character.charisma} max={100} color="bg-chart-1" icon={<Star className="h-3.5 w-3.5" />} /></Card>
  <Card className="p-3 border-border/50"><StatBar label="Integrity" value={character.integrity_stat} max={100} color="bg-chart-4" icon={<Shield className="h-3.5 w-3.5" />} /></Card>
  <Card className="p-3 border-border/50"><StatBar label="Leadership" value={character.leadership} max={100} color="bg-chart-5" icon={<Crown className="h-3.5 w-3.5" />} /></Card>
  </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-card/50 backdrop-blur border border-border hidden md:flex">
              <TabsTrigger value="actions" className="gap-2"><Swords className="h-4 w-4" /> Actions</TabsTrigger>
              <TabsTrigger value="work" className="gap-2"><Briefcase className="h-4 w-4" /> Work</TabsTrigger>
              <TabsTrigger value="housing" className="gap-2"><Home className="h-4 w-4" /> Housing</TabsTrigger>
              <TabsTrigger value="character" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
              <TabsTrigger value="songs" className="gap-2"><Radio className="h-4 w-4" /> Studio</TabsTrigger>
              <TabsTrigger value="social" className="gap-2"><Users className="h-4 w-4" /> Fellowship</TabsTrigger>
              <TabsTrigger value="finance" className="gap-2"><Coins className="h-4 w-4" /> Finance</TabsTrigger>
              <TabsTrigger value="business" className="gap-2"><Building2 className="h-4 w-4" /> Business</TabsTrigger>
              <TabsTrigger value="shop" className="gap-2"><ShoppingBag className="h-4 w-4" /> Market</TabsTrigger>
              <TabsTrigger value="world" className="gap-2"><Globe className="h-4 w-4" /> Regions</TabsTrigger>
              <TabsTrigger value="story" className="gap-2"><BookOpen className="h-4 w-4" /> Story</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="mt-0 space-y-4">
              <RegionalEventsBanner regionId={character.region} energy={character.energy} funds={Number(character.funds)} onJoin={fetchGameData} />
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="flex flex-col gap-4 lg:col-span-2">
                  <DailyDevotional lastDailyLogin={character.last_daily_login} dailyStreak={character.daily_streak} onClaim={fetchGameData} />
                  <OpportunitiesPanel energy={character.energy} funds={Number(character.funds)} onComplete={fetchGameData} />
                  <PerformancePanel character={character} onPerform={handleAction} isLoading={isLoading} />
                  <ActivityPanel character={character} onPerformAction={handleAction} onPourOut={handlePourOut} isLoading={isLoading} />
                  <FastingPanel character={character} onStartFast={handleStartFast} onEndFast={handleEndFast} isLoading={isLoading} />
                </div>
                <div className="flex flex-col gap-4">
                  <DailyChallenges onChallengeComplete={fetchGameData} />
                  <BuffsDisplay buffs={buffs} />
                  <ActivityLog entries={log} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="work" className="mt-0 space-y-4">
              <WorkPanel character={character} onWork={handleWork} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="housing" className="mt-0 space-y-4">
              <HousingPanel character={character} onSelect={fetchGameData} />
            </TabsContent>

            <TabsContent value="character" className="mt-0 space-y-4">
              <CharacterPanel character={character} onUpgradeSkill={handleUpgradeSkill} isLoading={isLoading} />
              <SkillsPanel skills={skills} energy={character.energy} onTrain={() => fetchGameData()} />
            </TabsContent>

            <TabsContent value="social" className="mt-0 space-y-4">
              <SocialPanel 
                nearbyPlayers={[]} 
                relationships={[]} 
                onAction={() => { }} 
                isLoading={isLoading}
                characterId={character.id}
                region={character.region}
              />
              <CollabPanel invitations={[]} activeCollabs={[]} onAccept={() => { }} onDecline={() => { }} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="songs" className="mt-0 space-y-4">
              <TrendEnginePanel />
              <div className="grid gap-4 lg:grid-cols-2">
                <SongCatalog
                  character={character}
                  inventory={inventory}
                  onWriteSong={handleWriteSong}
                  onUpdate={fetchGameData}
                  isLoading={isLoading}
                />
                <StreamingPanel />
              </div>
            </TabsContent>

            <TabsContent value="finance" className="mt-0 space-y-4">
              <EarningsClaimPanel
                characterId={character.id}
                influence={character.influence}
                anointing={character.anointing}
                followers={character.followers ?? 0}
                lastRoyaltyClaim={character.last_royalty_claim}
                lastOfferingClaim={character.last_offering_claim}
                onClaim={fetchGameData}
              />
              <StreamingPanel />
            </TabsContent>

            <TabsContent value="business" className="mt-0 space-y-4">
              <BusinessPanel character={character} onUpdate={fetchGameData} />
            </TabsContent>

            <TabsContent value="shop" className="mt-0 space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <ShopPanel characterLevel={character.level} characterFunds={Number(character.funds)} onPurchase={fetchGameData} />
                <InventoryPanel inventory={inventory} onToggleEquipAll={() => { }} />
              </div>
            </TabsContent>

            <TabsContent value="world" className="mt-0 space-y-4">
              <RegionalEventsBanner regionId={character.region} energy={character.energy} funds={Number(character.funds)} onJoin={fetchGameData} />
              <RegionPanel currentRegion={character.region} characterFunds={Number(character.funds)} characterEnergy={character.energy} onTravel={fetchGameData} isLoading={isLoading} />
              <div className="grid gap-4 lg:grid-cols-3">
                <LodgingPanel lodgings={lodgings} currentId={(character as Record<string, unknown>).current_lodging_id} onCheckIn={handleCheckIn} funds={Number(character.funds)} />
                <JobPanel character={character} onWork={handleWork} isLoading={isLoading} />
                <UniversityPanel funds={Number(character.funds)} character={character} onEnroll={handleEnroll} isLoading={isLoading} />
              </div>
              <RivalLeaderboard regionId={character.region} playerInfluence={character.influence} playerName={character.artist_name} playerLevel={character.level} />
            </TabsContent>

            <TabsContent value="story" className="mt-0">
              <StoryPanel onStoryComplete={fetchGameData} />
            </TabsContent>

            {/* Mobile "More" tab - contains social, shop, story for mobile users */}
            <TabsContent value="more" className="mt-0 space-y-4">
              <Card className="p-4 border-border/50">
                <h3 className="font-semibold font-serif mb-3 text-lg">Quick Links</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setActiveTab("social")} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors touch-target">
                    <Users className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium">Fellowship</span>
                  </button>
                  <button onClick={() => setActiveTab("shop")} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors touch-target">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Market</span>
                  </button>
                  <button onClick={() => setActiveTab("story")} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors touch-target">
                    <BookOpen className="h-5 w-5 text-chart-4" />
                    <span className="text-sm font-medium">Story</span>
                  </button>
                  <button onClick={() => setActiveTab("songs")} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors touch-target">
                    <Trophy className="h-5 w-5 text-chart-1" />
                    <span className="text-sm font-medium">Achievements</span>
                  </button>
                </div>
              </Card>
              <AchievementsPanel />
              <TrendEnginePanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}
