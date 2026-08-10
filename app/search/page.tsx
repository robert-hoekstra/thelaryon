import type { Metadata } from "next"

import { CardSearch } from "@/components/cards/card-search"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t("search.title") }
}

export const dynamic = "force-dynamic"

type SearchPageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const t = await getTranslator()
  const { data: session } = await auth.getSession()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
          {t("search.title")}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          {t("search.description")}
        </p>
      </div>

      <CardSearch
        initialQuery={params.q?.trim() ?? ""}
        isAuthenticated={Boolean(session?.user)}
      />
    </div>
  )
}
