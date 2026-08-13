import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CardDetails } from "@/components/cards/card-details"
import { AddToCollectionForm } from "@/components/collection/add-to-collection-form"
import { QuickAddToCollection } from "@/components/collection/quick-add-to-collection"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"
import { getCardById, ScryfallApiError } from "@/lib/scryfall/client"
import { getDefaultCardPurchasePrice } from "@/lib/user/service"

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

  let defaultPurchasePrice: number | undefined

  if (session?.user) {
    const userId = await ensureAppUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
    defaultPurchasePrice = await getDefaultCardPurchasePrice(userId)
  }

  return (
    <div className="space-y-6">
      <Link
        href="/search"
        className="inline-flex text-sm font-medium text-accent transition hover:text-accent/80"
      >
        {t("card.backToSearch")}
      </Link>

      <CardDetails
        card={card}
        actions={
          session?.user ? (
            <QuickAddToCollection card={card} />
          ) : (
            <div className="rounded-2xl bg-surface-elevated p-4 text-center ring-1 ring-ink/15 sm:text-left">
              <p className="text-sm text-ink-soft">{t("card.loginPrompt")}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/85"
                >
                  {t("card.signIn")}
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center rounded-full border border-ink/25 bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-elevated"
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
          <AddToCollectionForm
            card={card}
            defaultPurchasePrice={defaultPurchasePrice}
          />
        </div>
      ) : null}
    </div>
  )
}
