"use client"

import Link from "next/link"

import { CardImage } from "@/components/cards/card-image"
import { CardQuickActions } from "@/components/cards/card-quick-actions"
import { useLocale, useTranslations } from "@/components/i18n/locale-provider"
import { formatEuroPrice } from "@/lib/pricing/price"
import type { Card } from "@/types/card"

type CardGridItemProps = {
  card: Card
  showQuickActions?: boolean
  isAuthenticated?: boolean
}

function formatRarity(rarity: string) {
  return rarity.replaceAll("_", " ")
}

export function CardGridItem({
  card,
  showQuickActions = false,
  isAuthenticated = false,
}: CardGridItemProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const imageSrc = card.image.normal ?? card.image.small
  const euroPrice = formatEuroPrice(card.prices.eur, locale)
  const foilPrice =
    card.prices.eurFoil != null
      ? formatEuroPrice(card.prices.eurFoil, locale)
      : null

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_1px_0_rgba(0,0,0,0.15),0_12px_30px_-18px_rgba(0,0,0,0.6)] ring-1 ring-ink/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(0,0,0,0.15),0_18px_36px_-16px_rgba(0,0,0,0.75)] hover:ring-accent/30">
      <Link
        href={`/cards/${card.id}`}
        className="relative aspect-[5/7] overflow-hidden bg-surface"
      >
        {imageSrc ? (
          <CardImage
            src={imageSrc}
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
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/cards/${card.id}`} className="block">
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
            {card.name}
          </h2>
          <p className="mt-1 text-xs text-ink-soft">
            {card.setName} · {card.setCode} · #{card.collectorNumber}
          </p>
        </Link>

        <div className="flex items-end justify-between gap-2 pt-1">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">
            {formatRarity(card.rarity)}
          </span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gold">{euroPrice}</p>
            {foilPrice ? (
              <p className="text-[11px] text-ink-soft">
                {t("card.foilPrefix", { price: foilPrice })}
              </p>
            ) : null}
          </div>
        </div>

        {showQuickActions ? (
          <CardQuickActions
            card={card}
            isAuthenticated={isAuthenticated}
          />
        ) : null}
      </div>
    </article>
  )
}
