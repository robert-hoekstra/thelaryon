"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { CardImage } from "@/components/cards/card-image"
import { useTranslations } from "@/components/i18n/locale-provider"
import { toast } from "@/components/ui/toast"
import { assignBinderSlotAction } from "@/lib/binders/actions"
import {
  fromDisplayPageNumber,
  toDisplayPageNumber,
} from "@/lib/binders/layout"
import { cn } from "@/lib/utils"
import type { BinderDetail, BinderSlotView } from "@/types/binder"
import type { CollectionItem } from "@/types/collection"

type BinderViewerProps = {
  binder: BinderDetail
  collectionItems: CollectionItem[]
}

export function BinderViewer({ binder, collectionItems }: BinderViewerProps) {
  const t = useTranslations()
  const [displayPage, setDisplayPage] = useState(1)
  const [activeSlot, setActiveSlot] = useState<BinderSlotView | null>(null)

  const totalDisplayPages = binder.displayPageCount

  // Facing spread on desktop: odd page on the left when possible.
  const leftPage =
    totalDisplayPages <= 1
      ? 1
      : displayPage % 2 === 0
        ? displayPage - 1
        : displayPage
  const rightPage =
    leftPage < totalDisplayPages ? leftPage + 1 : null

  const mobilePage = displayPage

  const slotsByKey = useMemo(() => {
    const map = new Map<string, BinderSlotView>()
    for (const slot of binder.slots) {
      map.set(`${slot.pageNumber}:${slot.side}:${slot.position}`, slot)
    }
    return map
  }, [binder.slots])

  function slotsForDisplayPage(page: number): BinderSlotView[] {
    const { pageNumber, side } = fromDisplayPageNumber(
      page,
      binder.doubleSided,
    )
    const result: BinderSlotView[] = []
    for (let position = 0; position < binder.slotsPerSide; position++) {
      const slot = slotsByKey.get(`${pageNumber}:${side}:${position}`)
      if (slot) result.push(slot)
    }
    return result
  }

  function goPrev() {
    setDisplayPage((page) => Math.max(1, page - 1))
  }

  function goNext() {
    setDisplayPage((page) => Math.min(totalDisplayPages, page + 1))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink lg:hidden">
          {t("binderDetail.page", { page: mobilePage })}
        </p>
        <p className="hidden text-sm font-medium text-ink lg:block">
          {rightPage
            ? t("binderDetail.spread", { left: leftPage, right: rightPage })
            : t("binderDetail.page", { page: leftPage })}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={displayPage <= 1}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-ink/15 transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("binderDetail.prev")}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={displayPage >= totalDisplayPages}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-ink/15 transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("binderDetail.next")}
          </button>
        </div>
      </div>

      {/* Mobile: one page */}
      <div className="lg:hidden">
        <BinderPage
          label={t("binderDetail.page", { page: mobilePage })}
          rows={binder.rowsPerPage}
          columns={binder.columnsPerPage}
          slots={slotsForDisplayPage(mobilePage)}
          onSelectSlot={setActiveSlot}
        />
      </div>

      {/* Desktop: facing pages */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-2">
        <BinderPage
          label={t("binderDetail.page", { page: leftPage })}
          rows={binder.rowsPerPage}
          columns={binder.columnsPerPage}
          slots={slotsForDisplayPage(leftPage)}
          onSelectSlot={setActiveSlot}
        />
        {rightPage ? (
          <BinderPage
            label={t("binderDetail.page", { page: rightPage })}
            rows={binder.rowsPerPage}
            columns={binder.columnsPerPage}
            slots={slotsForDisplayPage(rightPage)}
            onSelectSlot={setActiveSlot}
          />
        ) : (
          <div aria-hidden className="rounded-2xl bg-transparent" />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <span className="text-ink-soft">{t("binderDetail.pageJump")}</span>
        <input
          type="number"
          min={1}
          max={totalDisplayPages}
          value={displayPage}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10)
            if (Number.isFinite(next)) {
              setDisplayPage(Math.min(totalDisplayPages, Math.max(1, next)))
            }
          }}
          className="w-20 rounded-xl border border-ink/20 bg-surface px-2 py-1.5 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
        <span className="text-ink-soft">/ {totalDisplayPages}</span>
      </label>

      {activeSlot ? (
        <AssignSlotDialog
          binderId={binder.id}
          doubleSided={binder.doubleSided}
          slot={activeSlot}
          collectionItems={collectionItems}
          onClose={() => setActiveSlot(null)}
        />
      ) : null}
    </div>
  )
}

