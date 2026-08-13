import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { signOutAction } from "@/app/auth/sign-out/actions"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { BoosterPackPriceForm } from "@/components/profile/booster-pack-price-form"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"
import { getUserBoosterPackPrice } from "@/lib/user/service"

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

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const t = await getTranslator()
  const boosterPackPrice = await getUserBoosterPackPrice(userId)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-ink-soft">{t("profile.description")}</p>
      </div>

      <div className="space-y-3 rounded-2xl bg-surface-elevated p-5 ring-1 ring-ink/15">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
            {t("profile.name")}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {session.user.name}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
            {t("profile.email")}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {session.user.email}
          </p>
        </div>
      </div>

      <BoosterPackPriceForm initialPrice={boosterPackPrice} />

      <LanguageSwitcher />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/collection"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85"
        >
          {t("profile.toCollection")}
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-ink/25 bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-elevated"
          >
            {t("profile.signOut")}
          </button>
        </form>
      </div>
    </div>
  )
}
