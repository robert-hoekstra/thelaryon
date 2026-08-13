import type {
  Card,
  CardFace,
  CardImageUris,
  CardLegalities,
  CardLegality,
} from "@/types/card"
import type { CardSet } from "@/types/set"
import type {
  ScryfallCard,
  ScryfallCardFace,
  ScryfallImageUris,
  ScryfallLegality,
  ScryfallSet,
} from "./types"

function parsePrice(value: string | null | undefined): number | null {
  if (value == null || value === "") {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toCardImageUris(images?: ScryfallImageUris): CardImageUris {
  return {
    small: images?.small,
    normal: images?.normal,
    large: images?.large,
  }
}

function resolveImageUris(card: ScryfallCard): ScryfallImageUris | undefined {
  if (card.image_uris) {
    return card.image_uris
  }

  return card.card_faces?.find((face) => face.image_uris)?.image_uris
}

function mapLegality(value: ScryfallLegality | undefined): CardLegality | undefined {
  return value
}

function mapLegalities(
  legalities: ScryfallCard["legalities"],
): CardLegalities | undefined {
  if (!legalities) return undefined

  return {
    standard: mapLegality(legalities.standard),
    pioneer: mapLegality(legalities.pioneer),
    modern: mapLegality(legalities.modern),
    legacy: mapLegality(legalities.legacy),
    vintage: mapLegality(legalities.vintage),
    commander: mapLegality(legalities.commander),
    pauper: mapLegality(legalities.pauper),
    historic: mapLegality(legalities.historic),
    alchemy: mapLegality(legalities.alchemy),
    brawl: mapLegality(legalities.brawl),
    timeless: mapLegality(legalities.timeless),
    standardbrawl: mapLegality(legalities.standardbrawl),
    duel: mapLegality(legalities.duel),
    oldschool: mapLegality(legalities.oldschool),
    premodern: mapLegality(legalities.premodern),
    predh: mapLegality(legalities.predh),
    oathbreaker: mapLegality(legalities.oathbreaker),
    penny: mapLegality(legalities.penny),
    gladiator: mapLegality(legalities.gladiator),
  }
}

function mapFace(
  face: ScryfallCardFace,
  fallbackName: string,
): CardFace {
  return {
    name: face.name?.trim() || fallbackName,
    manaCost: face.mana_cost || undefined,
    typeLine: face.type_line || undefined,
    oracleText: face.oracle_text || undefined,
    flavorText: face.flavor_text || undefined,
    power: face.power,
    toughness: face.toughness,
    loyalty: face.loyalty,
    defense: face.defense,
    artist: face.artist || undefined,
    colors: face.colors,
    image: toCardImageUris(face.image_uris),
  }
}

function mapCardFaces(card: ScryfallCard): CardFace[] | undefined {
  if (!card.card_faces?.length) {
    return undefined
  }

  return card.card_faces.map((face) => mapFace(face, card.name))
}

export function mapScryfallCard(card: ScryfallCard): Card {
  const images = resolveImageUris(card)
  const faces = mapCardFaces(card)

  return {
    id: card.id,
    name: card.name,
    setCode: card.set.toUpperCase(),
    setName: card.set_name,
    collectorNumber: card.collector_number,
    rarity: card.rarity,
    image: toCardImageUris(images),
    faces,
    manaCost: card.mana_cost || undefined,
    cmc: card.cmc,
    typeLine: card.type_line || undefined,
    oracleText: card.oracle_text || undefined,
    flavorText: card.flavor_text || undefined,
    power: card.power,
    toughness: card.toughness,
    loyalty: card.loyalty,
    defense: card.defense,
    colors: card.colors,
    colorIdentity: card.color_identity,
    keywords: card.keywords,
    artist: card.artist || undefined,
    releasedAt: card.released_at || undefined,
    layout: card.layout || undefined,
    legalities: mapLegalities(card.legalities),
    scryfallUri: card.scryfall_uri || undefined,
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
