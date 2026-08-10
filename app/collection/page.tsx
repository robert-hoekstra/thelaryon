import type { Metadata } from "next"
import Link from "next/link"

import { CollectionGrid } from "@/components/collection/collection-grid"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import {
  listCollectionItems,
  summarizeCollection,
} from "@/lib/collection/service"
import { createTranslator } from "@/lib/i18n/dictionaries"
import { getLocale, getTranslator } from "@/lib/i18n/get-locale"
import { formatEuroPrice } from "@/lib/pricing/price"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t("collection.title") }
}

export const dynamic = "force-dynamic"

export default async function CollectionPage() {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    return null
  }

  const locale = await getLocale()
  const t = createTranslator(locale)

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const items = await listCollectionItems(userId)
  const summary = summarizeCollection(items)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
            {t("collection.title")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            {t("collection.description")}
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85"
        >
          {t("collection.searchCards")}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t("collection.statCards"),
            value: String(summary.totalCards),
          },
          {
            label: t("collection.statUnique"),
            value: String(summary.uniqueCards),
          },
          {
            label: t("collection.statCollectionValue"),
            value: formatEuroPrice(
              summary.totalCards > 0 ? summary.collectionValue : null,
              locale,
            ),
          },
          {
            label: t("collection.statPurchaseValue"),
            value: formatEuroPrice(
              items.some((item) => item.purchasePrice != null)
                ? summary.purchaseValue
                : null,
              locale,
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-surface-elevated/90 px-4 py-4 ring-1 ring-ink/10"
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              {stat.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-surface/80 px-5 py-10 text-center ring-1 ring-ink/10">
          <h2 className="text-base font-semibold text-ink">
            {t("collection.emptyTitle")}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {t("collection.emptyDescription")}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85"
            >
              {t("collection.searchCards")}
            </Link>
          </div>
        </div>
      ) : (
        <CollectionGrid items={items} />
      )}
    </div>
  )
}
