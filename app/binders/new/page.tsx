import type { Metadata } from "next"
import Link from "next/link"

import { CreateBinderForm } from "@/components/binders/create-binder-form"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"
import { getSets } from "@/lib/scryfall/client"
import { filterRelevantSets } from "@/lib/sets/eligibility"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t("binders.new.title") }
}

export const dynamic = "force-dynamic"

export default async function NewBinderPage() {
  const { data: session } = await auth.getSession()
  if (!session?.user) return null

  // Ensure the app user exists before create actions.
  await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const t = await getTranslator()
  const allSets = await getSets()
  const sets = filterRelevantSets(allSets)
    .sort((a, b) => {
      if (!a.releasedAt && !b.releasedAt) return 0
      if (!a.releasedAt) return 1
      if (!b.releasedAt) return -1
      return new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()
    })
    .map((set) => ({
      code: set.code,
      name: set.name,
      cardCount: set.cardCount,
    }))

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/binders"
          className="inline-flex text-sm font-medium text-accent hover:text-accent/80"
        >
          {t("binders.new.back")}
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("binders.new.title")}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          {t("binders.new.description")}
        </p>
      </div>

      <CreateBinderForm sets={sets} />
    </div>
  )
}
