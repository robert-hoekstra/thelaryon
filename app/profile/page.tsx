import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { signOutAction } from "@/app/auth/sign-out/actions"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t("profile.title") }
}

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const t = await getTranslator()

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-zinc-900">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-zinc-600">{t("profile.description")}</p>
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-ink/8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {t("profile.name")}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {session.user.name}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {t("profile.email")}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {session.user.email}
          </p>
        </div>
      </div>

      <LanguageSwitcher />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/collection"
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          {t("profile.toCollection")}
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-zinc-400 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            {t("profile.signOut")}
          </button>
        </form>
      </div>
    </div>
  )
}
