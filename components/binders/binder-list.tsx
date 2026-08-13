"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { SetProgressBar } from "@/components/sets/set-progress-bar"
import { useTranslations } from "@/components/i18n/locale-provider"
import { toast } from "@/components/ui/toast"
import { deleteBinderAction } from "@/lib/binders/actions"
import { totalSlotCapacity } from "@/lib/binders/layout"
import type { BinderSummary } from "@/types/binder"

type BinderListProps = {
  binders: BinderSummary[]
}

function strategyLabel(
  strategy: BinderSummary["fillStrategy"],
  t: ReturnType<typeof useTranslations>,
) {
  switch (strategy) {
    case "set_order":
      return t("binders.strategySetOrder")
    case "collection_only":
      return t("binders.strategyCollection")
    default:
      return t("binders.strategyManual")
  }
}

export function BinderList({ binders }: BinderListProps) {
  const t = useTranslations()

  if (binders.length === 0) {
    return (
      <div className="rounded-2xl bg-surface/80 px-5 py-10 text-center ring-1 ring-ink/10">
        <h2 className="text-base font-semibold text-ink">
          {t("binders.emptyTitle")}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {t("binders.emptyDescription")}
        </p>
        <div className="mt-5">
          <Link
            href="/binders/new"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85"
          >
            {t("binders.create")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {binders.map((binder) => (
        <BinderListItem key={binder.id} binder={binder} />
      ))}
    </ul>
  )
}

function BinderListItem({ binder }: { binder: BinderSummary }) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const capacity = totalSlotCapacity(binder)
  const hasExpected = binder.progress.expectedCount > 0

  function handleDelete() {
    if (!window.confirm(t("binders.confirmDelete"))) return
    startTransition(async () => {
      const result = await deleteBinderAction(binder.id)
      toast.fromActionResult(result)
      if (result.ok) {
        router.refresh()
      }
    })
  }

  return (
    <li className="flex flex-col rounded-2xl bg-surface-elevated/90 p-5 ring-1 ring-ink/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="truncate font-[family-name:var(--font-display)] text-xl text-ink">
            {binder.name}
          </h2>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
            {strategyLabel(binder.fillStrategy, t)}
            {binder.volumeCount && binder.volumeIndex
              ? ` · ${t("binders.volumeBadge", {
                  index: binder.volumeIndex,
                  count: binder.volumeCount,
                })}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-mana-red ring-1 ring-mana-red/30 transition hover:bg-mana-red/10 disabled:opacity-60"
        >
          {isPending ? t("binders.deleting") : t("binders.delete")}
        </button>
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        {t("binders.layout", {
          pages: binder.pageCount,
          rows: binder.rowsPerPage,
          cols: binder.columnsPerPage,
          sides: binder.doubleSided
            ? t("binders.layoutDouble")
            : t("binders.layoutSingle"),
        })}
      </p>
      <p className="text-sm text-ink-soft">
        {t("binders.slots", { count: capacity })}
      </p>

      {binder.setName ? (
        <p className="mt-1 text-sm text-ink">
          {t("binders.setLabel", { name: binder.setName })}
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-ink">
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
          <p className="text-sm text-ink-soft">
            {t("binders.progressPercent", {
              percent: binder.progress.completionPercentage.toFixed(1),
            })}
          </p>
        </div>
        <SetProgressBar percentage={binder.progress.completionPercentage} />
        {hasExpected && binder.progress.missingCount > 0 ? (
          <p className="text-xs text-ink-soft">
            {t("binders.missing", { count: binder.progress.missingCount })}
          </p>
        ) : null}
      </div>

      <Link
        href={`/binders/${binder.id}`}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85"
      >
        {t("binders.open")}
      </Link>
    </li>
  )
}
