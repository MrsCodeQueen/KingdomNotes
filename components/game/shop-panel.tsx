"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Guitar, BookOpen, Mic, Sparkles, Lock, Check, Building2, Crown } from "lucide-react"
import type { ShopItem, InventoryItem } from "@/lib/game/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const TYPE_ICONS: Record<string, React.ReactNode> = {
  instrument: <Guitar className="h-4 w-4" />,
  study_material: <BookOpen className="h-4 w-4" />,
  equipment: <Mic className="h-4 w-4" />,
  spiritual: <Sparkles className="h-4 w-4" />,
  training: <BookOpen className="h-4 w-4" />,
  business: <Building2 className="h-4 w-4" />,
  ministry: <Crown className="h-4 w-4" />,
}

const TYPE_LABELS: Record<string, string> = {
  instrument: "Instruments",
  study_material: "Study Materials",
  equipment: "Equipment",
  spiritual: "Spiritual",
  training: "Training",
  business: "Businesses",
  ministry: "Ministry",
}

// Preferred tab order
const TYPE_ORDER = ["instrument", "equipment", "business", "ministry", "training", "study_material", "spiritual"]

interface ShopPanelProps {
  characterLevel: number
  characterFunds: number
  onPurchase: () => void
}

export function ShopPanel({ characterLevel, characterFunds, onPurchase }: ShopPanelProps) {
  const { data, mutate } = useSWR("/api/game/shop", fetcher)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [error, setError] = useState("")

  const shopItems: ShopItem[] = data?.shopItems ?? []
  const inventory: InventoryItem[] = data?.inventory ?? []
  const ownedNames = new Set(inventory.map((i) => i.item_name))

  const itemTypes = [...new Set(shopItems.map((i) => i.item_type))].sort(
    (a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b)
  )

  async function handlePurchase(itemId: string) {
    setPurchasing(itemId)
    setError("")
    try {
      const res = await fetch("/api/game/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopItemId: itemId }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || "Purchase failed")
      } else {
        mutate()
        onPurchase()
      }
    } catch {
      setError("Purchase failed")
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Shop
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Funds: <span className="font-mono text-primary">${characterFunds.toFixed(2)}</span>
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={itemTypes[0] || "instrument"}>
          <TabsList className="mb-3 flex flex-wrap gap-1 h-auto bg-secondary/50">
            {itemTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {TYPE_ICONS[type]}
                {TYPE_LABELS[type] || type}
              </TabsTrigger>
            ))}
          </TabsList>
          {itemTypes.map((type) => (
            <TabsContent key={type} value={type} className="space-y-2 mt-0">
              {shopItems
                .filter((item) => item.item_type === type)
                .map((item) => {
                  const owned = ownedNames.has(item.item_name)
                  const locked = characterLevel < item.level_required
                  const cantAfford = characterFunds < Number(item.price)
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start justify-between gap-3 rounded-md border p-3 ${
                        owned ? "border-primary/30 bg-primary/5" : locked ? "opacity-50" : "border-border"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">{item.item_name}</span>
                          {owned && (
                            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                              <Check className="h-3 w-3 mr-1" /> Owned
                            </Badge>
                          )}
                          {locked && (
                            <Badge variant="outline" className="text-xs border-muted-foreground/50">
                              <Lock className="h-3 w-3 mr-1" /> Lv.{item.level_required}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {Object.entries(item.stat_bonus).map(([stat, val]) => (
                            <span key={stat} className={`text-xs font-mono ${stat === 'income_per_day' ? 'text-accent' : 'text-primary'}`}>
                              {stat === 'income_per_day' ? `$${val}/day` : `+${val as number} ${stat}`}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-sm font-mono text-foreground">${Number(item.price).toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant={owned ? "outline" : "default"}
                          disabled={owned || locked || cantAfford || purchasing === item.id}
                          onClick={() => handlePurchase(item.id)}
                          className="text-xs h-7"
                        >
                          {purchasing === item.id ? "..." : owned ? "Owned" : locked ? "Locked" : cantAfford ? "No Funds" : "Buy"}
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
