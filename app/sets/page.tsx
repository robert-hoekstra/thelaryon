import type { Metadata } from "next"

import { SetList } from "@/components/sets/set-list"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { requirePageSession } from "@/lib/auth/require-page-session"
import { createTranslator } from "@/lib/i18n/dictionaries"
import { getLocale, getTranslator } from "@/lib/i18n/get-locale"
import { getSets } from "@/lib/scryfall/client"
import { filterRelevantSets } from "@/lib/sets/eligibility"
import {
  getSetsCompletionSummary,
} from "@/lib/sets/service"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return {
    title: t("sets.title"),
    robots: { index: false, follow: false },
  }
}

export const dynamic = "force-dynamic"

export default async function SetsPage() {
  const session = await requirePageSession()
  const locale = await getLocale()
  const t = createTranslator(locale)

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const allSets = await getSets()
  const relevantSets = filterRelevantSets(allSets)

  // Sort by release date (newest first)
  const sortedSets = relevantSets.sort((a, b) => {
    if (!a.releasedAt && !b.releasedAt) return 0
    if (!a.releasedAt) return 1
    if (!b.releasedAt) return -1
    return new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()
  })

  let completionSummary: Map<
    string,
    { owned: number; total: number; percentage: number }
  > = new Map()
  completionSummary = await getSetsCompletionSummary(userId)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("sets.title")}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          {t("sets.description")}
        </p>
      </div>

      <SetList
        sets={sortedSets}
        completionSummary={Object.fromEntries(completionSummary)}
        isAuthenticated
        locale={locale}
      />
    </div>
  )
}
