import Link from "next/link"

import { CardImage } from "@/components/cards/card-image"
import { formatEuroPrice } from "@/lib/pricing/price"
import type { Locale } from "@/lib/i18n/config"
import type { MessageKey } from "@/lib/i18n/dictionaries"
import type { CollectionCompareCard } from "@/types/friends"

type CompareCardListProps = {
  title: string
  hint?: string
  emptyLabel: string
  cards: CollectionCompareCard[]
  locale: Locale
  t: (key: MessageKey, params?: Record<string, string | number>) => string
  emphasizeExtras?: boolean
}

export function CompareCardList({
  title,
  hint,
  emptyLabel,
  cards,
  locale,
  t,
  emphasizeExtras = false,
}: CompareCardListProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {hint ? <p className="mt-1 text-sm text-ink/60">{hint}</p> : null}
      </div>

      {cards.length === 0 ? (
        <p className="rounded-2xl bg-white/70 px-4 py-6 text-sm text-ink/55 ring-1 ring-ink/8">
          {emptyLabel}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li
              key={card.scryfallId}
              className="flex gap-3 rounded-2xl bg-white/90 p-3 ring-1 ring-ink/8"
            >
              <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {card.image ? (
                  <CardImage
                    src={card.image}
                    alt={card.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div>
                  <p className="truncate text-sm font-semibold text-ink">
                    {card.name}
                  </p>
                  <p className="truncate text-xs text-ink/50">
                    {card.setCode} · #{card.collectorNumber}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                  <span className="rounded-full bg-ink/5 px-2 py-0.5 text-ink/70">
                    {t("friends.theirQty", { count: card.friendQuantity })}
                  </span>
                  <span className="rounded-full bg-ink/5 px-2 py-0.5 text-ink/70">
                    {t("friends.yourQty", { count: card.myQuantity })}
                  </span>
                  {emphasizeExtras && card.friendExtras > 0 ? (
                    <span className="rounded-full bg-mana-green/15 px-2 py-0.5 text-mana-green">
                      {t("friends.extrasBadge", { count: card.friendExtras })}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <p className="text-xs font-semibold text-ink">
                    {formatEuroPrice(card.currentPrice, locale)}
                  </p>
                  <Link
                    href={`/cards/${card.scryfallId}`}
                    className="text-xs font-semibold text-mana-blue hover:text-mana-blue/80"
                  >
                    {t("friends.viewCard")}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
