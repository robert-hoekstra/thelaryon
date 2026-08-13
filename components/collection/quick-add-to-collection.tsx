"use client"

import { useState, useTransition } from "react"

import { useLocale, useTranslations } from "@/components/i18n/locale-provider"
import { toast } from "@/components/ui/toast"
import { addToCollectionAction } from "@/lib/collection/actions"
import { formatEuroPrice, getCardPrice } from "@/lib/pricing/price"
import type { Card } from "@/types/card"
import type { CardFinish } from "@/types/collection"

function mapFinish(value: string): CardFinish | null {
  switch (value.toLowerCase()) {
    case "foil":
      return "FOIL"
    case "etched":
      return "ETCHED"
    case "nonfoil":
      return "NON_FOIL"
    default:
      return null
  }
}

type QuickAddToCollectionProps = {
  card: Card
}

export function QuickAddToCollection({ card }: QuickAddToCollectionProps) {
  const t = useTranslations()
  const { locale } = useLocale()

  const availableFinishes = card.finishes
    .map(mapFinish)
    .filter((finish): finish is CardFinish => finish != null)

  const finishes =
    availableFinishes.length > 0
      ? availableFinishes
      : (["NON_FOIL"] as CardFinish[])

  const [pendingFinish, setPendingFinish] = useState<CardFinish | null>(null)
  const [isPending, startTransition] = useTransition()

  function finishLabel(finish: CardFinish) {
    switch (finish) {
      case "FOIL":
        return t("quickAdd.finishFoil")
      case "ETCHED":
        return t("quickAdd.finishEtched")
      default:
        return t("quickAdd.finishNonFoil")
    }
  }

  function quickAdd(finish: CardFinish) {
    setPendingFinish(finish)

    startTransition(async () => {
      const result = await addToCollectionAction({
        scryfallId: card.id,
        quantity: 1,
        condition: "NEAR_MINT",
        finish,
        language: "en",
      })

      setPendingFinish(null)
      toast.fromActionResult(result)
    })
  }

  return (
    <div className="relative space-y-3 overflow-hidden rounded-2xl bg-surface-elevated p-4 text-ink shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)] ring-1 ring-ink/15">
      <div className="mana-ribbon absolute inset-x-0 top-0 opacity-90" aria-hidden />
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-gold">
          {t("quickAdd.title")}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{t("quickAdd.description")}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {finishes.map((finish) => {
          const price = getCardPrice(card, finish)
          const busy = isPending && pendingFinish === finish

          return (
            <button
              key={finish}
              type="button"
              disabled={isPending}
              onClick={() => quickAdd(finish)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {busy ? t("quickAdd.adding") : `+ ${finishLabel(finish)}`}
              {!busy ? (
                <span className="font-medium text-white/70">
                  {formatEuroPrice(price, locale)}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
