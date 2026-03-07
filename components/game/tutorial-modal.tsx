"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Zap, Flame, DollarSign, Star, Shield, Crown, Heart,
  Music, Briefcase, Home, Users, ShoppingBag, Globe,
  ChevronRight, ChevronLeft, Sparkles, BookOpen, Radio,
  GraduationCap, Trophy, Target, Lightbulb
} from "lucide-react"

const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Kingdom Notes",
    icon: <Music className="h-8 w-8" />,
    content: `You are an aspiring Gospel artist on a journey to spread the message of faith through music. Build your ministry, write songs, grow your influence, and touch lives across the globe.`,
    tips: [
      "Your journey starts small - but with dedication, you'll reach the nations",
      "Balance spiritual growth with practical skills",
      "Every action you take shapes your ministry"
    ]
  },
  {
    id: "stats",
    title: "Understanding Your Stats",
    icon: <Target className="h-8 w-8" />,
    content: `Your character has 7 core stats that determine your abilities and progress:`,
    stats: [
      { name: "Energy", icon: <Zap className="h-4 w-4" />, color: "bg-chart-3", desc: "Needed for all activities. Regenerates over time and when you rest." },
      { name: "Anointing", icon: <Flame className="h-4 w-4" />, color: "bg-primary", desc: "Your spiritual power. Affects song quality and ministry impact." },
      { name: "Favor", icon: <Heart className="h-4 w-4" />, color: "bg-rose-500", desc: "Divine favor. Earned through prayer, worship, and helping others." },
      { name: "Funds", icon: <DollarSign className="h-4 w-4" />, color: "bg-chart-2", desc: "Money for equipment, housing, travel, and ministry expenses." },
      { name: "Charisma", icon: <Star className="h-4 w-4" />, color: "bg-chart-1", desc: "Your stage presence and ability to connect with audiences." },
      { name: "Integrity", icon: <Shield className="h-4 w-4" />, color: "bg-chart-4", desc: "Your moral foundation. High integrity unlocks special opportunities." },
      { name: "Leadership", icon: <Crown className="h-4 w-4" />, color: "bg-chart-5", desc: "Ability to lead teams and ministries. Required for advanced roles." },
    ]
  },
  {
    id: "actions",
    title: "Activities & Actions",
    icon: <Sparkles className="h-8 w-8" />,
    content: `The Actions tab is your main gameplay area. Here you can perform activities that build your skills and ministry:`,
    categories: [
      { name: "Devotion", examples: "Prayer, Worship, Scripture Study, Soaking", benefit: "Builds Anointing and Favor" },
      { name: "Performance", examples: "Busking, Church Service, Concerts, Tours", benefit: "Earns money and builds Charisma" },
      { name: "Creative", examples: "Songwriting, Recording, Jam Sessions", benefit: "Creates songs and builds skills" },
      { name: "Leadership", examples: "Lead Worship Team, Train Musicians, Organize Outreach", benefit: "Builds Leadership stat" },
    ],
    tips: [
      "Activities cost Energy - manage it wisely",
      "Some activities require minimum stat levels",
      "Higher quality performances require better stats"
    ]
  },
  {
    id: "work",
    title: "Work & Jobs",
    icon: <Briefcase className="h-8 w-8" />,
    content: `Need funds? The Work tab offers various jobs to earn money while building skills:`,
    tiers: [
      { name: "Entry Level", examples: "Barista, Grocery Clerk", pay: "$25-40/shift", req: "None" },
      { name: "Skilled", examples: "Music Tutor, Sound Tech", pay: "$80-110/shift", req: "Anointing or Charisma" },
      { name: "Professional", examples: "Session Musician, Worship Director", pay: "$150-200/shift", req: "Multiple stats" },
      { name: "Executive", examples: "Ministry Director, Label A&R", pay: "$250-350/shift", req: "High Leadership" },
    ],
    tips: [
      "Better jobs require higher stats",
      "Some jobs give Leadership bonuses",
      "Work shifts cost energy like other activities"
    ]
  },
  {
    id: "songs",
    title: "Writing & Promoting Songs",
    icon: <Radio className="h-8 w-8" />,
    content: `Songs are the heart of your ministry. Create them in the Studio tab:`,
    steps: [
      { step: 1, title: "Write", desc: "Spend energy and inspiration to write a new song. Quality depends on your Anointing." },
      { step: 2, title: "Record", desc: "Record your song to improve its quality (coming soon)." },
      { step: 3, title: "Promote", desc: "Spend energy to promote your song, gaining Influence and Charisma." },
      { step: 4, title: "Perform", desc: "Play your songs at events to earn money and spread your message." },
    ],
    tips: [
      "Higher Anointing = higher quality songs",
      "Promoting costs 15 energy but builds influence",
      "Your song catalog grows over time"
    ]
  },
  {
    id: "housing",
    title: "Housing & Rest",
    icon: <Home className="h-8 w-8" />,
    content: `Where you live affects your energy regeneration and spiritual growth:`,
    types: [
      { name: "Nomadic", desc: "Cheap but minimal bonuses. Good for starting out.", cost: "$10-40/day" },
      { name: "Boarding", desc: "Shared housing with moderate bonuses.", cost: "$50-180/day" },
      { name: "Hotel", desc: "Comfortable living with good energy regen.", cost: "$200-450/day" },
      { name: "Sanctuary", desc: "Spiritual retreats with high anointing bonuses.", cost: "$120-280/day" },
    ],
    tips: [
      "Better housing = faster energy regeneration",
      "Sanctuaries boost your Anointing recovery",
      "Housing costs are deducted daily"
    ]
  },
  {
    id: "fellowship",
    title: "Fellowship & Community",
    icon: <Users className="h-8 w-8" />,
    content: `Kingdom Notes is better with friends! The Fellowship tab connects you with other players:`,
    features: [
      { name: "Friend System", desc: "Add friends from the leaderboard and stay connected." },
      { name: "Fellowship Groups", desc: "Join or create worship teams, choirs, and ministry groups." },
      { name: "Prayer Requests", desc: "Share prayer needs and pray for others to earn Favor." },
      { name: "Leaderboard", desc: "See top players and who's online right now." },
    ],
    tips: [
      "Praying for others earns you Favor and Anointing",
      "Creating a Fellowship requires Leadership 10+",
      "Online players appear at the top of the leaderboard"
    ]
  },
  {
    id: "shop",
    title: "The Market",
    icon: <ShoppingBag className="h-8 w-8" />,
    content: `Invest in your ministry through the Market tab:`,
    categories: [
      { name: "Instruments", desc: "Guitars, keyboards, drums - boost your Charisma" },
      { name: "Equipment", desc: "Mics, monitors, lighting - improve performances" },
      { name: "Study Materials", desc: "Books and courses - build Integrity and knowledge" },
      { name: "Spiritual Items", desc: "Devotionals and retreats - boost Anointing" },
      { name: "Training", desc: "Classes and mentorship - level up faster" },
      { name: "Ministry", desc: "Contracts and teams - unlock passive income" },
    ],
    tips: [
      "Items give permanent stat bonuses",
      "Some items require minimum levels",
      "Check for legendary items with special bonuses"
    ]
  },
  {
    id: "regions",
    title: "Regions & Travel",
    icon: <Globe className="h-8 w-8" />,
    content: `The world is your mission field. Different regions offer unique opportunities:`,
    regions: [
      { name: "North America", desc: "Strong music industry, competitive market" },
      { name: "Europe", desc: "Rich worship traditions, diverse audiences" },
      { name: "Africa", desc: "Vibrant faith communities, growing opportunities" },
      { name: "South America", desc: "Passionate worship culture, emerging market" },
      { name: "Asia", desc: "Cross-cultural ministry, unique challenges" },
      { name: "Oceania", desc: "Island worship scenes, tight-knit communities" },
    ],
    tips: [
      "Each region has different housing and job options",
      "Travel costs money - save up before moving",
      "Build influence in multiple regions to go global"
    ]
  },
  {
    id: "success",
    title: "Path to Success",
    icon: <Trophy className="h-8 w-8" />,
    content: `Here's a recommended path for new players:`,
    steps: [
      { phase: "Early Game", tasks: ["Work entry-level jobs for funds", "Do spiritual activities daily", "Write your first songs", "Find affordable housing"] },
      { phase: "Mid Game", tasks: ["Unlock skilled jobs", "Build a song catalog", "Join a Fellowship", "Invest in equipment"] },
      { phase: "Late Game", tasks: ["Lead worship teams", "Tour multiple regions", "Start your own ministry", "Mentor other players"] },
    ],
    tips: [
      "Balance money-making with spiritual growth",
      "Don't neglect any stat completely",
      "Connect with other players for bonus opportunities"
    ]
  }
]

