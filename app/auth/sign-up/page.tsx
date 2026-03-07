"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { SkillTreePreview, MiniLeaderboard, StoryPreview } from "@/components/landing/game-demo"
import { Logo } from "@/components/logo"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/game/onboarding`,
        },
      })
      if (error) throw error

      if (data.session) {
        router.push("/game/onboarding")
      } else {
        router.push("/auth/sign-up-success")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative z-10 flex min-h-svh w-full">
      {/* Left side -- Game previews (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 flex-col gap-4 p-6 border-r border-border bg-card/30 overflow-y-auto max-h-svh">
        <div className="space-y-1 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">What awaits you</p>
          <h3 className="text-lg font-bold font-serif text-foreground">Build Your Ministry</h3>
        </div>
        <StoryPreview />
        <SkillTreePreview />
        <MiniLeaderboard />
        <div className="text-center pt-2">
          <Link href="/auth/login" className="text-xs font-bold text-primary flex items-center justify-center gap-1 hover:underline">
            Already have an account? Sign in <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Right side -- Sign up form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">Start Your Ministry</CardTitle>
                <CardDescription>Create an account to begin your journey</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="minister@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="repeat-password">Confirm Password</Label>
                      <Input id="repeat-password" type="password" required value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="btn-glow w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {"Already have an account? "}
                    <Link href="/auth/login" className="text-primary underline underline-offset-4">
                      Sign in
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
