"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { CardImage } from "@/components/cards/card-image"
import { useLocale, useTranslations } from "@/components/i18n/locale-provider"
import {
  deleteCollectionItemAction,
  updateCollectionItemAction,
} from "@/lib/collection/actions"
import { formatEuroPrice } from "@/lib/pricing/price"
import type {
  CardCondition,
  CardFinish,
  CollectionItem,
} from "@/types/collection"

const CONDITIONS: { value: CardCondition; label: string }[] = [
  { value: "MINT", label: "Mint" },
  { value: "NEAR_MINT", label: "Near Mint" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "LIGHT_PLAYED", label: "Light Played" },
  { value: "PLAYED", label: "Played" },
  { value: "POOR", label: "Poor" },
]

type CollectionItemCardProps = {
  item: CollectionItem
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase()
}

export function CollectionItemCard({ item }: CollectionItemCardProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [quantity, setQuantity] = useState(item.quantity)
  const [condition, setCondition] = useState<CardCondition>(item.condition)
  const [finish, setFinish] = useState<CardFinish>(item.finish)
  const [purchasePrice, setPurchasePrice] = useState(
    item.purchasePrice != null ? String(item.purchasePrice) : "",
  )

  const imageSrc = item.image.normal ?? item.image.small

  const finishes: { value: CardFinish; label: string }[] = [
    { value: "NON_FOIL", label: t("quickAdd.finishNonFoil") },
    { value: "FOIL", label: t("quickAdd.finishFoil") },
    { value: "ETCHED", label: t("quickAdd.finishEtched") },
  ]

  function handleDelete() {
    setError(null)
    setMessage(null)

    startTransition(async () => {
      try {
        const result = await deleteCollectionItemAction(item.id)

        if (!result.ok) {
          setError(result.message)
          return
        }

        router.refresh()
      } catch {
        setError(t("collectionItem.deleteFailed"))
      }
    })
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    startTransition(async () => {
      try {
        const result = await updateCollectionItemAction(item.id, {
          quantity,
          condition,
          finish,
          purchasePrice:
            purchasePrice.trim() === ""
              ? null
              : Number.parseFloat(purchasePrice),
        })

        if (!result.ok) {
          setError(result.message)
          return
        }

        setMessage(result.message)
        setIsEditing(false)
        router.refresh()
      } catch {
        setError(t("collectionItem.updateFailed"))
      }
    })
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(24,24,27,0.04),0_12px_30px_-18px_rgba(24,24,27,0.35)] ring-1 ring-ink/8">
      <Link
        href={`/cards/${item.scryfallId}`}
        className="relative aspect-[5/7] bg-zinc-100"
      >
        {imageSrc ? (
          <CardImage
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
            {t("collectionItem.noImage")}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div>
          <h2 className="line-clamp-2 text-sm font-semibold text-zinc-900">
            {item.name}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {item.setName} · {item.setCode} · #{item.collectorNumber}
          </p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block space-y-1 text-xs">
              <span className="font-medium uppercase tracking-[0.12em] text-zinc-400">
                {t("collectionItem.quantity")}
              </span>
              <input
                type="number"
                min={1}
                max={999}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-mana-blue"
              />
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-medium uppercase tracking-[0.12em] text-zinc-400">
                {t("collectionItem.condition")}
              </span>
              <select
                value={condition}
                onChange={(event) =>
                  setCondition(event.target.value as CardCondition)
                }
                className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-mana-blue"
              >
                {CONDITIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-medium uppercase tracking-[0.12em] text-zinc-400">
                {t("collectionItem.finish")}
              </span>
              <select
                value={finish}
                onChange={(event) =>
                  setFinish(event.target.value as CardFinish)
                }
                className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-mana-blue"
              >
                {finishes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-medium uppercase tracking-[0.12em] text-zinc-400">
                {t("collectionItem.purchasePrice")}
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
                placeholder={t("collectionItem.optional")}
                className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-mana-blue"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60"
              >
                {isPending
                  ? t("collectionItem.saving")
                  : t("collectionItem.save")}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setIsEditing(false)
                  setError(null)
                  setQuantity(item.quantity)
                  setCondition(item.condition)
                  setFinish(item.finish)
                  setPurchasePrice(
                    item.purchasePrice != null
                      ? String(item.purchasePrice)
                      : "",
                  )
                }}
                className="rounded-full border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                {t("collectionItem.cancel")}
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
              <div>
                <dt className="uppercase tracking-[0.12em] text-zinc-400">
                  {t("collectionItem.qty")}
                </dt>
                <dd className="mt-0.5 font-medium text-zinc-800">
                  {item.quantity}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.12em] text-zinc-400">
                  {t("collectionItem.price")}
                </dt>
                <dd className="mt-0.5 font-medium text-zinc-800">
                  {formatEuroPrice(item.currentPrice, locale)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.12em] text-zinc-400">
                  {t("collectionItem.condition")}
                </dt>
                <dd className="mt-0.5 font-medium capitalize text-zinc-800">
                  {formatLabel(item.condition)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.12em] text-zinc-400">
                  {t("collectionItem.finish")}
                </dt>
                <dd className="mt-0.5 font-medium capitalize text-zinc-800">
                  {formatLabel(item.finish)}
                </dd>
              </div>
            </dl>

            <div className="mt-auto flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true)
                  setError(null)
                  setMessage(null)
                }}
                disabled={isPending}
                className="flex-1 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60"
              >
                {t("collectionItem.edit")}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-full border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                {isPending
                  ? t("collectionItem.deleting")
                  : t("collectionItem.delete")}
              </button>
            </div>
          </>
        )}

        {message ? (
          <p className="rounded-lg bg-mana-green/10 px-2 py-1.5 text-xs text-mana-green ring-1 ring-mana-green/30">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg bg-rose-50 px-2 py-1.5 text-xs text-rose-800 ring-1 ring-rose-200">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  )
}
