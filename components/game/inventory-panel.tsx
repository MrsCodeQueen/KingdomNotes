"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Backpack, Guitar, BookOpen, Mic, Sparkles, Building2, Crown } from "lucide-react"
import type { InventoryItem } from "@/lib/game/types"

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

export function InventoryPanel() {
  const { data } = useSWR("/api/game/shop", fetcher)
  const inventory: InventoryItem[] = data?.inventory ?? []

  if (inventory.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Backpack className="h-5 w-5 text-primary" />
            Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your inventory is empty. Visit the Shop to buy items.</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate total stat bonuses from all equipped items
  const totalBonuses: Record<string, number> = {}
  inventory.forEach((item) => {
    if (item.equipped && item.stat_bonus) {
      Object.entries(item.stat_bonus).forEach(([stat, val]) => {
        totalBonuses[stat] = (totalBonuses[stat] || 0) + (val as number)
      })
    }
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Backpack className="h-5 w-5 text-primary" />
          Inventory
          <Badge variant="secondary" className="ml-auto text-xs">{inventory.length} items</Badge>
        </CardTitle>
        {Object.keys(totalBonuses).length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Total bonuses:</span>
            {Object.entries(totalBonuses).map(([stat, val]) => (
              <span key={stat} className="text-xs font-mono text-primary">+{val} {stat}</span>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {inventory.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-md border border-border/50 p-2">
            <span className="text-muted-foreground">{TYPE_ICONS[item.item_type] || <Backpack className="h-4 w-4" />}</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground">{item.item_name}</span>
              <div className="flex gap-2 flex-wrap">
                {item.stat_bonus && Object.entries(item.stat_bonus).map(([stat, val]) => (
                  <span key={stat} className={`text-xs font-mono ${stat === 'income_per_day' ? 'text-accent' : 'text-primary'}`}>
                    {stat === 'income_per_day' ? `$${val}/day` : `+${val as number} ${stat}`}
                  </span>
                ))}
              </div>
            </div>
            {item.equipped && (
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">Equipped</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
