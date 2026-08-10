import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SetCardGrid } from "@/components/sets/set-card-grid"
import { SetCompareSelector } from "@/components/sets/set-compare-selector"
import { SetComparisonView } from "@/components/sets/set-comparison-view"
import { SetProgressBar } from "@/components/sets/set-progress-bar"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { listFriendships } from "@/lib/friends/service"
import { createTranslator } from "@/lib/i18n/dictionaries"
import { getLocale, getTranslator } from "@/lib/i18n/get-locale"
import { ScryfallApiError } from "@/lib/scryfall/client"
import { compareSetCollections } from "@/lib/sets/compare"
import { getSetCompletionDetail } from "@/lib/sets/service"

type SetDetailPageProps = {
  params: Promise<{
    setCode: string
  }>
  searchParams: Promise<{
    compare?: string
  }>
}

export async function generateMetadata({
  params,
}: SetDetailPageProps): Promise<Metadata> {
  const t = await getTranslator()
  const { setCode } = await params

  try {
    const { set } = await getSetCompletionDetail(setCode, null)
    return { title: t("setDetail.title", { name: set.name }) }
  } catch {
    return { title: t("sets.title") }
  }
}

export const dynamic = "force-dynamic"

export default async function SetDetailPage({
  params,
  searchParams,
}: SetDetailPageProps) {
  const { setCode } = await params
  const { compare: compareFriendId } = await searchParams
  const { data: session } = await auth.getSession()
  const locale = await getLocale()
  const t = createTranslator(locale)

  let userId: string | null = null
  if (session?.user) {
    userId = await ensureAppUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
  }

  let completion
  try {
    completion = await getSetCompletionDetail(setCode, userId)
  } catch (error) {
    if (error instanceof ScryfallApiError && error.status === 404) {
      notFound()
    }
    throw error
  }

  const { set, cards, totalEligibleCards, ownedCount, completionPercentage } =
    completion

  // Get accepted friends for comparison selector
  let friends: { id: string; name: string }[] = []
  if (userId) {
    const friendships = await listFriendships(userId)
    friends = friendships
      .filter((f) => f.status === "accepted")
      .map((f) => ({ id: f.friend.id, name: f.friend.name }))
  }

  // Load comparison data if a friend is selected
  let comparison = null
  if (userId && compareFriendId) {
    comparison = await compareSetCollections(userId, compareFriendId, setCode)
  }

  // If comparing, show comparison view
  if (comparison) {
    return (
      <SetComparisonView
        comparison={comparison}
        setCode={setCode}
        friends={friends}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/sets"
          className="inline-flex text-sm font-medium text-accent hover:text-accent/80"
        >
          {t("setDetail.backToSets")}
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {set.iconSvgUri && (
              <img
                src={set.iconSvgUri}
                alt=""
                className="h-12 w-12 opacity-80 invert"
              />
            )}
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
                {set.name}
              </h1>
              <p className="text-sm text-ink-soft">{set.code}</p>
            </div>
          </div>

          {userId && friends.length > 0 && (
            <SetCompareSelector
              setCode={setCode}
              friends={friends}
              currentCompareId={compareFriendId}
            />
          )}
        </div>
      </div>

      {userId && (
        <div className="rounded-2xl bg-surface-elevated/90 p-5 ring-1 ring-ink/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-ink-soft">
                {t("setDetail.completion", {
                  owned: ownedCount,
                  total: totalEligibleCards,
                })}
              </p>
              <p className="text-2xl font-bold text-ink">
                {t("setDetail.completionPercent", {
                  percent: completionPercentage.toFixed(1),
                })}
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
              <SetProgressBar percentage={completionPercentage} size="md" />
            </div>
          </div>
        </div>
      )}

      {!userId && (
        <div className="rounded-2xl border border-accent/25 bg-accent/15 px-4 py-3 text-sm font-medium text-ink ring-1 ring-accent/20">
          <Link href="/auth/sign-in" className="text-accent hover:underline">
            {t("card.signIn")}
          </Link>{" "}
          to track your completion and compare with friends.
        </div>
      )}

      <SetCardGrid
        cards={cards}
        isAuthenticated={!!userId}
      />
    </div>
  )
}
