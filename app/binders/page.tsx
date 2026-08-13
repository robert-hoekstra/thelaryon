import type { Metadata } from "next"
import Link from "next/link"

import { BinderList } from "@/components/binders/binder-list"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { listBinders } from "@/lib/binders/service"
import { getTranslator } from "@/lib/i18n/get-locale"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator()
  return { title: t("binders.title") }
}

export const dynamic = "force-dynamic"

export default async function BindersPage() {
  const { data: session } = await auth.getSession()
  if (!session?.user) return null

  const t = await getTranslator()
  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  const binders = await listBinders(userId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
            {t("binders.title")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            {t("binders.description")}
          </p>
        </div>
        <Link
          href="/binders/new"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85"
        >
          {t("binders.create")}
        </Link>
      </div>

      <BinderList binders={binders} />
    </div>
  )
}
