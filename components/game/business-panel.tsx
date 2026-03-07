"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, DollarSign, TrendingUp, Users, Lock, Check, 
  Music, Store, Radio, Mic2, Church, Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Character } from "@/lib/game/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Business types that can be started
const BUSINESS_TYPES = [
  {
    id: "music_studio",
    name: "Recording Studio",
    description: "Record your own albums and offer services to other artists",
    icon: Mic2,
    startupCost: 5000,
    dailyIncome: 150,
    levelRequired: 8,
    leadershipRequired: 15,
    charismaRequired: 20,
  },
  {
    id: "music_store",
    name: "Gospel Music Store",
    description: "Sell instruments, sheet music, and worship resources",
    icon: Store,
    startupCost: 3000,
    dailyIncome: 80,
    levelRequired: 5,
    leadershipRequired: 10,
    charismaRequired: 15,
  },
  {
    id: "radio_station",
    name: "Gospel Radio Station",
    description: "Broadcast worship music and ministry content to the masses",
    icon: Radio,
    startupCost: 10000,
    dailyIncome: 250,
    levelRequired: 12,
    leadershipRequired: 25,
    charismaRequired: 30,
  },
  {
    id: "worship_school",
    name: "Worship School",
    description: "Train the next generation of worship leaders",
    icon: Church,
    startupCost: 7500,
    dailyIncome: 180,
    levelRequired: 10,
    leadershipRequired: 20,
    charismaRequired: 25,
  },
  {
    id: "record_label",
    name: "Record Label",
    description: "Sign artists and distribute their music worldwide",
    icon: Music,
    startupCost: 25000,
    dailyIncome: 500,
    levelRequired: 18,
    leadershipRequired: 35,
    charismaRequired: 40,
  },
]

interface BusinessPanelProps {
  character: Character
  onUpdate: () => void
}

