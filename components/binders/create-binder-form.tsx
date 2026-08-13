"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { useTranslations } from "@/components/i18n/locale-provider"
import { toast } from "@/components/ui/toast"
import { createBinderAction } from "@/lib/binders/actions"
import { totalSlotCapacity } from "@/lib/binders/layout"
import { cn } from "@/lib/utils"
import type { BinderFillStrategy, BinderSortOrder } from "@/types/binder"

type SetOption = {
  code: string
  name: string
  cardCount: number
}

type CreateBinderFormProps = {
  sets: SetOption[]
}

const STRATEGIES: BinderFillStrategy[] = ["manual", "set_order", "collection_only"]

const SET_SORT_ORDERS: BinderSortOrder[] = [
  "collector_number",
  "typeline",
  "color",
  "rarity",
  "cmc",
  "name",
]

const COLLECTION_SORT_ORDERS: BinderSortOrder[] = [
  "collector_number",
  "name",
]

export function CreateBinderForm({ sets }: CreateBinderFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [fillStrategy, setFillStrategy] =
    useState<BinderFillStrategy>("manual")
  const [sortOrder, setSortOrder] =
    useState<BinderSortOrder>("collector_number")
  const [setQuery, setSetQuery] = useState("")
  const [setCode, setSetCode] = useState("")
  const [pageCount, setPageCount] = useState(20)
  const [rowsPerPage, setRowsPerPage] = useState(3)
  const [columnsPerPage, setColumnsPerPage] = useState(3)
  const [doubleSided, setDoubleSided] = useState(true)

  const capacity = totalSlotCapacity({
    pageCount,
    rowsPerPage,
    columnsPerPage,
    doubleSided,
  })

  const filteredSets = useMemo(() => {
    const q = setQuery.trim().toLowerCase()
    if (!q) return sets.slice(0, 40)
    return sets
      .filter(
        (set) =>
          set.name.toLowerCase().includes(q) ||
          set.code.toLowerCase().includes(q),
      )
      .slice(0, 40)
  }, [sets, setQuery])

  const selectedSet = sets.find(
    (set) => set.code.toLowerCase() === setCode.toLowerCase(),
  )

  const estimatedVolumes =
    fillStrategy === "set_order" && selectedSet && capacity > 0
      ? Math.max(1, Math.ceil(selectedSet.cardCount / capacity))
      : 1

  const availableSortOrders =
    fillStrategy === "set_order"
      ? SET_SORT_ORDERS
      : fillStrategy === "collection_only"
        ? COLLECTION_SORT_ORDERS
        : []

  function strategyHint(strategy: BinderFillStrategy) {
    switch (strategy) {
      case "set_order":
        return t("binders.new.strategySetHint")
      case "collection_only":
        return t("binders.new.strategyCollectionHint")
      default:
        return t("binders.new.strategyManualHint")
    }
  }

  function strategyLabel(strategy: BinderFillStrategy) {
    switch (strategy) {
      case "set_order":
        return t("binders.strategySetOrder")
      case "collection_only":
        return t("binders.strategyCollection")
      default:
        return t("binders.strategyManual")
    }
  }

  function sortLabel(order: BinderSortOrder) {
    switch (order) {
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
  }

  function sortHint(order: BinderSortOrder) {
    switch (order) {
      case "typeline":
        return t("binders.sort.typelineHint")
      case "color":
        return t("binders.sort.colorHint")
      case "rarity":
        return t("binders.sort.rarityHint")
      case "cmc":
        return t("binders.sort.cmcHint")
      case "name":
        return t("binders.sort.nameHint")
      default:
        return t("binders.sort.collectorNumberHint")
    }
  }

  function handleStrategyChange(strategy: BinderFillStrategy) {
    setFillStrategy(strategy)
    if (strategy === "collection_only" && !COLLECTION_SORT_ORDERS.includes(sortOrder)) {
      setSortOrder("collector_number")
    }
    if (strategy === "manual") {
      setSortOrder("collector_number")
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const result = await createBinderAction({
        name,
        pageCount,
        rowsPerPage,
        columnsPerPage,
        doubleSided,
        fillStrategy,
        sortOrder:
          fillStrategy === "manual" ? "collector_number" : sortOrder,
        setCode: fillStrategy === "set_order" ? setCode : undefined,
      })

      toast.fromActionResult(result)
      if (!result.ok) return

      router.push(result.binderId ? `/binders/${result.binderId}` : "/binders")
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-5 rounded-2xl bg-surface-elevated p-5 ring-1 ring-ink/15"
    >
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">{t("binders.new.name")}</span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("binders.new.namePlaceholder")}
          className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">
          {t("binders.new.strategy")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {STRATEGIES.map((strategy) => (
            <button
              key={strategy}
              type="button"
              onClick={() => handleStrategyChange(strategy)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                fillStrategy === strategy
                  ? "bg-accent text-white"
                  : "bg-surface text-ink ring-1 ring-ink/15 hover:bg-surface-elevated",
              )}
            >
              {strategyLabel(strategy)}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-soft">{strategyHint(fillStrategy)}</p>
      </fieldset>

      {fillStrategy === "set_order" ? (
        <div className="space-y-2">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-ink">{t("binders.new.set")}</span>
            <input
              value={setQuery}
              onChange={(event) => setSetQuery(event.target.value)}
              placeholder={t("binders.new.setPlaceholder")}
              className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
            />
          </label>
          <div className="max-h-48 overflow-y-auto rounded-xl ring-1 ring-ink/10">
            {filteredSets.map((set) => (
              <button
                key={set.code}
                type="button"
                onClick={() => {
                  setSetCode(set.code)
                  setSetQuery(set.name)
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-surface",
                  setCode.toLowerCase() === set.code.toLowerCase() &&
                    "bg-accent/15",
                )}
              >
                <span className="font-medium text-ink">{set.name}</span>
                <span className="shrink-0 text-xs text-ink-soft">
                  {set.code.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
          {selectedSet ? (
            <p className="text-sm text-ink-soft">
              {t("binders.new.setCards", { count: selectedSet.cardCount })}
            </p>
          ) : null}
        </div>
      ) : null}

      {availableSortOrders.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink">
            {t("binders.new.sortOrder")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {availableSortOrders.map((order) => (
              <button
                key={order}
                type="button"
                onClick={() => setSortOrder(order)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  sortOrder === order
                    ? "bg-accent text-white"
                    : "bg-surface text-ink ring-1 ring-ink/15 hover:bg-surface-elevated",
                )}
              >
                {sortLabel(order)}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink-soft">{sortHint(sortOrder)}</p>
        </fieldset>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField
          label={t("binders.new.pages")}
          value={pageCount}
          min={1}
          max={200}
          onChange={setPageCount}
        />
        <NumberField
          label={t("binders.new.rows")}
          value={rowsPerPage}
          min={1}
          max={6}
          onChange={setRowsPerPage}
        />
        <NumberField
          label={t("binders.new.columns")}
          value={columnsPerPage}
          min={1}
          max={6}
          onChange={setColumnsPerPage}
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={doubleSided}
          onChange={(event) => setDoubleSided(event.target.checked)}
          className="size-4 rounded border-ink/30 text-accent focus:ring-accent/40"
        />
        {t("binders.new.doubleSided")}
      </label>

      <div className="rounded-xl bg-surface px-4 py-3 text-sm ring-1 ring-ink/10">
        <p className="font-medium text-ink">
          {t("binders.new.capacity", { count: capacity })}
        </p>
        {estimatedVolumes > 1 && selectedSet ? (
          <p className="mt-1 text-ink-soft">
            {t("binders.new.multiVolumeHint", {
              cards: selectedSet.cardCount,
              capacity,
              volumes: estimatedVolumes,
            })}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={
          isPending ||
          !name.trim() ||
          (fillStrategy === "set_order" && !setCode)
        }
        className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? t("binders.new.submitting")
          : estimatedVolumes > 1
            ? t("binders.new.submitSeries", { count: estimatedVolumes })
            : t("binders.new.submit")}
      </button>
    </form>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10)
          if (Number.isFinite(next)) onChange(next)
        }}
        className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/25"
      />
    </label>
  )
}
