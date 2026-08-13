"use client"

import Link from "next/link"

import { CardImage } from "@/components/cards/card-image"
import { useTranslations } from "@/components/i18n/locale-provider"
import type { Locale } from "@/lib/i18n/config"
import { formatEuroPrice } from "@/lib/pricing/price"
import type { TradeOfferCard, TradePlan } from "@/lib/trades/trade-plan"
import { cn } from "@/lib/utils"

type TradePlanViewProps = {
  plan: TradePlan
  friendName: string
  locale: Locale
  setName?: string
}

export function TradePlanView({
  plan,
  friendName,
  locale,
  setName,
}: TradePlanViewProps) {
  const t = useTranslations()
  const hasTrades = plan.theyOffer.length > 0 || plan.youOffer.length > 0

  if (!hasTrades) {
    return (
      <div className="rounded-2xl bg-surface/80 px-5 py-8 text-center ring-1 ring-ink/10">
        <h2 className="text-base font-semibold text-ink">
          {t("tradePlan.title")}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {t("tradePlan.empty", { name: friendName })}
        </p>
      </div>
    )
  }

  const balanceLabel =
    plan.valueDifference === 0
      ? t("tradePlan.balanced")
      : plan.valueDifference > 0
        ? t("tradePlan.youGiveMore", {
            amount: formatEuroPrice(plan.valueDifference, locale),
          })
        : t("tradePlan.theyGiveMore", {
            amount: formatEuroPrice(Math.abs(plan.valueDifference), locale),
          })

  return (
    <section className="space-y-4 rounded-2xl border border-accent/25 bg-accent/10 p-5 ring-1 ring-accent/15">
      <div className="space-y-1">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
          {t("tradePlan.title")}
        </h2>
        <p className="text-sm text-ink-soft">
          {setName
            ? t("tradePlan.subtitleSet", { name: friendName, set: setName })
            : t("tradePlan.subtitle", { name: friendName })}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ValueStat
          label={t("tradePlan.theyOfferValue", { name: friendName })}
          value={formatEuroPrice(plan.theyOfferValue, locale)}
          detail={t("tradePlan.cardCount", { count: plan.theyOffer.length })}
        />
        <ValueStat
          label={t("tradePlan.youOfferValue")}
          value={formatEuroPrice(plan.youOfferValue, locale)}
          detail={t("tradePlan.cardCount", { count: plan.youOffer.length })}
        />
        <ValueStat
          label={t("tradePlan.balance")}
          value={balanceLabel}
          detail={
            plan.unpricedCount > 0
              ? t("tradePlan.unpriced", { count: plan.unpricedCount })
              : t("tradePlan.allPriced")
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <TradeColumn
          title={t("tradePlan.fromFriend", { name: friendName })}
          hint={t("tradePlan.fromFriendHint")}
          cards={plan.theyOffer}
          locale={locale}
          empty={t("tradePlan.noCards")}
          accent="friend"
        />
        <TradeColumn
          title={t("tradePlan.fromYou")}
          hint={t("tradePlan.fromYouHint")}
          cards={plan.youOffer}
          locale={locale}
          empty={t("tradePlan.noCards")}
          accent="you"
        />
      </div>
    </section>
  )
}

function ValueStat({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-xl bg-surface/70 px-4 py-3 ring-1 ring-ink/10">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-soft">{detail}</p>
    </div>
  )
}

function TradeColumn({
  title,
  hint,
  cards,
  locale,
  empty,
  accent,
}: {
  title: string
  hint: string
  cards: TradeOfferCard[]
  locale: Locale
  empty: string
  accent: "you" | "friend"
}) {
  const t = useTranslations()

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="text-xs text-ink-soft">{hint}</p>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-xl bg-surface/60 px-3 py-4 text-sm text-ink-soft ring-1 ring-ink/10">
          {empty}
        </p>
      ) : (
        <ul className="space-y-2">
          {cards.map((card) => (
            <li
              key={card.scryfallId}
              className="flex gap-3 rounded-xl bg-surface/70 p-2.5 ring-1 ring-ink/10"
            >
              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-surface">
                {card.image ? (
                  <CardImage
                    src={card.image}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/cards/${card.scryfallId}`}
                  className="block truncate text-sm font-medium text-ink hover:text-accent"
                >
                  {card.name}
                </Link>
                <p className="text-xs text-ink-soft">
                  {card.setCode ? `${card.setCode.toUpperCase()} · ` : ""}#
                  {card.collectorNumber}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      accent === "friend"
                        ? "bg-gold/20 text-gold"
                        : "bg-mana-green/20 text-mana-green",
                    )}
                  >
                    {t("tradePlan.extras", { count: card.extras })}
                  </span>
                  <span className="text-xs font-semibold text-ink">
                    {formatEuroPrice(card.marketPrice, locale)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
