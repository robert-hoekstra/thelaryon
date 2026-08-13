import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BinderViewer } from "@/components/binders/binder-viewer"
import { ContinueBinderButton } from "@/components/binders/continue-binder-button"
import { SetProgressBar } from "@/components/sets/set-progress-bar"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { getBinderDetail } from "@/lib/binders/service"
import { listCollectionItems } from "@/lib/collection/service"
import { getTranslator } from "@/lib/i18n/get-locale"

type BinderDetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: BinderDetailPageProps): Promise<Metadata> {
  const t = await getTranslator()
  const { id } = await params
  const { data: session } = await auth.getSession()
  if (!session?.user) {
    return { title: t("binders.title") }
  }

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })
  const binder = await getBinderDetail(id, userId)
  return { title: binder?.name ?? t("binders.title") }
}

export const dynamic = "force-dynamic"

export default async function BinderDetailPage({
  params,
}: BinderDetailPageProps) {
  const { id } = await params
  const { data: session } = await auth.getSession()
  if (!session?.user) return null

  const t = await getTranslator()
  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const [binder, collectionItems] = await Promise.all([
    getBinderDetail(id, userId),
    listCollectionItems(userId),
  ])

  if (!binder) {
    notFound()
  }

  const hasExpected = binder.progress.expectedCount > 0

  const sortLabel = (() => {
    switch (binder.sortOrder) {
      case "typeline":
        return t("binders.sort.typeline")
      case "color":
        return t("binders.sort.color")
      case "rarity":
        return t("binders.sort.rarity")
      case "cmc":
        return t("binders.sort.cmc")
      case "name":
        return t("binders.sort.name")
      default:
        return t("binders.sort.collectorNumber")
    }
  })()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/binders"
          className="inline-flex text-sm font-medium text-accent hover:text-accent/80"
        >
          {t("binderDetail.back")}
        </Link>

        <div className="space-y-1">
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
            {binder.name}
          </h1>
          <p className="text-sm text-ink-soft">
            {t("binders.layout", {
              pages: binder.pageCount,
              rows: binder.rowsPerPage,
              cols: binder.columnsPerPage,
              sides: binder.doubleSided
                ? t("binders.layoutDouble")
                : t("binders.layoutSingle"),
            })}
            {binder.setName
              ? ` · ${t("binders.setLabel", { name: binder.setName })}`
              : ""}
            {` · ${sortLabel}`}
          </p>
        </div>
      </div>

      {binder.seriesSiblings.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {binder.seriesSiblings.map((sibling) => (
            <Link
              key={sibling.id}
              href={`/binders/${sibling.id}`}
              className={
                sibling.id === binder.id
                  ? "rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full bg-surface-elevated px-4 py-2 text-sm font-medium text-ink ring-1 ring-ink/10 hover:bg-surface"
              }
            >
              {t("binders.volumeBadge", {
                index: sibling.volumeIndex,
                count: binder.volumeCount ?? binder.seriesSiblings.length,
              })}
            </Link>
          ))}
        </div>
      ) : null}

      {binder.fillStrategy === "set_order" && binder.setCode ? (
        <ContinueBinderButton binderId={binder.id} />
      ) : null}

      <div className="rounded-2xl bg-surface-elevated/90 p-5 ring-1 ring-ink/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-ink-soft">
              {hasExpected
                ? t("binders.progress", {
                    owned: binder.progress.collectedCount,
                    total: binder.progress.expectedCount,
                  })
                : t("binders.filled", {
                    owned: binder.progress.placedCount,
                    total: binder.progress.totalSlots,
                  })}
            </p>
            <p className="text-2xl font-bold text-ink">
              {t("binders.progressPercent", {
                percent: binder.progress.completionPercentage.toFixed(1),
              })}
            </p>
            {hasExpected && binder.progress.missingCount > 0 ? (
              <p className="mt-1 text-sm text-ink-soft">
                {t("binders.missing", {
                  count: binder.progress.missingCount,
                })}
              </p>
            ) : null}
          </div>
          <div className="w-full sm:max-w-xs">
            <SetProgressBar
              percentage={binder.progress.completionPercentage}
              size="md"
            />
          </div>
        </div>
      </div>

      <BinderViewer binder={binder} collectionItems={collectionItems} />
    </div>
  )
}
