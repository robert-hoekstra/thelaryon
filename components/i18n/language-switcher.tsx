"use client"

import { useTransition } from "react"

import { setLocaleAction } from "@/app/actions/set-locale"
import { useLocale } from "@/components/i18n/locale-provider"
import type { Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

const options: { value: Locale; labelKey: "profile.languageEn" | "profile.languageNl" }[] =
  [
    { value: "en", labelKey: "profile.languageEn" },
    { value: "nl", labelKey: "profile.languageNl" },
  ]

type LanguageSwitcherProps = {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, t } = useLocale()
  const [isPending, startTransition] = useTransition()

  function select(next: Locale) {
    if (next === locale) return
    startTransition(async () => {
      await setLocaleAction(next)
    })
  }

  if (compact) {
    return (
      <div
        role="group"
        aria-label={t("nav.language")}
        className="flex items-center rounded-full bg-surface-elevated p-0.5 text-[11px] font-semibold ring-1 ring-ink/15"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={isPending}
            onClick={() => select(option.value)}
            className={cn(
              "rounded-full px-2 py-1 uppercase transition",
              locale === option.value
                ? "bg-accent text-white"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {option.value}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-2xl bg-surface-elevated p-5 ring-1 ring-ink/15">
      <div>
        <h2 className="text-sm font-semibold text-ink">{t("profile.language")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t("profile.languageHint")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={isPending}
            onClick={() => select(option.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60",
              locale === option.value
                ? "bg-accent text-white"
                : "border border-ink/20 bg-surface text-ink hover:border-accent/40",
            )}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}
