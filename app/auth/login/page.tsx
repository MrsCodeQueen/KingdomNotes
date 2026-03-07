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
import { LiveCharacterPreview, StoryPreview, LiveActivityFeed } from "@/components/landing/game-demo"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/game")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative z-10 flex min-h-svh w-full">
      {/* Left side -- Login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to continue your journey</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="minister@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/auth/forgot-password" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary">
                          Forgot password?
                        </Link>
                      </div>
                      <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="btn-glow w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {"Don't have an account? "}
                    <Link href="/auth/sign-up" className="text-primary underline underline-offset-4">
                      Sign up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right side -- Live game previews (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 flex-col gap-4 p-6 border-l border-border bg-card/30 overflow-y-auto max-h-svh">
        <div className="space-y-1 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">While you were away...</p>
          <h3 className="text-lg font-bold font-serif text-foreground">The World Kept Moving</h3>
        </div>
        <LiveCharacterPreview />
        <StoryPreview />
        <LiveActivityFeed />
        <div className="text-center pt-2">
          <Link href="/auth/sign-up" className="text-xs font-bold text-primary flex items-center justify-center gap-1 hover:underline">
            New here? Create an account <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
