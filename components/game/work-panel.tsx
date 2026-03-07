"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Zap, Lock, DollarSign, TrendingUp, Clock, Star, Crown, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Expanded job listings
const JOBS = {
  entry: [
    { id: "barista", title: "Local Barista", description: "Serve coffee at a Christian café", pay: 25, energy: 35, req: "none", val: 0, leadershipGain: 0 },
    { id: "janitor", title: "Church Janitor", description: "Keep the sanctuary clean and presentable", pay: 20, energy: 30, req: "none", val: 0, leadershipGain: 1 },
    { id: "greeter", title: "Church Greeter", description: "Welcome visitors with a warm smile", pay: 15, energy: 20, req: "none", val: 0, leadershipGain: 1 },
  ],
  skilled: [
    { id: "office", title: "Admin Assistant", description: "Handle church administration tasks", pay: 60, energy: 45, req: "leadership", val: 10, leadershipGain: 2 },
    { id: "tutor", title: "Music Tutor", description: "Teach music to aspiring worshippers", pay: 110, energy: 30, req: "charisma", val: 20, leadershipGain: 2 },
    { id: "sound_tech", title: "Sound Technician", description: "Run audio for worship services", pay: 75, energy: 40, req: "charisma", val: 15, leadershipGain: 1 },
    { id: "worship_coord", title: "Worship Coordinator", description: "Schedule and organize worship teams", pay: 90, energy: 50, req: "leadership", val: 15, leadershipGain: 3 },
  ],
  professional: [
    { id: "music_director", title: "Music Director", description: "Lead the entire music ministry", pay: 180, energy: 55, req: "leadership", val: 25, leadershipGain: 4 },
    { id: "youth_pastor", title: "Youth Music Pastor", description: "Guide youth worship ministry", pay: 150, energy: 50, req: "leadership", val: 20, leadershipGain: 5 },
    { id: "studio_engineer", title: "Studio Engineer", description: "Professional recording work", pay: 200, energy: 45, req: "charisma", val: 30, leadershipGain: 2 },
    { id: "tour_manager", title: "Tour Manager", description: "Manage worship tours and events", pay: 250, energy: 60, req: "leadership", val: 30, leadershipGain: 5 },
  ],
  executive: [
    { id: "worship_pastor", title: "Worship Pastor", description: "Lead worship for the entire church", pay: 350, energy: 65, req: "leadership", val: 40, leadershipGain: 6 },
    { id: "label_exec", title: "Label Executive", description: "Run a Christian music label", pay: 500, energy: 70, req: "leadership", val: 50, leadershipGain: 8 },
    { id: "ministry_head", title: "Ministry Director", description: "Oversee multiple ministry departments", pay: 400, energy: 60, req: "leadership", val: 45, leadershipGain: 7 },
  ],
}

const TIER_CONFIG = {
  entry: { label: "Entry Level", icon: Briefcase, color: "text-muted-foreground" },
  skilled: { label: "Skilled", icon: Star, color: "text-chart-3" },
  professional: { label: "Professional", icon: TrendingUp, color: "text-primary" },
  executive: { label: "Executive", icon: Crown, color: "text-amber-500" },
}

interface WorkPanelProps {
  character: {
    energy: number
    leadership: number
    charisma: number
    [key: string]: number | string | null | undefined
  }
  onWork: (jobId: string) => void
  isLoading: boolean
}

