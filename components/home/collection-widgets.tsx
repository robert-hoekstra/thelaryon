import Link from "next/link"
import type { ReactNode } from "react"

import { CardImage } from "@/components/cards/card-image"
import type {
  FinishBreakdown,
  GainCollectionItem,
  SetCount,
  ValuedCollectionItem,
} from "@/lib/collection/insights"
import type { Locale } from "@/lib/i18n/config"
import type { MessageKey } from "@/lib/i18n/dictionaries"
import { formatEuroPrice } from "@/lib/pricing/price"
import type { CollectionItem } from "@/types/collection"
import { cn } from "@/lib/utils"

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string

type HomeCollectionWidgetsProps = {
  recentlyAdded: CollectionItem[]
  mostValuable: ValuedCollectionItem[]
  biggestGains: GainCollectionItem[]
  topSets: SetCount[]
  finishes: FinishBreakdown[]
  locale: Locale
  t: Translate
}

function WidgetShell({
  title,
  href,
  linkLabel,
  children,
  empty,
}: {
  title: string
  href?: string
  linkLabel?: string
  children: ReactNode
  empty?: string
}) {
  const isEmpty = empty != null

  return (
    <section className="flex flex-col rounded-2xl bg-surface-elevated/90 ring-1 ring-ink/10">
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {href && linkLabel ? (
          <Link
            href={href}
            className="text-xs font-medium text-accent transition hover:text-accent/80"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      {isEmpty ? (
        <p className="px-4 py-8 text-center text-sm text-ink-soft">{empty}</p>
      ) : (
        <div className="flex-1 p-2">{children}</div>
      )}
    </section>
  )
}

function CardRow({
  href,
  image,
  name,
  meta,
  value,
  valueClassName,
}: {
  href: string
  image?: string
  name: string
  meta: string
  value: string
  valueClassName?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-surface"
    >
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-surface ring-1 ring-ink/10">
        {image ? (
          <CardImage
            src={image}
            alt={name}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <p className="truncate text-xs text-ink-soft">{meta}</p>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-semibold text-gold",
          valueClassName,
        )}
      >
        {value}
      </p>
    </Link>
  )
}

function finishLabel(finish: CollectionItem["finish"], t: Translate) {
  switch (finish) {
    case "FOIL":
      return t("quickAdd.finishFoil")
    case "ETCHED":
      return t("quickAdd.finishEtched")
    default:
      return t("quickAdd.finishNonFoil")
  }
}

export function HomeCollectionWidgets({
  recentlyAdded,
  mostValuable,
  biggestGains,
  topSets,
  finishes,
  locale,
  t,
}: HomeCollectionWidgetsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <WidgetShell
          title={t("home.recentlyAdded")}
          href="/collection"
          linkLabel={t("home.viewAll")}
          empty={
            recentlyAdded.length === 0 ? t("home.widgetEmpty") : undefined
          }
        >
          <ul className="space-y-0.5">
            {recentlyAdded.map((item) => (
              <li key={item.id}>
                <CardRow
                  href={`/cards/${item.scryfallId}`}
                  image={item.image.small ?? item.image.normal}
                  name={item.name}
                  meta={`${item.setCode} · #${item.collectorNumber} · ×${item.quantity}`}
                  value={formatEuroPrice(item.currentPrice, locale)}
                />
              </li>
            ))}
          </ul>
        </WidgetShell>

        <WidgetShell
          title={t("home.mostValuable")}
          href="/collection"
          linkLabel={t("home.viewAll")}
          empty={
            mostValuable.length === 0 ? t("home.widgetEmptyPrices") : undefined
          }
        >
          <ul className="space-y-0.5">
            {mostValuable.map((item) => (
              <li key={item.id}>
                <CardRow
                  href={`/cards/${item.scryfallId}`}
                  image={item.image.small ?? item.image.normal}
                  name={item.name}
                  meta={`${item.setCode} · #${item.collectorNumber}`}
                  value={formatEuroPrice(item.unitValue, locale)}
                />
              </li>
            ))}
          </ul>
        </WidgetShell>

        <WidgetShell
          title={t("home.biggestGains")}
          empty={
            biggestGains.length === 0 ? t("home.widgetEmptyGains") : undefined
          }
        >
          <ul className="space-y-0.5">
            {biggestGains.map((item) => (
              <li key={item.id}>
                <CardRow
                  href={`/cards/${item.scryfallId}`}
                  image={item.image.small ?? item.image.normal}
                  name={item.name}
                  meta={`${item.setCode} · ×${item.quantity}`}
                  value={formatEuroPrice(item.totalGain, locale)}
                  valueClassName={
                    item.totalGain >= 0 ? "text-mana-green" : "text-mana-red"
                  }
                />
              </li>
            ))}
          </ul>
        </WidgetShell>

        <WidgetShell
          title={t("home.topSets")}
          href="/sets"
          linkLabel={t("home.viewSets")}
          empty={topSets.length === 0 ? t("home.widgetEmpty") : undefined}
        >
          <ul className="space-y-0.5">
            {topSets.map((set) => (
              <li key={set.setCode}>
                <Link
                  href={`/sets/${set.setCode.toLowerCase()}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-bold uppercase tracking-wide text-accent ring-1 ring-ink/10">
                    {set.setCode.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {set.setName}
                    </p>
                    <p className="truncate text-xs text-ink-soft">
                      {t("home.setCards", {
                        cards: set.cards,
                        unique: set.unique,
                      })}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gold">
                    {formatEuroPrice(set.value > 0 ? set.value : null, locale)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </WidgetShell>
      </div>

      {finishes.length > 0 ? (
        <section className="rounded-2xl bg-surface-elevated/90 p-4 ring-1 ring-ink/10">
          <h2 className="text-sm font-semibold text-ink">
            {t("home.finishMix")}
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {finishes.map((entry) => (
              <li
                key={entry.finish}
                className="rounded-xl bg-surface/80 px-3 py-3 ring-1 ring-ink/10"
              >
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
                  {finishLabel(entry.finish, t)}
                </p>
                <p className="mt-1 text-lg font-semibold text-ink">
                  {entry.cards}
                </p>
                <p className="text-xs text-ink-soft">
                  {t("home.finishUnique", { count: entry.unique })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
