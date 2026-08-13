"use client"

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react"

import { CollectionGrid } from "@/components/collection/collection-grid"
import { useTranslations } from "@/components/i18n/locale-provider"
import { cn } from "@/lib/utils"
import type { CollectionItem } from "@/types/collection"

const PAGE_SIZE = 24

type CollectionBrowserProps = {
  items: CollectionItem[]
}

function matchesQuery(item: CollectionItem, query: string) {
  if (!query) return true

  const haystack = [
    item.name,
    item.setCode,
    item.setName,
    item.collectorNumber,
    item.finish,
    item.condition,
  ]
    .join(" ")
    .toLowerCase()

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token))
}

export function CollectionBrowser({ items }: CollectionBrowserProps) {
  const t = useTranslations()
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const deferredQuery = useDeferredValue(query.trim())

  const filteredItems = useMemo(
    () => items.filter((item) => matchesQuery(item, deferredQuery)),
    [items, deferredQuery],
  )

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredItems.slice(start, start + PAGE_SIZE)
  }, [filteredItems, currentPage])

  useEffect(() => {
    setPage(1)
  }, [deferredQuery])

  const rangeStart =
    filteredItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredItems.length)
  const isStale = query.trim() !== deferredQuery

  function goToPage(next: number) {
    startTransition(() => {
      setPage(Math.min(totalPages, Math.max(1, next)))
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label htmlFor="collection-search" className="sr-only">
          {t("collection.filterLabel")}
        </label>
        <input
          id="collection-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("collection.filterPlaceholder")}
          autoComplete="off"
          className="w-full rounded-2xl border border-ink/20 bg-surface-elevated px-4 py-3.5 text-base text-ink shadow-sm outline-none transition placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
        />
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={cn(
              "text-sm text-ink-soft transition-opacity",
              isStale && "opacity-60",
            )}
          >
            {deferredQuery
              ? filteredItems.length === 0
                ? t("collection.filterEmpty", { query: deferredQuery })
                : t("collection.filterResults", {
                    shown: filteredItems.length,
                    total: items.length,
                    query: deferredQuery,
                  })
              : t("collection.filterAll", {
                  count: items.length,
                })}
          </p>
          {filteredItems.length > 0 ? (
            <p className="text-sm text-ink-soft">
              {t("collection.pageRange", {
                start: rangeStart,
                end: rangeEnd,
                total: filteredItems.length,
              })}
            </p>
          ) : null}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-surface/80 px-5 py-10 text-center ring-1 ring-ink/10">
          <h2 className="text-base font-semibold text-ink">
            {t("collection.filterEmptyTitle")}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {t("collection.filterEmptyDescription")}
          </p>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85"
            >
              {t("collection.clearFilter")}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <CollectionGrid items={pageItems} />

          {totalPages > 1 ? (
            <nav
              className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between"
              aria-label={t("collection.paginationLabel")}
            >
              <p className="text-sm text-ink-soft">
                {t("collection.pageStatus", {
                  page: currentPage,
                  pages: totalPages,
                })}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-full border border-ink/25 bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {t("collection.prevPage")}
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers(currentPage, totalPages).map((entry, index) =>
                    entry === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-sm text-ink-soft"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={entry}
                        type="button"
                        onClick={() => goToPage(entry)}
                        aria-current={entry === currentPage ? "page" : undefined}
                        className={cn(
                          "min-w-9 rounded-full px-3 py-2 text-sm font-semibold transition",
                          entry === currentPage
                            ? "bg-accent text-white"
                            : "border border-ink/25 bg-surface text-ink hover:bg-surface-elevated",
                        )}
                      >
                        {entry}
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded-full border border-ink/25 bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {t("collection.nextPage")}
                </button>
              </div>
            </nav>
          ) : null}
        </>
      )}
    </div>
  )
}

function getPageNumbers(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total, current])
  for (let offset = 1; offset <= 1; offset += 1) {
    pages.add(current - offset)
    pages.add(current + offset)
  }

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const result: Array<number | "ellipsis"> = []
  for (const page of sorted) {
    const previous = result[result.length - 1]
    if (typeof previous === "number" && page - previous > 1) {
      result.push("ellipsis")
    }
    result.push(page)
  }

  return result
}