export function BusinessPanel({ character, onUpdate }: BusinessPanelProps) {
  const { toast } = useToast()
  const { data, mutate } = useSWR("/api/game/business", fetcher)
  const [startingBusiness, setStartingBusiness] = useState<string | null>(null)
  const [collectingIncome, setCollectingIncome] = useState(false)

  const ownedBusinesses = data?.businesses ?? []
  const ownedBusinessTypes = new Set(ownedBusinesses.map((b: { business_type: string }) => b.business_type))
  const totalDailyIncome = ownedBusinesses.reduce((sum: number, b: { daily_income: number }) => sum + b.daily_income, 0)
  const uncollectedIncome = data?.uncollectedIncome ?? 0

  async function handleStartBusiness(businessType: string, startupCost: number) {
    setStartingBusiness(businessType)
    try {
      const res = await fetch("/api/game/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", businessType }),
      })
      const result = await res.json()
      if (res.ok) {
        toast({
          title: "Business Started!",
          description: `Your ${result.businessName} is now operational!`,
        })
        mutate()
        onUpdate()
      } else {
        toast({
          title: "Cannot Start Business",
          description: result.error || "Failed to start business",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      })
    } finally {
      setStartingBusiness(null)
    }
  }

  async function handleCollectIncome() {
    setCollectingIncome(true)
    try {
      const res = await fetch("/api/game/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "collect" }),
      })
      const result = await res.json()
      if (res.ok) {
        toast({
          title: "Income Collected!",
          description: `You collected $${result.collected} from your businesses!`,
        })
        mutate()
        onUpdate()
      } else {
        toast({
          title: "Cannot Collect",
          description: result.error || "No income to collect",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      })
    } finally {
      setCollectingIncome(false)
    }
  }

  function canStartBusiness(biz: typeof BUSINESS_TYPES[0]) {
    return (
      character.level >= biz.levelRequired &&
      character.leadership >= biz.leadershipRequired &&
      character.charisma >= biz.charismaRequired &&
      Number(character.funds) >= biz.startupCost &&
      !ownedBusinessTypes.has(biz.id)
    )
  }

  function getUnlockReason(biz: typeof BUSINESS_TYPES[0]) {
    if (ownedBusinessTypes.has(biz.id)) return "Already Owned"
    if (character.level < biz.levelRequired) return `Level ${biz.levelRequired} required`
    if (character.leadership < biz.leadershipRequired) return `Leadership ${biz.leadershipRequired} required`
    if (character.charisma < biz.charismaRequired) return `Charisma ${biz.charismaRequired} required`
    if (Number(character.funds) < biz.startupCost) return `$${biz.startupCost.toLocaleString()} required`
    return null
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Business Empire
            </CardTitle>
            <CardDescription>Build your ministry business portfolio</CardDescription>
          </div>
          {ownedBusinesses.length > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Daily Income</div>
              <div className="text-lg font-bold text-chart-2">${totalDailyIncome}/day</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="start" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="start">Start Business</TabsTrigger>
            <TabsTrigger value="manage">
              My Businesses ({ownedBusinesses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="start" className="space-y-3">
            {BUSINESS_TYPES.map((biz) => {
              const Icon = biz.icon
              const canStart = canStartBusiness(biz)
              const unlockReason = getUnlockReason(biz)
              const isOwned = ownedBusinessTypes.has(biz.id)

              return (
                <Card 
                  key={biz.id} 
                  className={`border transition-all ${
                    isOwned 
                      ? "border-chart-2/50 bg-chart-2/5" 
                      : canStart 
                        ? "border-primary/30 hover:border-primary/60" 
                        : "border-border/50 opacity-70"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${isOwned ? "bg-chart-2/20" : "bg-secondary"}`}>
                        <Icon className={`h-6 w-6 ${isOwned ? "text-chart-2" : "text-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{biz.name}</span>
                          {isOwned && (
                            <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                              <Check className="h-3 w-3 mr-1" /> Owned
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{biz.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-[10px] mb-2">
                          <Badge variant="outline" className="gap-1">
                            <DollarSign className="h-3 w-3" /> ${biz.startupCost.toLocaleString()}
                          </Badge>
                          <Badge variant="outline" className="gap-1 text-chart-2 border-chart-2/30">
                            <TrendingUp className="h-3 w-3" /> ${biz.dailyIncome}/day
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            LVL {biz.levelRequired}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            Lead {biz.leadershipRequired}
                          </Badge>
                        </div>

                        {!isOwned && (
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={!canStart || startingBusiness === biz.id}
                            onClick={() => handleStartBusiness(biz.id, biz.startupCost)}
                          >
                            {startingBusiness === biz.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : !canStart ? (
                              <Lock className="h-4 w-4 mr-2" />
                            ) : (
                              <Building2 className="h-4 w-4 mr-2" />
                            )}
                            {startingBusiness === biz.id 
                              ? "Starting..." 
                              : unlockReason || `Start Business ($${biz.startupCost.toLocaleString()})`}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="manage" className="space-y-3">
            {ownedBusinesses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>You don't own any businesses yet.</p>
                <p className="text-xs">Start a business to generate passive income!</p>
              </div>
            ) : (
              <>
                {/* Collect Income Button */}
                {uncollectedIncome > 0 && (
                  <Card className="border-chart-2/50 bg-chart-2/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-chart-2">Uncollected Income</div>
                          <div className="text-2xl font-black">${uncollectedIncome.toLocaleString()}</div>
                        </div>
                        <Button 
                          onClick={handleCollectIncome}
                          disabled={collectingIncome}
                          className="bg-chart-2 hover:bg-chart-2/90"
                        >
                          {collectingIncome ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <DollarSign className="h-4 w-4 mr-2" />
                          )}
                          Collect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Owned Businesses */}
                {ownedBusinesses.map((biz: { id: string; business_type: string; name: string; daily_income: number; level: number }) => {
                  const bizDef = BUSINESS_TYPES.find(b => b.id === biz.business_type)
                  const Icon = bizDef?.icon || Building2

                  return (
                    <Card key={biz.id} className="border-chart-2/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-chart-2/20">
                            <Icon className="h-6 w-6 text-chart-2" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold">{biz.name}</div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="text-chart-2 font-bold">${biz.daily_income}/day</span>
                              <span>Level {biz.level}</span>
                            </div>
                            <Progress value={(biz.level / 10) * 100} className="h-1 mt-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
