"use client"

import Link from "next/link"
import { useState, useTransition } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"
import { addToCollectionAction } from "@/lib/collection/actions"
import type { Card } from "@/types/card"
import type { CardFinish } from "@/types/collection"
import { cn } from "@/lib/utils"

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

type CardQuickActionsProps = {
  card: Card
  isAuthenticated: boolean
}

export function CardQuickActions({
  card,
  isAuthenticated,
}: CardQuickActionsProps) {
  const t = useTranslations()
  const [pendingFinish, setPendingFinish] = useState<CardFinish | null>(null)
  const [feedback, setFeedback] = useState<"ok" | "error" | null>(null)
  const [isPending, startTransition] = useTransition()

  const availableFinishes = card.finishes
    .map(mapFinish)
    .filter((finish): finish is CardFinish => finish != null)

  const finishes =
    availableFinishes.length > 0
      ? availableFinishes
      : (["NON_FOIL"] as CardFinish[])

  function finishShortLabel(finish: CardFinish) {
    switch (finish) {
      case "FOIL":
        return t("quickAdd.finishFoil")
      case "ETCHED":
        return t("quickAdd.finishEtched")
      default:
        return t("quickAdd.finishNonFoilShort")
    }
  }

  function quickAdd(finish: CardFinish) {
    setFeedback(null)
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
      setFeedback(result.ok ? "ok" : "error")

      if (result.ok) {
        window.setTimeout(() => setFeedback(null), 1800)
      }
    })
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/sign-in"
        className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-ink/25 bg-surface px-2 py-1.5 text-[11px] font-semibold text-ink transition hover:bg-surface-elevated"
      >
        {t("quickAdd.signInToAdd")}
      </Link>
    )
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {finishes.map((finish) => {
          const busy = isPending && pendingFinish === finish

          return (
            <button
              key={finish}
              type="button"
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                quickAdd(finish)
              }}
              className={cn(
                "inline-flex flex-1 items-center justify-center rounded-full bg-accent px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-60",
                finishes.length === 1 && "w-full",
              )}
            >
              {busy
                ? t("quickAdd.adding")
                : finishes.length === 1 && finish === "NON_FOIL"
                  ? t("quickAdd.addDefault")
                  : t("quickAdd.addFinish", {
                      finish: finishShortLabel(finish),
                    })}
            </button>
          )
        })}
      </div>

      {feedback === "ok" ? (
        <p className="text-[11px] font-medium text-mana-green">
          {t("quickAdd.addedCompact")}
        </p>
      ) : null}

      {feedback === "error" ? (
        <p className="text-[11px] font-medium text-mana-red">
          {t("quickAdd.failedCompact")}
        </p>
      ) : null}
    </div>
  )
}
