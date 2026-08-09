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
      className="space-y-4 rounded-2xl bg-white/90 p-5 ring-1 ring-ink/8"
    >
      <div>
        <h2 className="text-base font-semibold text-ink">{t("friends.addTitle")}</h2>
        <p className="mt-1 text-sm text-ink/60">{t("friends.addHint")}</p>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink/80">{t("friends.email")}</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-mana-blue focus:ring-4 focus:ring-mana-blue/15"
        />
      </label>

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
        className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60"
      >
        {isPending ? t("friends.sending") : t("friends.sendRequest")}
      </button>
    </form>
  )
}
