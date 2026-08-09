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
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(24,24,27,0.04),0_12px_30px_-18px_rgba(24,24,27,0.35)] ring-1 ring-ink/8 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(24,24,27,0.04),0_18px_36px_-16px_rgba(24,24,27,0.45)]">
      <Link
        href={`/cards/${card.id}`}
        className="relative aspect-[5/7] overflow-hidden bg-zinc-100"
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
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
            {t("card.noImage")}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/cards/${card.id}`} className="block">
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
            {card.name}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {card.setName} · {card.setCode} · #{card.collectorNumber}
          </p>
        </Link>

        <div className="flex items-end justify-between gap-2 pt-1">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            {formatRarity(card.rarity)}
          </span>
          <div className="text-right">
            <p className="text-sm font-semibold text-zinc-900">{euroPrice}</p>
            {foilPrice ? (
              <p className="text-[11px] text-zinc-500">
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
