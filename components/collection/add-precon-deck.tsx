"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { useTranslations } from "@/components/i18n/locale-provider"
import { toast } from "@/components/ui/toast"
import { addPreconDeckAction } from "@/lib/collection/actions"
import type { CardCondition } from "@/types/collection"
import type { PreconDeck, PreconDeckSummary } from "@/types/deck"

const DEBOUNCE_MS = 400

const CONDITIONS: { value: CardCondition; label: string }[] = [
  { value: "MINT", label: "Mint" },
  { value: "NEAR_MINT", label: "Near Mint" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "LIGHT_PLAYED", label: "Light Played" },
  { value: "PLAYED", label: "Played" },
  { value: "POOR", label: "Poor" },
]

type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "success"; query: string; decks: PreconDeckSummary[] }
  | { status: "error"; query: string; message: string }

type DetailState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "success"; deck: PreconDeck }
  | { status: "error"; message: string }

export function AddPreconDeck() {
  const t = useTranslations()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [search, setSearch] = useState<SearchState>({ status: "idle" })
  const [detail, setDetail] = useState<DetailState>({ status: "idle" })
  const [condition, setCondition] = useState<CardCondition>("NEAR_MINT")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setSearch({ status: "loading", query: trimmed })

      try {
        const response = await fetch(
          `/api/decks/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        )
        const body = (await response.json()) as {
          data?: PreconDeckSummary[]
          message?: string
        }

        if (!response.ok) {
          throw new Error(body.message ?? t("precon.searchFailed"))
        }

        setSearch({
          status: "success",
          query: trimmed,
          decks: body.data ?? [],
        })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        const message =
          error instanceof Error ? error.message : t("precon.searchFailed")

        setSearch({
          status: "error",
          query: trimmed,
          message,
        })
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [query, t])

  async function selectDeck(summary: PreconDeckSummary) {
    setDetail({ status: "loading", fileName: summary.fileName })

    try {
      const response = await fetch(
        `/api/decks/detail?fileName=${encodeURIComponent(summary.fileName)}`,
      )
      const body = (await response.json()) as {
        data?: PreconDeck
        message?: string
      }

      if (!response.ok || !body.data) {
        throw new Error(body.message ?? t("precon.fetchFailed"))
      }

      setDetail({ status: "success", deck: body.data })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("precon.fetchFailed")
      setDetail({ status: "error", message })
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (detail.status !== "success") {
      return
    }

    const fileName = detail.deck.fileName

    startTransition(async () => {
      const result = await addPreconDeckAction({
        fileName,
        condition,
        purchasePrice:
          purchasePrice.trim() === ""
            ? undefined
            : Number.parseFloat(purchasePrice),
        purchaseDate: purchaseDate || undefined,
      })

      toast.fromActionResult(result)
      if (result.ok) {
        router.push("/collection")
        router.refresh()
      }
    })
  }

  const selectedFileName =
    detail.status === "success"
      ? detail.deck.fileName
      : detail.status === "loading"
        ? detail.fileName
        : null

  const trimmedQuery = query.trim()
  const searchState = trimmedQuery ? search : { status: "idle" as const }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="precon-search" className="sr-only">
          {t("precon.searchLabel")}
        </label>
        <input
          id="precon-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("precon.searchPlaceholder")}
          autoComplete="off"
          className="w-full rounded-2xl border border-ink/20 bg-surface-elevated px-4 py-3.5 text-base text-ink shadow-sm outline-none transition placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
        />
        <p className="text-sm text-ink-soft">{t("precon.searchHint")}</p>
      </div>

      {searchState.status === "idle" ? (
        <EmptyState
          title={t("precon.idleTitle")}
          description={t("precon.idleDescription")}
        />
      ) : null}

      {searchState.status === "loading" ? (
        <div className="flex items-center gap-3 rounded-2xl bg-surface/80 px-4 py-5 text-sm text-ink-soft ring-1 ring-ink/10">
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-accent"
          />
          {t("precon.searching", { query: searchState.query })}
        </div>
      ) : null}

      {searchState.status === "error" ? (
        <EmptyState
          title={t("precon.searchErrorTitle")}
          description={searchState.message}
          tone="error"
        />
      ) : null}

      {searchState.status === "success" && searchState.decks.length === 0 ? (
        <EmptyState
          title={t("precon.emptyTitle")}
          description={t("precon.emptyDescription", { query: searchState.query })}
        />
      ) : null}

      {searchState.status === "success" && searchState.decks.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {searchState.decks.map((deck) => {
            const selected = selectedFileName === deck.fileName

            return (
              <li key={deck.fileName}>
                <button
                  type="button"
                  onClick={() => void selectDeck(deck)}
                  className={
                    selected
                      ? "flex w-full flex-col rounded-2xl bg-accent/10 px-4 py-3 text-left ring-2 ring-accent"
                      : "flex w-full flex-col rounded-2xl bg-surface-elevated px-4 py-3 text-left ring-1 ring-ink/10 transition hover:ring-accent/40"
                  }
                >
                  <span className="font-semibold text-ink">{deck.name}</span>
                  <span className="mt-1 text-sm text-ink-soft">
                    {deck.type} · {deck.code}
                    {deck.releaseDate ? ` · ${deck.releaseDate}` : ""}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {detail.status === "loading" ? (
        <div className="flex items-center gap-3 rounded-2xl bg-surface/80 px-4 py-5 text-sm text-ink-soft ring-1 ring-ink/10">
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-accent"
          />
          {t("precon.loadingDeck")}
        </div>
      ) : null}

      {detail.status === "error" ? (
        <EmptyState
          title={t("precon.fetchFailed")}
          description={detail.message}
          tone="error"
        />
      ) : null}

      {detail.status === "success" ? (
        <DeckPreview
          deck={detail.deck}
          condition={condition}
          purchasePrice={purchasePrice}
          purchaseDate={purchaseDate}
          isPending={isPending}
          onConditionChange={setCondition}
          onPurchasePriceChange={setPurchasePrice}
          onPurchaseDateChange={setPurchaseDate}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  )
}

function DeckPreview({
  deck,
  condition,
  purchasePrice,
  purchaseDate,
  isPending,
  onConditionChange,
  onPurchasePriceChange,
  onPurchaseDateChange,
  onSubmit,
}: {
  deck: PreconDeck
  condition: CardCondition
  purchasePrice: string
  purchaseDate: string
  isPending: boolean
  onConditionChange: (value: CardCondition) => void
  onPurchasePriceChange: (value: string) => void
  onPurchaseDateChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const t = useTranslations()
  const commanders = deck.cards.filter((card) => card.role === "commander")
  const otherCards = deck.cards.filter((card) => card.role !== "commander")

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl bg-surface-elevated p-5 ring-1 ring-ink/15"
    >
      <div>
        <h2 className="text-lg font-semibold text-ink">{deck.name}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {t("precon.deckMeta", {
            type: deck.type,
            code: deck.code,
            count: deck.totalCards,
          })}
        </p>
      </div>

      {commanders.length > 0 ? (
        <p className="text-sm text-ink">
          <span className="font-medium">{t("precon.commanders")}: </span>
          {commanders.map((card) => card.name).join(", ")}
        </p>
      ) : null}

      <div className="max-h-72 overflow-y-auto rounded-xl bg-surface/80 px-3 py-2 ring-1 ring-ink/10">
        <ul className="divide-y divide-ink/10 text-sm">
          {[...commanders, ...otherCards].map((card) => (
            <li
              key={`${card.scryfallId}-${card.finish}-${card.language}`}
              className="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span className="text-ink">
                {card.quantity}× {card.name}
              </span>
              <span className="shrink-0 text-xs text-ink-soft">
                {card.setCode}
                {card.finish !== "NON_FOIL"
                  ? ` · ${card.finish === "FOIL" ? t("quickAdd.finishFoil") : t("quickAdd.finishEtched")}`
                  : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-ink">{t("customAdd.condition")}</span>
          <select
            value={condition}
            onChange={(event) =>
              onConditionChange(event.target.value as CardCondition)
            }
            className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/25"
          >
            {CONDITIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-ink">
            {t("precon.purchasePrice")}
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(event) => onPurchasePriceChange(event.target.value)}
            placeholder={t("customAdd.optional")}
            className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-ink">
            {t("customAdd.purchaseDate")}
          </span>
          <input
            type="date"
            value={purchaseDate}
            onChange={(event) => onPurchaseDateChange(event.target.value)}
            className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/25"
          />
        </label>
      </div>

      <p className="text-xs text-ink-soft">{t("precon.purchasePriceHint")}</p>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? t("precon.adding")
          : t("precon.submit", { count: deck.totalCards })}
      </button>
    </form>
  )
}

function EmptyState({
  title,
  description,
  tone = "neutral",
}: {
  title: string
  description: string
  tone?: "neutral" | "error"
}) {
  return (
    <div
      className={
        tone === "error"
          ? "rounded-2xl bg-mana-red/15 px-5 py-8 text-center ring-1 ring-mana-red/30"
          : "rounded-2xl bg-surface/80 px-5 py-8 text-center ring-1 ring-ink/10"
      }
    >
      <h2
        className={
          tone === "error"
            ? "text-base font-semibold text-mana-red"
            : "text-base font-semibold text-ink"
        }
      >
        {title}
      </h2>
      <p
        className={
          tone === "error"
            ? "mt-2 text-sm text-mana-red/80"
            : "mt-2 text-sm text-ink-soft"
        }
      >
        {description}
      </p>
    </div>
  )
}
