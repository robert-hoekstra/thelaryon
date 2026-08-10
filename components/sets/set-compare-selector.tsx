"use client"

import { useRouter } from "next/navigation"

import { useTranslations } from "@/components/i18n/locale-provider"

type SetCompareSelectorProps = {
  setCode: string
  friends: { id: string; name: string }[]
  currentCompareId?: string
}

export function SetCompareSelector({
  setCode,
  friends,
  currentCompareId,
}: SetCompareSelectorProps) {
  const t = useTranslations()
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const friendId = e.target.value
    if (friendId) {
      router.push(`/sets/${setCode}?compare=${friendId}`)
    } else {
      router.push(`/sets/${setCode}`)
    }
  }

  if (friends.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="compare-friend" className="text-sm text-ink-soft">
        {t("setDetail.compareWith")}:
      </label>
      <select
        id="compare-friend"
        value={currentCompareId ?? ""}
        onChange={handleChange}
        className="rounded-lg border border-ink/15 bg-surface-elevated px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        <option value="">{t("setDetail.selectFriend")}</option>
        {friends.map((friend) => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </div>
  )
}
