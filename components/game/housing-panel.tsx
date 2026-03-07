"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Zap, Flame, DollarSign, MapPin, Check } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"
import { useToast } from "@/hooks/use-toast"

interface Lodging {
  id: string
  name: string
  region: string
  type: string
  daily_rent: number
  energy_regen_bonus: number
  anointing_bonus: number
  description: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  nomadic: { bg: "bg-blue-500/10", text: "text-blue-400", icon: "🎒" },
  boarding: { bg: "bg-amber-500/10", text: "text-amber-400", icon: "🏠" },
  hotel: { bg: "bg-purple-500/10", text: "text-purple-400", icon: "🏨" },
  sanctuary: { bg: "bg-rose-500/10", text: "text-rose-400", icon: "⛪" },
}

const REGION_NAMES: Record<string, string> = {
  na: "North America",
  eu: "Europe",
  af: "Africa",
  sa: "South America",
  as: "Asia",
  oc: "Oceania",
}

export function HousingPanel({ character, onSelect }: { character: any; onSelect?: (id: string) => void }) {
  const { toast } = useToast()
  const [selectedRegion, setSelectedRegion] = useState<string>(character?.region || "na")
  const [selectedHousing, setSelectedHousing] = useState<Lodging | null>(null)
  const [isRenting, setIsRenting] = useState(false)

  const { data: lodgings, isLoading } = useSWR<Lodging[]>(
    `/api/game/lodgings?region=${selectedRegion}`,
    fetcher
  )

  const handleRent = async (lodging: Lodging) => {
    if (!character) return
    setIsRenting(true)
    try {
      const res = await fetch("/api/game/housing/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lodgingId: lodging.id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({
          title: "Welcome Home!",
          description: `You rented ${lodging.name}. Daily cost: $${lodging.daily_rent}`,
        })
        onSelect?.(lodging.id)
      } else {
        toast({
          title: "Cannot Rent",
          description: data.error || "You don't have enough funds",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rent housing",
        variant: "destructive",
      })
    }
    setIsRenting(false)
  }

  const regions = Object.keys(REGION_NAMES)

  return (
    <div className="space-y-4">
      {/* Region Selector */}
      <Card className="border-accent/30 bg-background/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-accent" />
            Select Region
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {regions.map((region) => (
              <Button
                key={region}
                variant={selectedRegion === region ? "default" : "outline"}
                className={selectedRegion === region ? "btn-glow" : ""}
                onClick={() => setSelectedRegion(region)}
              >
                {REGION_NAMES[region]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Housing Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-muted-foreground uppercase">
          {REGION_NAMES[selectedRegion]} Housing
        </h3>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-secondary/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-2 max-h-[600px] overflow-y-auto pr-2">
            {lodgings?.map((lodging) => {
              const typeInfo = TYPE_COLORS[lodging.type] || TYPE_COLORS.nomadic
              const isCurrentSelection = selectedHousing?.id === lodging.id

              return (
                <Card
                  key={lodging.id}
                  className={`cursor-pointer transition-all border ${
                    isCurrentSelection
                      ? "border-accent bg-accent/10"
                      : "border-secondary hover:border-accent/50"
                  }`}
                  onClick={() => setSelectedHousing(lodging)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm truncate">
                            {lodging.name}
                          </h4>
                          <Badge variant="secondary" className={`text-[10px] ${typeInfo.bg} ${typeInfo.text} border-0 shrink-0`}>
                            {lodging.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {lodging.description}
                        </p>

                        {/* Bonuses */}
                        <div className="flex flex-wrap gap-2 text-xs font-mono">
                          <div className="flex items-center gap-1 text-amber-400">
                            <DollarSign className="h-3 w-3" />
                            ${lodging.daily_rent}/day
                          </div>
                          <div className="flex items-center gap-1 text-blue-400">
                            <Zap className="h-3 w-3" />
                            +{lodging.energy_regen_bonus} Energy
                          </div>
                          <div className="flex items-center gap-1 text-orange-400">
                            <Flame className="h-3 w-3" />
                            +{lodging.anointing_bonus} Anointing
                          </div>
                        </div>
                      </div>

                      {/* Right: Current Housing Indicator */}
                      <div className="flex flex-col items-center gap-2">
                        {character?.current_lodging_id === lodging.id && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                            <Check className="h-5 w-5 text-emerald-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected Housing Details */}
      {selectedHousing && (
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-5 w-5" />
              {selectedHousing.name}
            </CardTitle>
            <CardDescription>{selectedHousing.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded bg-secondary/50">
                <div className="text-xs text-muted-foreground">Daily Cost</div>
                <div className="font-bold text-primary">${selectedHousing.daily_rent}</div>
              </div>
              <div className="text-center p-2 rounded bg-secondary/50">
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3" /> Energy
                </div>
                <div className="font-bold text-blue-400">+{selectedHousing.energy_regen_bonus}</div>
              </div>
              <div className="text-center p-2 rounded bg-secondary/50">
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Flame className="h-3 w-3" /> Anointing
                </div>
                <div className="font-bold text-orange-400">+{selectedHousing.anointing_bonus}</div>
              </div>
            </div>

            {/* Rent Button */}
            <Button
              className="w-full btn-glow"
              onClick={() => handleRent(selectedHousing)}
              disabled={isRenting || character?.current_lodging_id === selectedHousing.id}
            >
              {character?.current_lodging_id === selectedHousing.id
                ? "Currently Living Here"
                : isRenting
                ? "Renting..."
                : "Rent This Housing"}
            </Button>

            {character?.funds < selectedHousing.daily_rent && (
              <p className="text-xs text-destructive">
                Insufficient funds. You have ${character?.funds || 0}, need ${selectedHousing.daily_rent}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
