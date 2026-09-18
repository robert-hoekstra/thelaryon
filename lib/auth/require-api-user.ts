import "server-only"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"

/**
 * Resolve the signed-in app user for API routes.
 * Returns null when the request is unauthenticated.
 */
export async function requireApiUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    return null
  }

  return ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })
}
