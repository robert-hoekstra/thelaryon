import Link from "next/link"

import { getTranslator } from "@/lib/i18n/get-locale"

export default async function NotFound() {
  const t = await getTranslator()

  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-zinc-900">
        {t("notFound.title")}
      </h1>
      <p className="text-sm text-zinc-600">{t("notFound.description")}</p>
      <Link
        href="/search"
        className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
      >
        {t("notFound.back")}
      </Link>
    </div>
  )
}
