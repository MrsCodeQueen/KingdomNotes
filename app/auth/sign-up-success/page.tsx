"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { useState } from "react"

export default function SignUpSuccessPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  const handleResend = async () => {
    if (!email) {
      setResendError("Please enter the email you signed up with.")
      return
    }
    setResending(true)
    setResendError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/game/onboarding`,
      },
    })
    setResending(false)
    if (error) {
      setResendError(error.message)
    } else {
      setResent(true)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>
          <Card className="w-full">
            <CardHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
              <CardDescription className="text-center">Your journey is about to begin</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {"We've sent a confirmation link to your email. Click the link to verify your account and begin creating your ministry character."}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {"Didn't receive the email? Check your spam folder or resend below."}
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResend}
                  disabled={resending || resent}
                >
                  {resending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : resent ? (
                    "Email Resent!"
                  ) : (
                    "Resend Confirmation Email"
                  )}
                </Button>
                {resendError && <p className="text-sm text-destructive">{resendError}</p>}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <Link href="/auth/login" className="text-primary underline underline-offset-4">
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
