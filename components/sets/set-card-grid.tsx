"use client"

import Link from "next/link"
import { useState } from "react"

import { CardImage } from "@/components/cards/card-image"
import { useTranslations } from "@/components/i18n/locale-provider"
import { cn } from "@/lib/utils"
import type { SetCardOwnership } from "@/types/set"

type FilterMode = "all" | "owned" | "missing"

type SetCardGridProps = {
  cards: SetCardOwnership[]
  isAuthenticated: boolean
}

function formatRarity(rarity: string) {
  return rarity.replaceAll("_", " ")
}

export function SetCardGrid({
  cards,
  isAuthenticated,
}: SetCardGridProps) {
  const t = useTranslations()
  const [filter, setFilter] = useState<FilterMode>("all")

  const filteredCards = cards.filter((card) => {
    if (filter === "owned") return card.owned
    if (filter === "missing") return !card.owned
    return true
  })

  const filters: { key: FilterMode; label: string }[] = [
    { key: "all", label: t("setDetail.filterAll") },
    { key: "owned", label: t("setDetail.filterOwned") },
    { key: "missing", label: t("setDetail.filterMissing") },
  ]

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl bg-surface/80 px-5 py-10 text-center ring-1 ring-ink/10">
        <p className="text-sm text-ink-soft">{t("setDetail.noCards")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isAuthenticated && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-accent text-white"
                  : "bg-surface-elevated text-ink hover:bg-surface-elevated/80 ring-1 ring-ink/10",
              )}
            >
              {f.label}
              {f.key === "owned" && ` (${cards.filter((c) => c.owned).length})`}
              {f.key === "missing" &&
                ` (${cards.filter((c) => !c.owned).length})`}
            </button>
          ))}
        </div>
      )}

      {filteredCards.length === 0 ? (
        <div className="rounded-2xl bg-surface/80 px-5 py-10 text-center ring-1 ring-ink/10">
          <p className="text-sm text-ink-soft">{t("setDetail.noMatches")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredCards.map((card) => (
            <SetCardItem
              key={card.scryfallId}
              card={card}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type SetCardItemProps = {
  card: SetCardOwnership
  isAuthenticated: boolean
}

function SetCardItem({ card, isAuthenticated }: SetCardItemProps) {
  const t = useTranslations()

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_1px_0_rgba(0,0,0,0.15),0_12px_30px_-18px_rgba(0,0,0,0.6)] ring-1 ring-ink/10 transition duration-200",
        isAuthenticated && !card.owned && "opacity-60",
        "hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(0,0,0,0.15),0_18px_36px_-16px_rgba(0,0,0,0.75)] hover:ring-accent/30",
      )}
    >
      <Link
        href={`/cards/${card.scryfallId}`}
        className="relative aspect-[5/7] overflow-hidden bg-surface"
      >
        {card.image ? (
          <CardImage
            src={card.image}
            alt={card.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-ink-soft">
            {t("card.noImage")}
          </div>
        )}

        {isAuthenticated && (
          <div
            className={cn(
              "absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
              card.owned
                ? "bg-mana-green text-white"
                : "bg-surface/90 text-ink-soft ring-1 ring-ink/20",
            )}
            aria-label={card.owned ? t("setDetail.owned") : t("setDetail.missing")}
          >
            {card.owned ? "✓" : "○"}
          </div>
        )}

        {isAuthenticated && card.quantity > 1 && (
          <div className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
            {t("setDetail.quantity", { count: card.quantity })}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/cards/${card.scryfallId}`} className="block">
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
            {card.name}
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            #{card.collectorNumber}
          </p>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">
            {formatRarity(card.rarity)}
          </span>
          {isAuthenticated && (
            <span
              className={cn(
                "text-xs font-medium",
                card.owned ? "text-mana-green" : "text-ink-soft",
              )}
            >
              {card.owned ? t("setDetail.owned") : t("setDetail.missing")}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
