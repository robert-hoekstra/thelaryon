import type { Card } from "@/types/card"
import type { CardSet } from "@/types/set"
import type { ScryfallCard, ScryfallImageUris, ScryfallSet } from "./types"

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
    borderColor: card.border_color,
    frameEffects: card.frame_effects,
    fullArt: card.full_art,
    promo: card.promo,
    promoTypes: card.promo_types,
    booster: card.booster,
    securityStamp: card.security_stamp,
    lang: card.lang,
  }
}

export function mapScryfallSet(set: ScryfallSet): CardSet {
  return {
    id: set.id,
    code: set.code.toUpperCase(),
    name: set.name,
    setType: set.set_type,
    releasedAt: set.released_at,
    cardCount: set.card_count,
    iconSvgUri: set.icon_svg_uri,
    digital: set.digital ?? false,
    parentSetCode: set.parent_set_code?.toUpperCase(),
  }
}
