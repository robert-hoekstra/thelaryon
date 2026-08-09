import type { Card } from "@/types/card"
import type { ScryfallCard, ScryfallImageUris } from "./types"

function parsePrice(value: string | null | undefined): number | null {
  if (value == null || value === "") {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function resolveImageUris(card: ScryfallCard): ScryfallImageUris | undefined {
  if (card.image_uris) {
    return card.image_uris
  }

  return card.card_faces?.find((face) => face.image_uris)?.image_uris
}

export function mapScryfallCard(card: ScryfallCard): Card {
  const images = resolveImageUris(card)

  return {
    id: card.id,
    name: card.name,
    setCode: card.set.toUpperCase(),
    setName: card.set_name,
    collectorNumber: card.collector_number,
    rarity: card.rarity,
    image: {
      small: images?.small,
      normal: images?.normal,
      large: images?.large,
    },
    prices: {
      eur: parsePrice(card.prices.eur),
      eurFoil: parsePrice(card.prices.eur_foil),
      usd: parsePrice(card.prices.usd),
      usdFoil: parsePrice(card.prices.usd_foil),
    },
    finishes: card.finishes ?? [],
  }
}