export function WorkPanel({ character, onWork, isLoading }: WorkPanelProps) {
  const [selectedTier, setSelectedTier] = useState<keyof typeof JOBS>("entry")
  const [selectedJob, setSelectedJob] = useState<typeof JOBS.entry[0] | null>(null)

  const jobs = JOBS[selectedTier]

  const meetsRequirement = (job: typeof JOBS.entry[0]) => {
    if (job.req === "none") return true
    const statValue = character[job.req as keyof typeof character]
    return typeof statValue === "number" && statValue >= job.val
  }

  const canWork = (job: typeof JOBS.entry[0]) => {
    return meetsRequirement(job) && character.energy >= job.energy
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border/50 bg-card/50">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-chart-3" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Energy</p>
              <p className="text-lg font-black">{character.energy}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 border-border/50 bg-card/50">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-chart-5" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Leadership</p>
              <p className="text-lg font-black">{character.leadership}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 border-border/50 bg-card/50">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-chart-1" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Charisma</p>
              <p className="text-lg font-black">{character.charisma}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Job Listings */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-worship uppercase tracking-widest font-black">
                <Briefcase className="h-4 w-4 text-primary" />
                The Marketplace
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                Build your career and grow in leadership through work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tier Tabs */}
              <Tabs value={selectedTier} onValueChange={(v) => setSelectedTier(v as keyof typeof JOBS)}>
                <TabsList className="grid grid-cols-4 w-full">
                  {Object.entries(TIER_CONFIG).map(([key, config]) => (
                    <TabsTrigger key={key} value={key} className="gap-1.5 text-[10px]">
                      <config.icon className={cn("h-3 w-3", config.color)} />
                      <span className="hidden sm:inline">{config.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.keys(JOBS).map((tier) => (
                  <TabsContent key={tier} value={tier} className="mt-4 space-y-2">
                    {JOBS[tier as keyof typeof JOBS].map((job) => {
                      const meets = meetsRequirement(job)
                      const can = canWork(job)
                      return (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className={cn(
                            "p-3 rounded-lg border transition-all cursor-pointer",
                            selectedJob?.id === job.id ? "border-primary bg-primary/10" : "border-border/40 bg-secondary/10",
                            !meets && "opacity-50 border-dashed"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground">
                                {job.title}
                              </h4>
                              {!meets && <Lock className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <span className="font-mono font-bold text-primary">${job.pay}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">{job.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                                <Zap className="h-2.5 w-2.5" /> -{job.energy} EN
                              </span>
                              {job.leadershipGain > 0 && (
                                <span className="text-[10px] font-bold text-chart-5 flex items-center gap-1">
                                  <Crown className="h-2.5 w-2.5" /> +{job.leadershipGain} Lead
                                </span>
                              )}
                            </div>
                            {job.req !== "none" && (
                              <Badge variant="outline" className={cn(
                                "text-[8px] h-4",
                                meets ? "border-primary/30 text-primary" : "border-destructive/30 text-destructive"
                              )}>
                                {job.req} {job.val}+
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Selected Job Detail */}
        <div>
          <Card className="border-border bg-card/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-worship uppercase tracking-widest font-black">
                {selectedJob ? "Job Details" : "Select a Job"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedJob ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-foreground">{selectedJob.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{selectedJob.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded bg-primary/10 border border-primary/20">
                      <p className="text-[9px] text-primary uppercase font-bold">Pay</p>
                      <p className="text-lg font-black text-primary">${selectedJob.pay}</p>
                    </div>
                    <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
                      <p className="text-[9px] text-destructive uppercase font-bold">Energy</p>
                      <p className="text-lg font-black text-destructive">-{selectedJob.energy}</p>
                    </div>
                  </div>

                  {selectedJob.leadershipGain > 0 && (
                    <div className="p-2 rounded bg-chart-5/10 border border-chart-5/20">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-chart-5" />
                        <div>
                          <p className="text-[9px] text-chart-5 uppercase font-bold">Leadership Gain</p>
                          <p className="text-sm font-black text-chart-5">+{selectedJob.leadershipGain} points</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedJob.req !== "none" && (
                    <div className="p-2 rounded bg-secondary/50 border border-border/40">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Requirement</p>
                      <p className="text-sm font-bold">
                        {selectedJob.req.charAt(0).toUpperCase() + selectedJob.req.slice(1)}: {selectedJob.val}+
                      </p>
                      <p className={cn(
                        "text-[10px] mt-1",
                        meetsRequirement(selectedJob) ? "text-primary" : "text-destructive"
                      )}>
                        Your {selectedJob.req}: {character[selectedJob.req as keyof typeof character]}
                        {meetsRequirement(selectedJob) ? " (Qualified)" : " (Not qualified)"}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full font-black uppercase tracking-widest"
                    disabled={isLoading || !canWork(selectedJob)}
                    onClick={() => onWork(selectedJob.id)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Work Shift
                  </Button>

                  {!canWork(selectedJob) && (
                    <p className="text-[10px] text-destructive text-center">
                      {!meetsRequirement(selectedJob)
                        ? `Need ${selectedJob.req} ${selectedJob.val}+ to qualify`
                        : `Need ${selectedJob.energy} energy to work`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a job from the listings to view details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
