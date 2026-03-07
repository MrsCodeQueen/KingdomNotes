"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { LiveCharacterPreview, SkillTreePreview, MiniLeaderboard, StoryPreview, LiveActivityFeed } from "@/components/landing/game-demo"
import { Logo } from "@/components/logo"
import {
  Music, BookOpen, Users, Flame, Globe,
  TrendingUp, Zap, Mic2, ChevronRight,
  Swords, PenLine, Star, Shield
} from "lucide-react"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <main className="relative z-10 flex min-h-svh flex-col items-center bg-background selection:bg-primary/30">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-chart-2/10 blur-[120px]" />
      </div>

      {/* Top Ticker */}
      <div className="w-full border-b border-border bg-card/50 backdrop-blur-md py-2 overflow-hidden relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
          <ThemeToggle />
        </div>
        <div className="flex whitespace-nowrap animate-marquee gap-8 items-center text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-chart-2" />
            GLOBAL ANOINTING: <span className="text-foreground">84% (+2.4%)</span>
          </span>
          <span className="flex items-center gap-2">
            <Mic2 className="h-3 w-3 text-primary" />
            LATEST HIT: <span className="text-foreground">{"\"Grace Abounds\" by Levite_99"}</span>
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-3 w-3 text-chart-1" />
            LIVE CONFERENCES: <span className="text-foreground">Lagos, London, Detroit</span>
          </span>
          <span className="flex items-center gap-2">
            <Flame className="h-3 w-3 text-destructive" />
            REVIVAL ACTIVE: <span className="text-foreground">Africa region +25% anointing</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-16 p-6 max-w-7xl w-full">

        {/* ====================== HERO ====================== */}
        <section className="flex flex-col items-center gap-6 text-center pt-8 md:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Zap className="h-4 w-4 fill-current" />
            <span>Spring 2026 Season is Live</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 md:gap-6 animate-in fade-in zoom-in duration-700">
              <Logo size="xl" showText={false} />
              <h1 className="text-5xl font-extrabold font-serif tracking-tight md:text-8xl lg:text-9xl text-balance text-worship">
                Kingdom Notes
              </h1>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed text-pretty md:text-xl">
              A living simulation of the gospel music industry.
              Build your calling from street corners to global stages through
              worship, skill training, and the power of the Word.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Button asChild size="lg" className="btn-glow h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              <Link href="/auth/sign-up">Begin Your Journey</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold backdrop-blur-sm">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </section>

        {/* ====================== PLAYABLE DEMO ====================== */}
        <section className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold text-primary border-primary/30">Try it now</Badge>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground text-balance">Play Before You Sign Up</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Click the buttons below to see how the game works. Train skills, watch stats grow, and explore the world.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Interactive Character */}
            <div className="lg:row-span-2">
              <LiveCharacterPreview />
            </div>

            {/* Skill Tree */}
            <SkillTreePreview />

            {/* Story */}
            <StoryPreview />

            {/* Leaderboard */}
            <MiniLeaderboard />

            {/* Live Feed */}
            <LiveActivityFeed />
          </div>
        </section>

        {/* ====================== FEATURES GRID ====================== */}
        <section className="w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground text-balance">A Whole World of Worship</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Your story unfolds through chapters. Every choice shapes your ministry, reputation, and destiny.</p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<Music className="h-7 w-7" />} title="15 Trainable Skills" description="Vocals, Songwriting, Production, Preaching, Worship Leading -- train them Popmundo-style." />
            <FeatureCard icon={<Swords className="h-7 w-7" />} title="Temptation System" description="Secular labels, stolen melodies, prosperity preachers. Resist or yield -- your integrity hangs in the balance." />
            <FeatureCard icon={<Globe className="h-7 w-7" />} title="4 World Regions" description="Africa, North America, Europe, South America. Each with unique events, rivals, and bonuses." />
            <FeatureCard icon={<TrendingUp className="h-7 w-7" />} title="Streaming Trends" description="Tag your songs and ride the trend wave. Acoustic revival or choir renaissance -- time your releases." />
            <FeatureCard icon={<Star className="h-7 w-7" />} title="Ministry Titles" description="Rise from Street Musician to Kingdom Legend. 11 progressive titles earned by leveling up." />
            <FeatureCard icon={<PenLine className="h-7 w-7" />} title="Record Albums" description="Bundle songs into albums, pay studio fees, and watch royalties roll in from streaming." />
            <FeatureCard icon={<Shield className="h-7 w-7" />} title="Story Chapters" description="Narrative-driven progression. Unlock new chapters as your character grows in skill and faith." />
            <FeatureCard icon={<Flame className="h-7 w-7" />} title="Fasting & Prayer" description="Sacrifice energy for anointing surges. Deep fasting unlocks spiritual warfare buffs." />
          </div>
        </section>

        {/* ====================== REGION SPOTLIGHT ====================== */}
        <section className="w-full">
          <Card className="border-primary/10 bg-card/40 backdrop-blur-md overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-2 text-chart-2 font-bold uppercase tracking-widest text-xs">
                    <Globe className="h-4 w-4" />
                    Region of the Week
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">Lagos, Nigeria</h3>
                  <p className="text-muted-foreground">
                    High spiritual hunger bonus. Anointing grows <span className="text-primary font-bold">1.5x faster</span> here, but energy drains quickly during high-intensity praise sessions.
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">428</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Artists</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">High</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Spiritual Hunger</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">2 Active</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Events</p>
                    </div>
                  </div>
                </div>
                <div className="bg-primary/5 p-8 flex items-center justify-center border-l border-border min-h-[200px]">
                  <div className="relative h-48 w-48 rounded-full border-4 border-dashed border-primary/20 animate-spin-slow flex items-center justify-center">
                    <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ====================== CTA ====================== */}
        <section className="w-full text-center space-y-6 py-8">
          <h2 className="text-3xl md:text-4xl font-extrabold font-serif text-worship text-balance">Your Ministry Awaits</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Join thousands of artists building their calling in the gospel music industry. Free to play.</p>
          <Button asChild size="lg" className="btn-glow h-14 px-10 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
            <Link href="/auth/sign-up">
              Start Your Story <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <p>{"© 2026 Kingdom Notes. All rights reserved."}</p>
          </div>
          <div className="flex gap-8">
            <Link href="/manual" className="hover:text-primary transition-colors">Game Manual</Link>
            <Link href="/community" className="hover:text-primary transition-colors">Community</Link>
            <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card-glow group flex flex-col items-start gap-3 rounded-xl border border-border bg-card/60 p-5 text-left transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-2xl hover:shadow-primary/5">
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold leading-none tracking-tight text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
