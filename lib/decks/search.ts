import type { PreconDeckSummary } from "@/types/deck"
import type { MtgjsonDeckListEntry } from "@/lib/mtgjson/types"

import { mapDeckListEntry } from "./map"

const EXCLUDED_TYPES = new Set([
  "Arena Promotional Deck",
  "Arena Starter Deck",
  "Arena Starter Kit",
  "Bundle Land Pack",
  "Deck Builder's Toolkit",
  "MTGO Commander Deck",
  "MTGO Duel Deck",
  "MTGO Redemption",
  "MTGO Theme Deck",
  "Sample Deck",
  "San Diego Comic Con Promos",
  "Secret Lair Drop",
  "Shandalar Enemy Deck",
])

export const PRECON_SEARCH_LIMIT = 30

export function isSearchablePreconType(type: string): boolean {
  return !EXCLUDED_TYPES.has(type)
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function scoreDeck(deck: PreconDeckSummary, query: string): number | null {
  const name = normalize(deck.name)
  const code = normalize(deck.code)
  const type = normalize(deck.type)
  const fileName = normalize(deck.fileName)

  if (name === query) return 400
  if (name.startsWith(query)) return 300
  if (code === query) return 250
  if (name.includes(query)) return 200
  if (fileName.includes(query.replaceAll(" ", ""))) return 150
  if (type.includes(query)) return 80
  if (code.includes(query)) return 60
  return null
}

export function searchPreconDeckList(
  entries: MtgjsonDeckListEntry[],
  query: string,
  limit = PRECON_SEARCH_LIMIT,
): PreconDeckSummary[] {
  const trimmed = normalize(query)
  if (!trimmed) {
    return []
  }

  return entries
    .filter((entry) => isSearchablePreconType(entry.type))
    .map(mapDeckListEntry)
    .map((deck) => ({ deck, score: scoreDeck(deck, trimmed) }))
    .filter(
      (item): item is { deck: PreconDeckSummary; score: number } =>
        item.score != null,
    )
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      const aDate = a.deck.releaseDate ?? ""
      const bDate = b.deck.releaseDate ?? ""
      if (aDate !== bDate) {
        return bDate.localeCompare(aDate)
      }

      return a.deck.name.localeCompare(b.deck.name)
    })
    .slice(0, limit)
    .map((item) => item.deck)
}
