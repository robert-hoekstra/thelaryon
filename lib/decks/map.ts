import type { CardFinish } from "@/types/collection"
import type {
  PreconDeck,
  PreconDeckCard,
  PreconDeckCardRole,
  PreconDeckSummary,
} from "@/types/deck"
import type { MtgjsonDeck, MtgjsonDeckCard, MtgjsonDeckListEntry } from "@/lib/mtgjson/types"

const LANGUAGE_CODES: Record<string, string> = {
  english: "en",
  spanish: "es",
  french: "fr",
  german: "de",
  italian: "it",
  japanese: "ja",
  korean: "ko",
  russian: "ru",
  portuguese: "pt",
  "portuguese (brazil)": "pt",
  "chinese simplified": "zhs",
  "chinese traditional": "zht",
  phyrexian: "ph",
}

export function mapDeckListEntry(
  entry: MtgjsonDeckListEntry,
): PreconDeckSummary {
  return {
    fileName: entry.fileName,
    name: entry.name,
    code: entry.code,
    type: entry.type,
    releaseDate: entry.releaseDate,
  }
}

export function mapLanguage(value: string | undefined): string {
  if (!value) {
    return "en"
  }

  const mapped = LANGUAGE_CODES[value.trim().toLowerCase()]
  return mapped ?? "en"
}

export function mapFinish(card: MtgjsonDeckCard): CardFinish {
  const finishes = card.finishes ?? []

  if (card.isFoil && finishes.includes("etched")) {
    return "ETCHED"
  }

  if (card.isFoil) {
    return "FOIL"
  }

  return "NON_FOIL"
}

function mapDeckCard(
  card: MtgjsonDeckCard,
  role: PreconDeckCardRole,
): PreconDeckCard | null {
  const scryfallId = card.identifiers?.scryfallId
  const quantity = card.count

  if (!scryfallId || !Number.isInteger(quantity) || quantity < 1) {
    return null
  }

  return {
    scryfallId,
    name: card.name,
    setCode: (card.setCode ?? "").toUpperCase(),
    collectorNumber: card.number ?? "",
    quantity,
    finish: mapFinish(card),
    language: mapLanguage(card.language),
    role,
  }
}

function mergeKey(card: PreconDeckCard): string {
  return `${card.scryfallId}:${card.finish}:${card.language}`
}

const ROLE_PRIORITY: Record<PreconDeckCardRole, number> = {
  commander: 0,
  mainboard: 1,
  sideboard: 2,
}

function mergeCards(cards: PreconDeckCard[]): PreconDeckCard[] {
  const merged = new Map<string, PreconDeckCard>()

  for (const card of cards) {
    const key = mergeKey(card)
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, { ...card })
      continue
    }

    existing.quantity += card.quantity
    if (ROLE_PRIORITY[card.role] < ROLE_PRIORITY[existing.role]) {
      existing.role = card.role
    }
  }

  return [...merged.values()]
}

export function mapMtgjsonDeck(
  deck: MtgjsonDeck,
  fileName: string,
): PreconDeck {
  const mapped = [
    ...(deck.commander ?? []).map((card) => mapDeckCard(card, "commander")),
    ...(deck.mainBoard ?? []).map((card) => mapDeckCard(card, "mainboard")),
    ...(deck.sideBoard ?? []).map((card) => mapDeckCard(card, "sideboard")),
  ].filter((card): card is PreconDeckCard => card != null)

  const cards = mergeCards(mapped)

  return {
    fileName,
    name: deck.name,
    code: deck.code,
    type: deck.type,
    releaseDate: deck.releaseDate,
    cards,
    totalCards: cards.reduce((sum, card) => sum + card.quantity, 0),
  }
}

/** Per-copy purchase price so line totals (`price * quantity`) sum close to `total`. */
export function splitPurchasePrice(
  total: number | undefined,
  quantities: number[],
): Array<number | undefined> {
  if (total == null || !Number.isFinite(total) || total < 0) {
    return quantities.map(() => undefined)
  }

  const copies = quantities.reduce((sum, quantity) => sum + quantity, 0)
  if (copies === 0) {
    return quantities.map(() => undefined)
  }

  const unit = Math.round((total / copies) * 100) / 100
  return quantities.map(() => unit)
}
