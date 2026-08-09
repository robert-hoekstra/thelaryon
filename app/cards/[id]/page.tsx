import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CardDetails } from "@/components/cards/card-details"
import { AddToCollectionForm } from "@/components/collection/add-to-collection-form"
import { QuickAddToCollection } from "@/components/collection/quick-add-to-collection"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"
import { getCardById, ScryfallApiError } from "@/lib/scryfall/client"

type CardPageProps = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: CardPageProps): Promise<Metadata> {
  const { id } = await params
  const t = await getTranslator()

  try {
    const card = await getCardById(id)
    return {
      title: card.name,
      description: `${card.name} · ${card.setName} · #${card.collectorNumber}`,
    }
  } catch {
    return {
      title: t("card.metadataFallbackTitle"),
    }
  }
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params
  const { data: session } = await auth.getSession()
  const t = await getTranslator()

  let card

  try {
    card = await getCardById(id)
  } catch (error) {
    if (error instanceof ScryfallApiError && error.status === 404) {
      notFound()
    }

    throw error
  }

  return (
    <div className="space-y-6">
      <Link
        href="/search"
        className="inline-flex text-sm font-medium text-mana-blue transition hover:text-mana-blue"
      >
        {t("card.backToSearch")}
      </Link>

      <CardDetails
        card={card}
        actions={
          session?.user ? (
            <QuickAddToCollection card={card} />
          ) : (
            <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-ink/8 sm:text-left">
              <p className="text-sm text-zinc-600">{t("card.loginPrompt")}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
                >
                  {t("card.signIn")}
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-400 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  {t("card.signUp")}
                </Link>
              </div>
            </div>
          )
        }
      />

      {session?.user ? (
        <div className="mx-auto max-w-5xl">
          <AddToCollectionForm card={card} />
        </div>
      ) : null}
    </div>
  )
}
