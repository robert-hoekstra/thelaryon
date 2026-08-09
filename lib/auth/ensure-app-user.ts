import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

type AuthUser = {
  id: string
  email: string
  name: string
}

/**
 * Keep public.users in sync with Neon Auth users so collection FKs work.
 */
export async function ensureAppUser(user: AuthUser) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (existing[0]) {
    await db
      .update(users)
      .set({
        email: user.email,
        name: user.name || user.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return user.id
  }

  await db.insert(users).values({
    id: user.id,
    email: user.email,
    name: user.name || user.email,
  })

  return user.id
}
