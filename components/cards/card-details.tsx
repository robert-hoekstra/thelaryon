"use client"

import { CardImage } from "@/components/cards/card-image"
import { useLocale, useTranslations } from "@/components/i18n/locale-provider"
import { formatEuroPrice } from "@/lib/pricing/price"
import type { Card } from "@/types/card"
import type { ReactNode } from "react"

type CardDetailsProps = {
  card: Card
  actions?: ReactNode
}

function formatRarity(rarity: string) {
  return rarity.replaceAll("_", " ")
}

export function CardDetails({ card, actions }: CardDetailsProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const imageSrc = card.image.large ?? card.image.normal ?? card.image.small
  const finishes =
    card.finishes.length > 0
      ? card.finishes.map((finish) => finish.replaceAll("_", " ")).join(", ")
      : t("card.unknownFinish")

  return (
    <article className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-start md:gap-8">
      <div className="relative order-2 mx-auto aspect-[5/7] w-full max-w-sm overflow-hidden rounded-2xl bg-surface shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)] ring-1 ring-ink/15 md:order-none">
        <div className="mana-ribbon absolute inset-x-0 top-0 z-10" aria-hidden />
        {imageSrc ? (
          <CardImage
            src={imageSrc}
            alt={card.name}
            fill
            priority
            sizes="(max-width: 768px) 90vw, 320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft">
            {t("card.noImage")}
          </div>
        )}
      </div>

      <div className="order-1 space-y-5 md:order-none md:space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
            {card.setCode} · #{card.collectorNumber}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink sm:text-4xl">
            {card.name}
          </h1>
          <p className="mt-2 text-base text-ink-soft">{card.setName}</p>
        </div>

        {actions}

        <dl className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-xl bg-surface/80 p-4 ring-1 ring-ink/10">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              {t("card.rarity")}
            </dt>
            <dd className="mt-1 text-sm font-semibold capitalize text-ink">
              {formatRarity(card.rarity)}
            </dd>
          </div>

          <div className="rounded-xl bg-surface/80 p-4 ring-1 ring-ink/10">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              {t("card.finishes")}
            </dt>
            <dd className="mt-1 text-sm font-semibold capitalize text-ink">
              {finishes}
            </dd>
          </div>

          <div className="rounded-xl bg-surface/80 p-4 ring-1 ring-ink/10">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              {t("card.eurPrice")}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gold">
              {formatEuroPrice(card.prices.eur, locale)}
            </dd>
          </div>

          <div className="rounded-xl bg-surface/80 p-4 ring-1 ring-ink/10">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              {t("card.eurFoil")}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gold">
              {formatEuroPrice(card.prices.eurFoil, locale)}
            </dd>
          </div>
        </dl>

        <p className="text-sm text-ink-soft">{t("card.priceDisclaimer")}</p>
      </div>
    </article>
  )
}
