"use client"

import { signIn, signOut, useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled>
        Connecting...
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        {session.user?.email ? (
          <span className="text-sm text-muted-foreground">
            {session.user.email}
          </span>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      onClick={() => signIn("google", { callbackUrl: "/" })}
    >
      Sign in with Google
    </Button>
  )
}
