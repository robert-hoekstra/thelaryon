"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"
import { continueBinderSeriesAction } from "@/lib/binders/actions"

type ContinueBinderButtonProps = {
  binderId: string
}

export function ContinueBinderButton({ binderId }: ContinueBinderButtonProps) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await continueBinderSeriesAction(binderId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      if (result.binderId) {
        router.push(`/binders/${result.binderId}`)
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full border border-ink/20 bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t("binders.continuing") : t("binders.continueSeries")}
      </button>
      <p className="text-xs text-ink-soft">{t("binders.continueSeriesHint")}</p>
      {error ? (
        <p className="rounded-xl bg-mana-red/15 px-3 py-2 text-sm text-mana-red ring-1 ring-mana-red/30">
          {error}
        </p>
      ) : null}
    </div>
  )
}
