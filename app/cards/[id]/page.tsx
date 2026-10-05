import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CardDetails } from "@/components/cards/card-details"
import { AddToCollectionForm } from "@/components/collection/add-to-collection-form"
import { QuickAddToCollection } from "@/components/collection/quick-add-to-collection"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { requirePageSession } from "@/lib/auth/require-page-session"
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
      robots: { index: false, follow: false },
    }
  } catch {
    return {
      title: t("card.metadataFallbackTitle"),
      robots: { index: false, follow: false },
    }
  }
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params
  const session = await requirePageSession()
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

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })
  const defaultPurchasePrice = await getDefaultCardPurchasePrice(userId)

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
        actions={<QuickAddToCollection card={card} />}
      />

      <div className="mx-auto max-w-5xl">
        <AddToCollectionForm
          card={card}
          defaultPurchasePrice={defaultPurchasePrice}
        />
      </div>
    </div>
  )
}
