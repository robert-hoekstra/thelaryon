"use client"

import { useEffect, useState } from "react"

import { CardGrid } from "@/components/cards/card-grid"
import { useTranslations } from "@/components/i18n/locale-provider"
import type { Card } from "@/types/card"

type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "success"; query: string; cards: Card[] }
  | { status: "error"; query: string; message: string }

const DEBOUNCE_MS = 400

type CardSearchProps = {
  initialQuery?: string
  isAuthenticated?: boolean
}

export function CardSearch({
  initialQuery = "",
  isAuthenticated = false,
}: CardSearchProps) {
  const t = useTranslations()
  const [query, setQuery] = useState(initialQuery)
  const [state, setState] = useState<SearchState>({ status: "idle" })

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setState({ status: "idle" })
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setState({ status: "loading", query: trimmed })

      try {
        const response = await fetch(
          `/api/cards/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        )

        const body = (await response.json()) as {
          data?: Card[]
          message?: string
        }

        if (!response.ok) {
          throw new Error(body.message ?? t("search.errorFallback"))
        }

        setState({
          status: "success",
          query: trimmed,
          cards: body.data ?? [],
        })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        const message =
          error instanceof Error ? error.message : t("search.errorRetry")

        setState({
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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="card-search" className="sr-only">
          {t("search.label")}
        </label>
        <input
          id="card-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search.placeholder")}
          autoComplete="off"
          className="w-full rounded-2xl border border-ink/20 bg-surface-elevated px-4 py-3.5 text-base text-ink shadow-sm outline-none transition placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
        />
        <p className="text-sm text-ink-soft">{t("search.hint")}</p>
      </div>

      {state.status === "idle" ? (
        <EmptyState
          title={t("search.idleTitle")}
          description={t("search.idleDescription")}
        />
      ) : null}

      {state.status === "loading" ? (
        <div className="flex items-center gap-3 rounded-2xl bg-surface/80 px-4 py-5 text-sm text-ink-soft ring-1 ring-ink/10">
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-accent"
          />
          {t("search.loading", { query: state.query })}
        </div>
      ) : null}

      {state.status === "error" ? (
        <EmptyState
          title={t("search.errorTitle")}
          description={state.message}
          tone="error"
        />
      ) : null}

      {state.status === "success" && state.cards.length === 0 ? (
        <EmptyState
          title={t("search.emptyTitle")}
          description={t("search.emptyDescription", { query: state.query })}
        />
      ) : null}

      {state.status === "success" && state.cards.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">
            {state.cards.length === 1
              ? t("search.resultsOne", { query: state.query })
              : t("search.resultsMany", {
                  count: state.cards.length,
                  query: state.query,
                })}
          </p>
          <CardGrid
            cards={state.cards}
            showQuickActions
            isAuthenticated={isAuthenticated}
          />
        </div>
      ) : null}
    </div>
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
