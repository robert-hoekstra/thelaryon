"use client"

import { useRouter } from "next/navigation"

import { useTranslations } from "@/components/i18n/locale-provider"

type CompareSetFilterProps = {
  friendUserId: string
  sets: { code: string; name: string }[]
  currentSetCode: string | null
}

export function CompareSetFilter({
  friendUserId,
  sets,
  currentSetCode,
}: CompareSetFilterProps) {
  const t = useTranslations()
  const router = useRouter()

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    if (value) {
      router.push(`/friends/${friendUserId}/compare?set=${encodeURIComponent(value)}`)
    } else {
      router.push(`/friends/${friendUserId}/compare`)
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface-elevated/90 p-4 ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-ink">{t("friends.filterBySet")}</p>
        <p className="text-xs text-ink-soft">{t("friends.filterBySetHint")}</p>
      </div>
      <select
        value={currentSetCode ?? ""}
        onChange={handleChange}
        className="rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        <option value="">{t("friends.filterAllSets")}</option>
        {sets.map((set) => (
          <option key={set.code} value={set.code.toLowerCase()}>
            {set.name} ({set.code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  )
}
