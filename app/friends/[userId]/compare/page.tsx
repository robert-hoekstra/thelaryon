import type { Metadata } from "next"
import Link from "next/link"

import { CompareCardList } from "@/components/friends/compare-card-list"
import { CompareSetFilter } from "@/components/friends/compare-set-filter"
import { TradePlanView } from "@/components/trades/trade-plan-view"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { compareCollections } from "@/lib/friends/service"
import { getLocale, getTranslator } from "@/lib/i18n/get-locale"
import { compareSetCollections } from "@/lib/sets/compare"
import { buildTradePlan } from "@/lib/trades/trade-plan"

type ComparePageProps = {
  params: Promise<{
    userId: string
  }>
  searchParams: Promise<{
    set?: string
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

export default async function FriendComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const { userId: friendUserId } = await params
  const { set: setCode } = await searchParams
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
        <p className="text-sm text-ink-soft">{t("friends.compareForbidden")}</p>
        <Link
          href="/friends"
          className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          {t("friends.compareBack")}
        </Link>
      </div>
    )
  }

  const setOptions = Array.from(
    new Map(
      [...comparison.missingForMe, ...comparison.missingForThem].map((card) => [
        card.setCode.toLowerCase(),
        { code: card.setCode, name: card.setName },
      ]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name))

  const normalizedSet = setCode?.trim().toLowerCase() || null

  // Prefer full set comparison (eligible printings + Scryfall EUR) when a set is selected
  const setComparison =
    normalizedSet != null
      ? await compareSetCollections(myUserId, friendUserId, normalizedSet)
      : null

  const tradePlan = setComparison
    ? setComparison.tradePlan
    : buildTradePlan({
        theyOffer: comparison.theirExtrasINeed.map((card) => ({
          scryfallId: card.scryfallId,
          name: card.name,
          collectorNumber: card.collectorNumber,
          setCode: card.setCode,
          image: card.image,
          extras: card.friendExtras,
          marketPrice: card.currentPrice,
        })),
        youOffer: comparison.myExtrasTheyNeed.map((card) => ({
          scryfallId: card.scryfallId,
          name: card.name,
          collectorNumber: card.collectorNumber,
          setCode: card.setCode,
          image: card.image,
          extras: Math.max(0, card.myQuantity - 1),
          marketPrice: card.currentPrice,
        })),
      })

  const filteredExtras = normalizedSet
    ? comparison.theirExtrasINeed.filter(
        (card) => card.setCode.toLowerCase() === normalizedSet,
      )
    : comparison.theirExtrasINeed

  const filteredMissingForMe = normalizedSet
    ? comparison.missingForMe.filter(
        (card) => card.setCode.toLowerCase() === normalizedSet,
      )
    : comparison.missingForMe

  const filteredMissingForThem = normalizedSet
    ? comparison.missingForThem.filter(
        (card) => card.setCode.toLowerCase() === normalizedSet,
      )
    : comparison.missingForThem

  const filteredMyExtras = normalizedSet
    ? comparison.myExtrasTheyNeed.filter(
        (card) => card.setCode.toLowerCase() === normalizedSet,
      )
    : comparison.myExtrasTheyNeed

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/friends"
          className="inline-flex text-sm font-medium text-accent hover:text-accent/80"
        >
          {t("friends.compareBack")}
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("friends.compareTitle", { name: comparison.friend.name })}
        </h1>
        <p className="text-sm text-ink-soft">{comparison.friend.email}</p>
      </div>

      <CompareSetFilter
        friendUserId={friendUserId}
        sets={setOptions}
        currentSetCode={normalizedSet}
      />

      <TradePlanView
        plan={tradePlan}
        friendName={comparison.friend.name}
        locale={locale}
        setName={setComparison?.set.name}
      />

      {setComparison ? (
        <p className="text-sm text-ink-soft">
          <Link
            href={`/sets/${setComparison.set.code}?compare=${friendUserId}`}
            className="font-medium text-accent hover:underline"
          >
            {t("friends.openSetCompare", { set: setComparison.set.name })}
          </Link>
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t("friends.statExtras"),
            value: String(
              setComparison
                ? setComparison.potentialTrades.iNeed.length
                : filteredExtras.length,
            ),
            accent: "border-l-mana-green",
          },
          {
            label: t("friends.statMyExtras"),
            value: String(
              setComparison
                ? setComparison.potentialTrades.theyNeed.length
                : filteredMyExtras.length,
            ),
            accent: "border-l-gold",
          },
          {
            label: t("friends.statMissingForMe"),
            value: String(
              setComparison
                ? setComparison.summary.onlyFriend
                : filteredMissingForMe.length,
            ),
            accent: "border-l-mana-blue",
          },
          {
            label: t("friends.statMissingForThem"),
            value: String(
              setComparison
                ? setComparison.summary.onlyMe
                : filteredMissingForThem.length,
            ),
            accent: "border-l-mana-red",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border-l-4 bg-surface-elevated/90 px-4 py-4 ring-1 ring-ink/10 ${stat.accent}`}
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
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
        cards={
          setComparison
            ? setComparison.potentialTrades.iNeed.map((card) => ({
                scryfallId: card.scryfallId,
                name: card.name,
                setCode: setComparison.set.code,
                setName: setComparison.set.name,
                collectorNumber: card.collectorNumber,
                image: card.image,
                myQuantity: card.myQuantity,
                friendQuantity: card.friendQuantity,
                friendExtras: Math.max(0, card.friendQuantity - 1),
                currentPrice: card.marketPrice,
              }))
            : filteredExtras
        }
        locale={locale}
        t={t}
        emphasizeExtras
      />

      <CompareCardList
        title={t("friends.sectionMyExtras")}
        hint={t("friends.sectionMyExtrasHint")}
        emptyLabel={t("friends.emptySection")}
        cards={
          setComparison
            ? setComparison.potentialTrades.theyNeed.map((card) => ({
                scryfallId: card.scryfallId,
                name: card.name,
                setCode: setComparison.set.code,
                setName: setComparison.set.name,
                collectorNumber: card.collectorNumber,
                image: card.image,
                myQuantity: card.myQuantity,
                friendQuantity: card.friendQuantity,
                friendExtras: Math.max(0, card.myQuantity - 1),
                currentPrice: card.marketPrice,
              }))
            : filteredMyExtras
        }
        locale={locale}
        t={t}
        emphasizeExtras
      />

      <CompareCardList
        title={t("friends.sectionMissingForMe")}
        emptyLabel={t("friends.emptySection")}
        cards={filteredMissingForMe}
        locale={locale}
        t={t}
      />

      <CompareCardList
        title={t("friends.sectionMissingForThem")}
        emptyLabel={t("friends.emptySection")}
        cards={filteredMissingForThem}
        locale={locale}
        t={t}
      />
    </div>
  )
}
