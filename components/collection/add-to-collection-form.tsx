"use client"

import { useState, useTransition } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"
import { addToCollectionAction } from "@/lib/collection/actions"
import type { Card } from "@/types/card"
import type { CardCondition, CardFinish } from "@/types/collection"

const CONDITIONS: { value: CardCondition; label: string }[] = [
  { value: "MINT", label: "Mint" },
  { value: "NEAR_MINT", label: "Near Mint" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "LIGHT_PLAYED", label: "Light Played" },
  { value: "PLAYED", label: "Played" },
  { value: "POOR", label: "Poor" },
]

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

type AddToCollectionFormProps = {
  card: Card
}

export function AddToCollectionForm({ card }: AddToCollectionFormProps) {
  const t = useTranslations()
  const availableFinishes = card.finishes
    .map(mapFinish)
    .filter((finish): finish is CardFinish => finish != null)

  const finishes =
    availableFinishes.length > 0
      ? availableFinishes
      : (["NON_FOIL"] as CardFinish[])

  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [condition, setCondition] = useState<CardCondition>("NEAR_MINT")
  const [finish, setFinish] = useState<CardFinish>(finishes[0])
  const [language, setLanguage] = useState("en")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    startTransition(async () => {
      const result = await addToCollectionAction({
        scryfallId: card.id,
        quantity,
        condition,
        finish,
        language,
        purchasePrice:
          purchasePrice.trim() === ""
            ? undefined
            : Number.parseFloat(purchasePrice),
        purchaseDate: purchaseDate || undefined,
      })

      if (result.ok) {
        setMessage(result.message)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink/8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            {t("customAdd.title")}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {t("customAdd.description")}
          </p>
        </div>
        <span className="text-sm font-semibold text-mana-blue">
          {open ? t("customAdd.close") : t("customAdd.open")}
        </span>
      </button>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border-t border-zinc-200 px-5 py-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-zinc-700">
                {t("customAdd.quantity")}
              </span>
              <input
                type="number"
                min={1}
                max={999}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-mana-blue focus:ring-4 focus:ring-mana-blue/15"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-zinc-700">
                {t("customAdd.condition")}
              </span>
              <select
                value={condition}
                onChange={(event) =>
                  setCondition(event.target.value as CardCondition)
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-mana-blue focus:ring-4 focus:ring-mana-blue/15"
              >
                {CONDITIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-zinc-700">
                {t("customAdd.finish")}
              </span>
              <select
                value={finish}
                onChange={(event) =>
                  setFinish(event.target.value as CardFinish)
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-mana-blue focus:ring-4 focus:ring-mana-blue/15"
              >
                {finishes.map((item) => (
                  <option key={item} value={item}>
                    {item === "NON_FOIL"
                      ? t("quickAdd.finishNonFoil")
                      : item === "FOIL"
                        ? t("quickAdd.finishFoil")
                        : t("quickAdd.finishEtched")}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-zinc-700">
                {t("customAdd.language")}
              </span>
              <input
                type="text"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-mana-blue focus:ring-4 focus:ring-mana-blue/15"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-zinc-700">
                {t("customAdd.purchasePrice")}
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
                placeholder={t("customAdd.optional")}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-mana-blue focus:ring-4 focus:ring-mana-blue/15"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-zinc-700">
                {t("customAdd.purchaseDate")}
              </span>
              <input
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-mana-blue focus:ring-4 focus:ring-mana-blue/15"
              />
            </label>
          </div>

          {message ? (
            <p className="rounded-xl bg-mana-green/10 px-3 py-2 text-sm text-mana-green ring-1 ring-mana-green/30">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isPending ? t("customAdd.adding") : t("customAdd.submit")}
          </button>
        </form>
      ) : null}
    </div>
  )
}
