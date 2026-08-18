import type { Metadata } from "next"
import Link from "next/link"

import { AddPreconDeck } from "@/components/collection/add-precon-deck"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t("precon.title") }
}

export const dynamic = "force-dynamic"

export default async function AddPreconDeckPage() {
  const { data: session } = await auth.getSession()
  if (!session?.user) return null

  const t = await getTranslator()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/collection"
          className="inline-flex text-sm font-medium text-accent hover:text-accent/80"
        >
          {t("precon.back")}
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("precon.title")}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          {t("precon.description")}
        </p>
      </div>

      <AddPreconDeck />
    </div>
  )
}