interface TutorialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TutorialModal({ open, onOpenChange }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = TUTORIAL_STEPS[currentStep]
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onOpenChange(false)
      localStorage.setItem("kingdom-notes-tutorial-complete", "true")
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {step.icon}
            </div>
            <div>
              <DialogTitle className="text-xl">{step.title}</DialogTitle>
              <DialogDescription>
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </DialogDescription>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-1.5" />
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground leading-relaxed">{step.content}</p>

          {/* Stats display */}
          {step.stats && (
            <div className="grid gap-2">
              {step.stats.map((stat) => (
                <div key={stat.name} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{stat.name}</p>
                    <p className="text-xs text-muted-foreground">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Categories display */}
          {step.categories && (
            <div className="grid gap-2">
              {step.categories.map((cat) => (
                <Card key={cat.name} className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{cat.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{cat.benefit}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.examples}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Job tiers */}
          {step.tiers && (
            <div className="grid gap-2">
              {step.tiers.map((tier) => (
                <div key={tier.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-semibold text-sm">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.examples}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs font-mono">{tier.pay}</Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">Req: {tier.req}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Numbered steps */}
          {step.steps && (
            <div className="space-y-2">
              {step.steps.map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Housing types */}
          {step.types && (
            <div className="grid grid-cols-2 gap-2">
              {step.types.map((type) => (
                <Card key={type.name} className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{type.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{type.cost}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Features list */}
          {step.features && (
            <div className="grid gap-2">
              {step.features.map((feat) => (
                <div key={feat.name} className="rounded-lg border p-3">
                  <p className="font-semibold text-sm">{feat.name}</p>
                  <p className="text-xs text-muted-foreground">{feat.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Shop categories */}
          {step.categories && step.id === "shop" && (
            <div className="grid grid-cols-2 gap-2">
              {step.categories.map((cat) => (
                <Card key={cat.name} className="p-3">
                  <p className="font-semibold text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Regions */}
          {step.regions && (
            <div className="grid grid-cols-2 gap-2">
              {step.regions.map((region) => (
                <Card key={region.name} className="p-3">
                  <p className="font-semibold text-sm">{region.name}</p>
                  <p className="text-xs text-muted-foreground">{region.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Success path phases */}
          {step.steps && step.id === "success" && step.steps.map((phase: any) => (
            <Card key={phase.phase} className="p-3">
              <p className="font-semibold text-sm mb-2">{phase.phase}</p>
              <ul className="space-y-1">
                {phase.tasks.map((task: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="h-3 w-3 text-primary" />
                    {task}
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          {/* Tips */}
          {step.tips && (
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                <span className="font-semibold text-sm">Tips</span>
              </div>
              <ul className="space-y-1">
                {step.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-accent">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <button
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${i === currentStep ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"}`}
                onClick={() => setCurrentStep(i)}
              />
            ))}
          </div>

          <Button onClick={nextStep}>
            {currentStep === TUTORIAL_STEPS.length - 1 ? (
              "Start Playing"
            ) : (
              <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
