"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { REGIONS } from "@/lib/game/constants"
import { MapPin } from "lucide-react"
import { Logo } from "@/components/logo"

export default function OnboardingPage() {
  const [legalName, setLegalName] = useState("")
  const [artistName, setArtistName] = useState("")
  const [gender, setGender] = useState("male")
  const [region, setRegion] = useState("north_america")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    const { error: charError } = await supabase.from("characters").insert({
      user_id: user.id,
      legal_name: legalName,
      artist_name: artistName,
      gender,
      region,
    })

    if (charError) {
      if (charError.code === "23505") {
        router.push("/game")
        return
      }
      setError(charError.message)
      setIsLoading(false)
      return
    }

    router.push("/game")
  }

  const selectedRegion = REGIONS.find((r) => r.id === region)

  return (
    <div className="relative z-10 flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <Logo size="md" />
            <span className="text-lg font-semibold font-serif text-muted-foreground">Create Your Minister</span>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Character Creation</CardTitle>
              <CardDescription>Define who you are in the world of Kingdom Notes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="legal-name">Legal Name</Label>
                    <Input id="legal-name" placeholder="John Smith" required value={legalName} onChange={(e) => setLegalName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="artist-name">Artist / Stage Name</Label>
                    <Input id="artist-name" placeholder="Minister J" required value={artistName} onChange={(e) => setArtistName(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal">Male</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal">Female</Label>
                    </div>

                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>Starting Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          <span className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {r.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRegion && (
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{"Cost of Living: "}{selectedRegion.costOfLiving}x</span>
                      <span>{"Spiritual Hunger: "}{(selectedRegion.spiritualHunger * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating character..." : "Enter Kingdom Notes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
