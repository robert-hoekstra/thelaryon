import "server-only"

import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/server"

/**
 * Hard page guard: redirect anonymous users to sign-in.
 * Proxy handles the happy path; this covers missed matcher entries / stale deploys.
 */
export async function requirePageSession(loginPath = "/auth/sign-in") {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    redirect(loginPath)
  }

  return session
}
