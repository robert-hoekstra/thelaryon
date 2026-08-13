"use client"

import Link from "next/link"
import { useState } from "react"

import { CardImage } from "@/components/cards/card-image"
import { CardQuickActions } from "@/components/cards/card-quick-actions"
import { CardTilt } from "@/components/cards/card-tilt"
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
  const artFaces =
    card.faces?.filter(
      (face) => face.image.normal ?? face.image.small ?? face.image.large,
    ) ?? []
  const isDoubleFaced = artFaces.length >= 2
  const [faceIndex, setFaceIndex] = useState(0)

  const activeFace = isDoubleFaced ? artFaces[faceIndex] : null
  const imageSrc =
    activeFace?.image.normal ??
    activeFace?.image.small ??
    card.image.normal ??
    card.image.small
  const imageAlt = activeFace?.name ?? card.name

  const euroPrice = formatEuroPrice(card.prices.eur, locale)
  const foilPrice =
    card.prices.eurFoil != null
      ? formatEuroPrice(card.prices.eurFoil, locale)
      : null

  return (
    <article className="card-grid-item group flex flex-col rounded-2xl bg-surface-elevated shadow-[0_1px_0_rgba(0,0,0,0.15),0_12px_30px_-18px_rgba(0,0,0,0.55)] ring-1 ring-ink/15 transition duration-200 hover:shadow-[0_1px_0_rgba(0,0,0,0.15),0_20px_40px_-16px_rgba(0,0,0,0.7)] hover:ring-accent/40">
      <CardTilt className="z-10 rounded-2xl">
        <Link
          href={`/cards/${card.id}`}
          className="relative aspect-[5/7] block overflow-hidden rounded-2xl bg-surface"
        >
          {imageSrc ? (
            <CardImage
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-ink-soft">
              {t("card.noImage")}
            </div>
          )}

          {isDoubleFaced ? (
            <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink ring-1 ring-ink/20">
              {t("card.doubleFaced")}
            </span>
          ) : null}
        </Link>
      </CardTilt>

      {isDoubleFaced ? (
        <div className="flex gap-1 border-b border-ink/10 bg-surface/60 px-2 py-1.5">
          {artFaces.map((face, index) => (
            <button
              key={`${face.name}-${index}`}
              type="button"
              onClick={() => setFaceIndex(index)}
              className={
                index === faceIndex
                  ? "flex-1 rounded-lg bg-accent px-2 py-1 text-[11px] font-semibold text-white"
                  : "flex-1 rounded-lg px-2 py-1 text-[11px] font-medium text-ink-soft transition hover:bg-surface-elevated hover:text-ink"
              }
              aria-pressed={index === faceIndex}
            >
              {index === 0 ? t("card.frontFace") : t("card.backFace")}
            </button>
          ))}
        </div>
      ) : null}

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
