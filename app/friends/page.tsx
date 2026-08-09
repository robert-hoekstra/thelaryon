import type { Metadata } from "next"
import Link from "next/link"

import { AddFriendForm } from "@/components/friends/add-friend-form"
import { FriendshipList } from "@/components/friends/friendship-list"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { listFriendships } from "@/lib/friends/service"
import { getTranslator } from "@/lib/i18n/get-locale"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t("friends.title") }
}

export const dynamic = "force-dynamic"

export default async function FriendsPage() {
  const { data: session } = await auth.getSession()
  if (!session?.user) return null

  const t = await getTranslator()
  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const friendships = await listFriendships(userId)
  const incomingCount = friendships.filter(
    (item) => item.status === "pending" && item.direction === "incoming",
  ).length

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("friends.title")}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink/60">
          {t("friends.description")}
        </p>
      </div>

      {incomingCount > 0 ? (
        <div className="rounded-2xl border border-mana-blue/25 bg-mana-blue/10 px-4 py-3 text-sm font-medium text-ink ring-1 ring-mana-blue/15">
          {t("friends.incomingBanner", { count: incomingCount })}
        </div>
      ) : null}

      <FriendshipList friendships={friendships} />
      <AddFriendForm />

      <p className="text-sm text-ink/50">
        <Link href="/collection" className="font-medium text-mana-blue">
          {t("profile.toCollection")}
        </Link>
      </p>
    </div>
  )
}
