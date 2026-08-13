"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"
import { toast } from "@/components/ui/toast"
import { continueBinderSeriesAction } from "@/lib/binders/actions"

type ContinueBinderButtonProps = {
  binderId: string
}

export function ContinueBinderButton({ binderId }: ContinueBinderButtonProps) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await continueBinderSeriesAction(binderId)
      toast.fromActionResult(result)
      if (!result.ok) return
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
    </div>
  )
}
