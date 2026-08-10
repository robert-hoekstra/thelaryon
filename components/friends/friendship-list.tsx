"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"
import {
  acceptFriendRequestAction,
  declineFriendRequestAction,
  removeFriendAction,
} from "@/lib/friends/actions"
import type { FriendshipView } from "@/types/friends"

type FriendshipListProps = {
  friendships: FriendshipView[]
}

export function FriendshipList({ friendships }: FriendshipListProps) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const incoming = friendships.filter(
    (item) => item.status === "pending" && item.direction === "incoming",
  )
  const outgoing = friendships.filter(
    (item) => item.status === "pending" && item.direction === "outgoing",
  )
  const accepted = friendships.filter((item) => item.status === "accepted")

  function runAction(action: () => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      await action()
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/45">
          {t("friends.pendingIncoming")}
          {incoming.length > 0 ? ` (${incoming.length})` : ""}
        </h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("friends.emptyIncoming")}</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-accent/25 bg-surface-elevated p-4 ring-1 ring-accent/15 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink">{item.friend.name}</p>
                  <p className="text-sm text-ink-soft">{item.friend.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      runAction(() => acceptFriendRequestAction(item.id))
                    }
                    className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/85 disabled:opacity-60"
                  >
                    {t("friends.accept")}
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      runAction(() => declineFriendRequestAction(item.id))
                    }
                    className="rounded-full border border-ink/20 bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-surface-elevated disabled:opacity-60"
                  >
                    {t("friends.decline")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/45">
          {t("friends.accepted")}
        </h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("friends.emptyFriends")}</p>
        ) : (
          <ul className="space-y-2">
            {accepted.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl bg-surface-elevated p-4 ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink">{item.friend.name}</p>
                  <p className="text-sm text-ink-soft">{item.friend.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/friends/${item.friend.id}/compare`}
                    className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/85"
                  >
                    {t("friends.compare")}
                  </Link>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => runAction(() => removeFriendAction(item.id))}
                    className="rounded-full border border-ink/20 bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-surface-elevated disabled:opacity-60"
                  >
                    {t("friends.remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/45">
          {t("friends.pendingOutgoing")}
        </h2>
        {outgoing.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("friends.emptyOutgoing")}</p>
        ) : (
          <ul className="space-y-2">
            {outgoing.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl bg-surface-elevated p-4 ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink">{item.friend.name}</p>
                  <p className="text-sm text-ink-soft">{item.friend.email}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-gold">
                    {t("friends.pendingLabel")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(() => removeFriendAction(item.id))}
                  className="rounded-full border border-ink/20 bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-surface-elevated disabled:opacity-60"
                >
                  {t("friends.remove")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
