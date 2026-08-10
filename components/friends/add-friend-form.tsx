"use client"

import { useState, useTransition } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"
import { sendFriendRequestAction } from "@/lib/friends/actions"

export function AddFriendForm() {
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    startTransition(async () => {
      const result = await sendFriendRequestAction(email)
      if (result.ok) {
        setMessage(result.message)
        setEmail("")
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
        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85 disabled:opacity-60"
      >
        {isPending ? t("friends.sending") : t("friends.sendRequest")}
      </button>
    </form>
  )
}
