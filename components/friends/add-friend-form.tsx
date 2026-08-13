"use client"

import { useState, useTransition } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"
import { toast } from "@/components/ui/toast"
import { sendFriendRequestAction } from "@/lib/friends/actions"

export function AddFriendForm() {
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const result = await sendFriendRequestAction(email)
      toast.fromActionResult(result)
      if (result.ok) {
        setEmail("")
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-surface-elevated p-5 ring-1 ring-ink/15"
    >
      <div>
        <h2 className="text-base font-semibold text-ink">{t("friends.addTitle")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t("friends.addHint")}</p>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">{t("friends.email")}</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85 disabled:opacity-60"
      >
        {isPending ? t("friends.sending") : t("friends.sendRequest")}
      </button>
    </form>
  )
}
