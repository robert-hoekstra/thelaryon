import "server-only"

import { getDeckByFileName, getDeckList, MtgjsonApiError } from "@/lib/mtgjson/client"
import type { PreconDeck, PreconDeckSummary } from "@/types/deck"

import { mapMtgjsonDeck } from "./map"
import { searchPreconDeckList } from "./search"

export { MtgjsonApiError }

export const MAX_PRECON_CARDS = 400

export class PreconDeckNotFoundError extends Error {
  constructor(fileName: string) {
    super(`Preconstructed deck not found: ${fileName}`)
    this.name = "PreconDeckNotFoundError"
  }
}

export class PreconDeckTooLargeError extends Error {
  constructor(totalCards: number) {
    super(`Deck has ${totalCards} cards, which exceeds the limit.`)
    this.name = "PreconDeckTooLargeError"
  }
}

export async function searchPreconDecks(
  query: string,
): Promise<PreconDeckSummary[]> {
  const list = await getDeckList()
  return searchPreconDeckList(list, query)
}

export async function getPreconDeck(fileName: string): Promise<PreconDeck> {
  const list = await getDeckList()
  const entry = list.find((item) => item.fileName === fileName)

  if (!entry) {
    throw new PreconDeckNotFoundError(fileName)
  }

  const rawDeck = await getDeckByFileName(entry.fileName)
  const deck = mapMtgjsonDeck(rawDeck, entry.fileName)

  if (deck.totalCards > MAX_PRECON_CARDS) {
    throw new PreconDeckTooLargeError(deck.totalCards)
  }

  return deck
}
