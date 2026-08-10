"use client"

import Link from "next/link"
import { useActionState } from "react"

import { useTranslations } from "@/components/i18n/locale-provider"

import { signInWithEmail } from "./actions"

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null)
  const t = useTranslations()

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("auth.signIn.title")}
        </h1>
        <p className="text-sm text-ink-soft">{t("auth.signIn.description")}</p>
      </div>

      <form
        action={formAction}
        className="space-y-4 rounded-2xl bg-surface-elevated p-5 ring-1 ring-ink/15"
      >
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">
            {t("auth.signIn.email")}
          </span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">
            {t("auth.signIn.password")}
          </span>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-4 focus:ring-accent/25"
          />
        </label>

        {state?.error ? (
          <p className="rounded-xl bg-mana-red/15 px-3 py-2 text-sm text-mana-red ring-1 ring-mana-red/30">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85 disabled:opacity-60"
        >
          {isPending ? t("auth.signIn.pending") : t("auth.signIn.submit")}
        </button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        {t("auth.signIn.noAccount")}{" "}
        <Link
          href="/auth/sign-up"
          className="font-medium text-accent hover:text-accent/80"
        >
          {t("auth.signIn.registerLink")}
        </Link>
      </p>
    </div>
  )
}