function BinderPage({
  label,
  rows,
  columns,
  slots,
  onSelectSlot,
  className,
}: {
  label: string
  rows: number
  columns: number
  slots: BinderSlotView[]
  onSelectSlot: (slot: BinderSlotView) => void
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-[#1a1520]/90 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-ink/20",
        className,
      )}
    >
      <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </h2>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {slots.map((slot) => (
          <BinderSlotCell
            key={slot.id}
            slot={slot}
            onClick={() => onSelectSlot(slot)}
          />
        ))}
      </div>
    </section>
  )
}

function BinderSlotCell({
  slot,
  onClick,
}: {
  slot: BinderSlotView
  onClick: () => void
}) {
  const t = useTranslations()
  const hasExpected = slot.expectedScryfallId != null
  const isMissing = hasExpected && !slot.collected
  const isEmpty = !hasExpected && !slot.collectionItemId

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative aspect-[5/7] overflow-hidden rounded-md bg-surface/40 ring-1 ring-ink/20 transition hover:ring-accent/50",
        isMissing && "ring-mana-red/40",
        slot.collected && "ring-mana-green/40",
      )}
    >
      {slot.displayImage ? (
        <CardImage
          src={slot.displayImage}
          alt={slot.displayName ?? ""}
          fill
          sizes="120px"
          className={cn(
            "object-cover",
            isMissing && "grayscale opacity-45",
          )}
        />
      ) : (
        <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-ink-soft">
          {isEmpty ? t("binderDetail.empty") : "#?"}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1.5 pt-4">
        {slot.displayCollectorNumber ? (
          <p className="truncate text-[10px] font-semibold text-white">
            #{slot.displayCollectorNumber}
          </p>
        ) : null}
        <p
          className={cn(
            "truncate text-[10px] font-medium",
            isMissing
              ? "text-mana-red"
              : slot.collected
                ? "text-mana-green"
                : "text-white/80",
          )}
        >
          {isEmpty
            ? t("binderDetail.empty")
            : isMissing
              ? t("binderDetail.missing")
              : t("binderDetail.collected")}
        </p>
      </div>
    </button>
  )
}

function AssignSlotDialog({
  binderId,
  doubleSided,
  slot,
  collectionItems,
  onClose,
}: {
  binderId: string
  doubleSided: boolean
  slot: BinderSlotView
  collectionItems: CollectionItem[]
  onClose: () => void
}) {
  const t = useTranslations()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isPending, startTransition] = useTransition()

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? collectionItems.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.collectorNumber.toLowerCase().includes(q) ||
            item.setCode.toLowerCase().includes(q),
        )
      : collectionItems

    // Prefer exact expected printing first
    return [...filtered].sort((a, b) => {
      const aMatch = a.scryfallId === slot.expectedScryfallId ? 0 : 1
      const bMatch = b.scryfallId === slot.expectedScryfallId ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      return a.name.localeCompare(b.name)
    }).slice(0, 40)
  }, [collectionItems, query, slot.expectedScryfallId])

  function assign(collectionItemId: string | null) {
    startTransition(async () => {
      const result = await assignBinderSlotAction(slot.id, binderId, {
        collectionItemId,
      })
      toast.fromActionResult(result)
      if (!result.ok) return
      onClose()
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl bg-surface-elevated shadow-xl ring-1 ring-ink/20"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-ink">
              {slot.displayName ?? t("binderDetail.assign")}
            </h3>
            <p className="text-xs text-ink-soft">
              {t("binderDetail.page", {
                page: toDisplayPageNumber(
                  slot.pageNumber,
                  slot.side,
                  doubleSided,
                ),
              })}
              {slot.displayCollectorNumber
                ? ` · #${slot.displayCollectorNumber}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-surface"
          >
            {t("binderDetail.close")}
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto p-4">
          {slot.displayScryfallId ? (
            <Link
              href={`/cards/${slot.displayScryfallId}`}
              className="inline-flex text-sm font-medium text-accent hover:underline"
            >
              {t("binderDetail.viewCard")}
            </Link>
          ) : null}

          {slot.collectionItemId ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => assign(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-ink/15 hover:bg-surface disabled:opacity-60"
              >
                {t("binderDetail.clear")}
              </button>
            </div>
          ) : null}

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-ink">
              {t("binderDetail.pickCard")}
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("binderDetail.searchCollection")}
              className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
            />
          </label>

          {matches.length === 0 ? (
            <p className="text-sm text-ink-soft">
              {t("binderDetail.noCollectionMatches")}
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {matches.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => assign(item.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-surface disabled:opacity-60"
                  >
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-surface">
                      {item.image.small || item.image.normal ? (
                        <CardImage
                          src={item.image.small ?? item.image.normal!}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {item.name}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {item.setCode.toUpperCase()} · #{item.collectorNumber}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

        </div>
      </div>
    </div>
  )
}
