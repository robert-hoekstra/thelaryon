"use client"

import Link from "next/link"
import { useState } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"
import type { Locale } from "@/lib/i18n/config"
import type { CardSet } from "@/types/set"

import { SetProgressBar } from "./set-progress-bar"

type CompletionSummary = Record<
  string,
  { owned: number; total: number; percentage: number }
>

type SetListProps = {
  sets: CardSet[]
  completionSummary: CompletionSummary
  isAuthenticated: boolean
  locale: Locale
}

function formatDate(dateString: string | null, locale: Locale): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function SetList({
  sets,
  completionSummary,
  isAuthenticated,
  locale,
}: SetListProps) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSets = sets.filter((set) =>
    set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (sets.length === 0) {
    return (
      <div className="rounded-2xl bg-surface/80 px-5 py-10 text-center ring-1 ring-ink/10">
        <p className="text-sm text-ink-soft">{t("sets.noSets")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("sets.searchPlaceholder")}
          className="w-full rounded-xl border border-ink/15 bg-surface-elevated px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>

      {filteredSets.length === 0 ? (
        <div className="rounded-2xl bg-surface/80 px-5 py-10 text-center ring-1 ring-ink/10">
          <p className="text-sm text-ink-soft">{t("sets.noSets")}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredSets.map((set) => {
            const completion = completionSummary[set.code]
            const owned = completion?.owned ?? 0
            const total = completion?.total ?? set.cardCount
            const percentage = completion?.percentage ?? 0

            return (
              <li key={set.id}>
                <Link
                  href={`/sets/${set.code.toLowerCase()}`}
                  className="group flex flex-col gap-3 rounded-2xl bg-surface-elevated p-4 ring-1 ring-ink/10 transition hover:ring-accent/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {set.iconSvgUri && (
                      <img
                        src={set.iconSvgUri}
                        alt=""
                        className="h-8 w-8 opacity-80 invert"
                        loading="lazy"
                      />
                    )}
                    <div>
                      <h2 className="font-semibold text-ink group-hover:text-accent">
                        {set.name}
                      </h2>
                      <p className="text-xs text-ink-soft">
                        {set.code} · {formatDate(set.releasedAt, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 sm:min-w-[180px]">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {t("sets.completion", { owned, total })}
                          </span>
                          <span className="text-xs font-medium text-accent">
                            {t("sets.completionPercent", {
                              percent: percentage.toFixed(1),
                            })}
                          </span>
                        </div>
                        <SetProgressBar percentage={percentage} />
                      </>
                    ) : (
                      <span className="text-sm text-ink-soft">
                        {t("sets.cardCount", { count: set.cardCount })}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
