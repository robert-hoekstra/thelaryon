"use client"

import Link from "next/link"
import { useState } from "react"

import { CardImage } from "@/components/cards/card-image"
import { CardTilt } from "@/components/cards/card-tilt"
import { useTranslations } from "@/components/i18n/locale-provider"
import type { SetComparisonCard, SetComparisonResult } from "@/lib/sets/compare"
import { cn } from "@/lib/utils"

import { SetCompareSelector } from "./set-compare-selector"
import { SetProgressBar } from "./set-progress-bar"

type FilterMode = "all" | "both" | "only_me" | "only_friend" | "neither"

type SetComparisonViewProps = {
  comparison: SetComparisonResult
  setCode: string
  friends: { id: string; name: string }[]
}

export function SetComparisonView({
  comparison,
  setCode,
  friends,
}: SetComparisonViewProps) {
  const t = useTranslations()
  const [filter, setFilter] = useState<FilterMode>("all")

  const { set, friend, cards, myCompletion, friendCompletion, summary, potentialTrades } =
    comparison

  const filteredCards = cards.filter((card) => {
    if (filter === "all") return true
    return card.status === filter
  })

  const filters: { key: FilterMode; label: string; count: number }[] = [
    { key: "all", label: t("setDetail.filterAll"), count: cards.length },
    { key: "both", label: t("setCompare.bothOwn"), count: summary.bothOwn },
    { key: "only_me", label: t("setCompare.onlyYou"), count: summary.onlyMe },
    {
      key: "only_friend",
      label: t("setCompare.onlyFriend", { name: friend.name }),
      count: summary.onlyFriend,
    },
    {
      key: "neither",
      label: t("setCompare.neitherOwns"),
      count: summary.neitherOwns,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/sets"
          className="inline-flex text-sm font-medium text-accent hover:text-accent/80"
        >
          {t("setDetail.backToSets")}
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {set.iconSvgUri && (
              <img
                src={set.iconSvgUri}
                alt=""
                className="h-12 w-12 opacity-80 invert"
              />
            )}
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-ink sm:text-3xl">
                {t("setCompare.title", {
                  setName: set.name,
                  friendName: friend.name,
                })}
              </h1>
              <p className="text-sm text-ink-soft">{set.code}</p>
            </div>
          </div>

          <SetCompareSelector
            setCode={setCode}
            friends={friends}
            currentCompareId={friend.id}
          />
        </div>
      </div>

      {/* Completion comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface-elevated/90 p-5 ring-1 ring-ink/10">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
            {t("setCompare.yourCompletion")}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink">
              {myCompletion.percentage.toFixed(1)}%
            </span>
            <span className="text-sm text-ink-soft">
              ({myCompletion.owned} / {myCompletion.total})
            </span>
          </div>
          <div className="mt-3">
            <SetProgressBar percentage={myCompletion.percentage} size="md" />
          </div>
        </div>

        <div className="rounded-2xl bg-surface-elevated/90 p-5 ring-1 ring-ink/10">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
            {t("setCompare.friendCompletion", { name: friend.name })}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink">
              {friendCompletion.percentage.toFixed(1)}%
            </span>
            <span className="text-sm text-ink-soft">
              ({friendCompletion.owned} / {friendCompletion.total})
            </span>
          </div>
          <div className="mt-3">
            <SetProgressBar percentage={friendCompletion.percentage} size="md" />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          {
            label: t("setCompare.bothOwn"),
            value: summary.bothOwn,
            accent: "border-l-mana-green",
          },
          {
            label: t("setCompare.onlyYou"),
            value: summary.onlyMe,
            accent: "border-l-accent",
          },
          {
            label: t("setCompare.onlyFriend", { name: friend.name }),
            value: summary.onlyFriend,
            accent: "border-l-gold",
          },
          {
            label: t("setCompare.neitherOwns"),
            value: summary.neitherOwns,
            accent: "border-l-ink-soft",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border-l-4 bg-surface-elevated/90 px-4 py-4 ring-1 ring-ink/10 ${stat.accent}`}
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              {stat.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Potential trades */}
      {(potentialTrades.iNeed.length > 0 || potentialTrades.theyNeed.length > 0) && (
        <div className="rounded-2xl border border-accent/25 bg-accent/10 p-5 ring-1 ring-accent/15">
          <h2 className="font-semibold text-ink">
            {t("setCompare.potentialTrades")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {potentialTrades.iNeed.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink-soft">
                  {t("setCompare.youNeed")} ({potentialTrades.iNeed.length})
                </h3>
                <ul className="mt-2 space-y-1">
                  {potentialTrades.iNeed.slice(0, 5).map((card) => (
                    <li
                      key={card.scryfallId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-ink">
                        #{card.collectorNumber} {card.name}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {t("setCompare.theyHave", { count: card.friendQuantity })}
                      </span>
                    </li>
                  ))}
                  {potentialTrades.iNeed.length > 5 && (
                    <li className="text-xs text-ink-soft">
                      +{potentialTrades.iNeed.length - 5} more…
                    </li>
                  )}
                </ul>
              </div>
            )}
            {potentialTrades.theyNeed.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink-soft">
                  {t("setCompare.theyNeed")} ({potentialTrades.theyNeed.length})
                </h3>
                <ul className="mt-2 space-y-1">
                  {potentialTrades.theyNeed.slice(0, 5).map((card) => (
                    <li
                      key={card.scryfallId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-ink">
                        #{card.collectorNumber} {card.name}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {t("setCompare.youHave", { count: card.myQuantity })}
                      </span>
                    </li>
                  ))}
                  {potentialTrades.theyNeed.length > 5 && (
                    <li className="text-xs text-ink-soft">
                      +{potentialTrades.theyNeed.length - 5} more…
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter buttons */}
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
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Card grid */}
      {filteredCards.length === 0 ? (
        <div className="rounded-2xl bg-surface/80 px-5 py-10 text-center ring-1 ring-ink/10">
          <p className="text-sm text-ink-soft">{t("setDetail.noMatches")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredCards.map((card) => (
            <ComparisonCardItem
              key={card.scryfallId}
              card={card}
              friendName={friend.name}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type ComparisonCardItemProps = {
  card: SetComparisonCard
  friendName: string
}

function ComparisonCardItem({ card, friendName }: ComparisonCardItemProps) {
  const t = useTranslations()

  const statusColors: Record<SetComparisonCard["status"], string> = {
    both: "bg-mana-green",
    only_me: "bg-accent",
    only_friend: "bg-gold",
    neither: "bg-ink-soft/50",
  }

  const statusLabels: Record<SetComparisonCard["status"], string> = {
    both: t("setCompare.bothOwn"),
    only_me: t("setCompare.onlyYou"),
    only_friend: t("setCompare.onlyFriend", { name: friendName }),
    neither: t("setCompare.neitherOwns"),
  }

  return (
    <article
      className={cn(
        "card-grid-item group flex flex-col rounded-2xl bg-surface-elevated shadow-[0_1px_0_rgba(0,0,0,0.15),0_12px_30px_-18px_rgba(0,0,0,0.55)] ring-1 ring-ink/15 transition duration-200",
        card.status === "neither" && "opacity-60",
        "hover:shadow-[0_1px_0_rgba(0,0,0,0.15),0_20px_40px_-16px_rgba(0,0,0,0.7)] hover:ring-accent/40",
      )}
    >
      <CardTilt className="z-10 rounded-2xl">
        <Link
          href={`/cards/${card.scryfallId}`}
          className="relative aspect-[5/7] block overflow-hidden rounded-2xl bg-surface"
        >
          {card.image ? (
            <CardImage
              src={card.image}
              alt={card.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-ink-soft">
              {t("card.noImage")}
            </div>
          )}

          <div
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white",
              statusColors[card.status],
            )}
          >
            {statusLabels[card.status]}
          </div>
        </Link>
      </CardTilt>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/cards/${card.scryfallId}`} className="block">
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
            {card.name}
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft">#{card.collectorNumber}</p>
        </Link>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-2 text-xs">
          <div>
            <span className="text-ink-soft">{t("setCompare.you")}: </span>
            <span
              className={cn(
                "font-medium",
                card.myQuantity > 0 ? "text-mana-green" : "text-ink-soft",
              )}
            >
              {card.myQuantity > 0 ? `×${card.myQuantity}` : "—"}
            </span>
          </div>
          <div>
            <span className="text-ink-soft">{friendName}: </span>
            <span
              className={cn(
                "font-medium",
                card.friendQuantity > 0 ? "text-gold" : "text-ink-soft",
              )}
            >
              {card.friendQuantity > 0 ? `×${card.friendQuantity}` : "—"}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
