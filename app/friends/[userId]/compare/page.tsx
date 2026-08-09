import type { Metadata } from "next"
import Link from "next/link"

import { CompareCardList } from "@/components/friends/compare-card-list"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { compareCollections } from "@/lib/friends/service"
import { getLocale, getTranslator } from "@/lib/i18n/get-locale"

type ComparePageProps = {
  params: Promise<{
    userId: string
  }>
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const t = await getTranslator()
  const { userId } = await params
  return { title: t("friends.compareTitle", { name: userId.slice(0, 8) }) }
}

export const dynamic = "force-dynamic"

export default async function FriendComparePage({ params }: ComparePageProps) {
  const { userId: friendUserId } = await params
  const { data: session } = await auth.getSession()
  if (!session?.user) return null

  const locale = await getLocale()
  const t = await getTranslator()

  const myUserId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const comparison = await compareCollections(myUserId, friendUserId)

  if (!comparison) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("friends.title")}
        </h1>
        <p className="text-sm text-ink/60">{t("friends.compareForbidden")}</p>
        <Link
          href="/friends"
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          {t("friends.compareBack")}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/friends"
          className="inline-flex text-sm font-medium text-mana-blue hover:text-mana-blue/80"
        >
          {t("friends.compareBack")}
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("friends.compareTitle", { name: comparison.friend.name })}
        </h1>
        <p className="text-sm text-ink/55">{comparison.friend.email}</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: t("friends.statExtras"),
            value: String(comparison.summary.theirExtrasINeedCount),
            accent: "border-l-mana-green",
          },
          {
            label: t("friends.statMissingForMe"),
            value: String(comparison.summary.missingForMeCount),
            accent: "border-l-mana-blue",
          },
          {
            label: t("friends.statMissingForThem"),
            value: String(comparison.summary.missingForThemCount),
            accent: "border-l-mana-red",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border-l-4 bg-white/80 px-4 py-4 ring-1 ring-ink/8 ${stat.accent}`}
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
              {stat.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">{stat.value}</p>
          </div>
        ))}
      </section>

      <CompareCardList
        title={t("friends.sectionExtras")}
        hint={t("friends.sectionExtrasHint")}
        emptyLabel={t("friends.emptySection")}
        cards={comparison.theirExtrasINeed}
        locale={locale}
        t={t}
        emphasizeExtras
      />

      <CompareCardList
        title={t("friends.sectionMissingForMe")}
        emptyLabel={t("friends.emptySection")}
        cards={comparison.missingForMe}
        locale={locale}
        t={t}
      />

      <CompareCardList
        title={t("friends.sectionMissingForThem")}
        emptyLabel={t("friends.emptySection")}
        cards={comparison.missingForThem}
        locale={locale}
        t={t}
      />
    </div>
  )
}
