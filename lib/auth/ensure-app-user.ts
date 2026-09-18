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
 * Only writes when the row is missing or email/name actually changed.
 */
export async function ensureAppUser(user: AuthUser) {
  const existing = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  const nextName = user.name || user.email
  const row = existing[0]

  if (row) {
    if (row.email !== user.email || row.name !== nextName) {
      await db
        .update(users)
        .set({
          email: user.email,
          name: nextName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
    }

    return user.id
  }

  await db.insert(users).values({
    id: user.id,
    email: user.email,
    name: nextName,
  })

  return user.id
}
