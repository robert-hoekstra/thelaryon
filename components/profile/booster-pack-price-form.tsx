"use client"

import { useState, useTransition } from "react"

import { updateBoosterPackPriceAction } from "@/app/profile/actions"
import { useTranslations } from "@/components/i18n/locale-provider"
import { CARDS_PER_BOOSTER } from "@/lib/user/constants"

type BoosterPackPriceFormProps = {
  initialPrice: number | null
}

export function BoosterPackPriceForm({
  initialPrice,
}: BoosterPackPriceFormProps) {
  const t = useTranslations()
  const [value, setValue] = useState(
    initialPrice != null ? String(initialPrice) : "",
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const parsed = value.trim() === "" ? null : Number.parseFloat(value)
  const perCard =
    parsed != null && Number.isFinite(parsed) && parsed >= 0
      ? Math.round((parsed / CARDS_PER_BOOSTER) * 100) / 100
      : null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    const nextPrice =
      value.trim() === ""
        ? null
        : Number.parseFloat(value)

    if (nextPrice != null && (!Number.isFinite(nextPrice) || nextPrice < 0)) {
      setError(t("profile.boosterPriceInvalid"))
      return
    }

    startTransition(async () => {
      const result = await updateBoosterPackPriceAction({
        boosterPackPrice: nextPrice,
      })

      if (result.ok) {
        setMessage(result.message)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-surface-elevated p-5 ring-1 ring-ink/15"
    >
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-ink">
          {t("profile.boosterPriceTitle")}
        </h2>
        <p className="text-sm text-ink-soft">
          {t("profile.boosterPriceHint", { count: CARDS_PER_BOOSTER })}
        </p>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">
          {t("profile.boosterPriceLabel")}
        </span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("profile.boosterPricePlaceholder")}
          className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
        />
      </label>

      {perCard != null ? (
        <p className="text-sm text-ink-soft">
          {t("profile.boosterPricePerCard", {
            price: perCard.toFixed(2),
          })}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl bg-mana-green/15 px-3 py-2 text-sm text-mana-green ring-1 ring-mana-green/30">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-mana-red/15 px-3 py-2 text-sm text-mana-red ring-1 ring-mana-red/30">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t("profile.boosterPriceSaving") : t("profile.boosterPriceSave")}
      </button>
    </form>
  )
}
