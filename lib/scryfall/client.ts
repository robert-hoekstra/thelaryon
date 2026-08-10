import "server-only"

import type { Card } from "@/types/card"
import { mapScryfallCard } from "./mapper"
import type {
  ScryfallCard,
  ScryfallErrorResponse,
  ScryfallListResponse,
} from "./types"

const SCRYFALL_API_BASE = "https://api.scryfall.com"
const USER_AGENT = "Thelaryon/0.1 (https://thelaryon.com)"
const ACCEPT_HEADER = "application/json;q=0.9,*/*;q=0.8"

/**
 * Cache durations optimized for Scryfall's data update patterns.
 * Scryfall updates prices daily around midnight UTC.
 * Card text/images rarely change (only for errata or art updates).
 */
const CACHE_DURATIONS = {
  /** Card details (text, images, metadata) - rarely changes */
  CARD_DETAILS: 86400, // 24 hours
  /** Search results - balance freshness with API efficiency */
  CARD_SEARCH: 3600, // 1 hour
  /** Fallback for any uncategorized requests */
  DEFAULT: 3600, // 1 hour
} as const

export class ScryfallApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ScryfallApiError"
    this.status = status
  }
}

type FetchOptions = {
  revalidate?: number
  tags?: string[]
}

async function scryfallFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { revalidate = CACHE_DURATIONS.DEFAULT, tags } = options

  const response = await fetch(`${SCRYFALL_API_BASE}${path}`, {
    headers: {
      Accept: ACCEPT_HEADER,
      "User-Agent": USER_AGENT,
    },
    next: {
      revalidate,
      tags,
    },
  })

  if (!response.ok) {
    let message = `Scryfall request failed (${response.status})`

    try {
      const errorBody = (await response.json()) as ScryfallErrorResponse
      if (errorBody.details) {
        message = errorBody.details
      }
    } catch {
      // Keep the default message when the body is not JSON.
    }

    throw new ScryfallApiError(message, response.status)
  }

  return (await response.json()) as T
}

/**
 * Search for cards by query string.
 * Uses shorter cache (1 hour) since search results may change
 * when new cards are added or indexed.
 */
export async function searchCards(query: string): Promise<Card[]> {
  const trimmed = query.trim()

  if (!trimmed) {
    return []
  }

  const params = new URLSearchParams({
    q: trimmed,
    unique: "prints",
    order: "name",
  })

  try {
    const result = await scryfallFetch<ScryfallListResponse>(
      `/cards/search?${params.toString()}`,
      { revalidate: CACHE_DURATIONS.CARD_SEARCH },
    )

    return result.data.map(mapScryfallCard)
  } catch (error) {
    if (error instanceof ScryfallApiError && error.status === 404) {
      return []
    }

    throw error
  }
}

/**
 * Get a single card by Scryfall ID.
 * Uses longer cache (24 hours) since card details rarely change.
 */
export async function getCardById(id: string): Promise<Card> {
  const card = await scryfallFetch<ScryfallCard>(`/cards/${id}`, {
    revalidate: CACHE_DURATIONS.CARD_DETAILS,
    tags: [`card-${id}`],
  })
  return mapScryfallCard(card)
}

/**
 * Get a card by exact name.
 * Uses longer cache (24 hours) since card details rarely change.
 */
export async function getCardByExactName(name: string): Promise<Card> {
  const params = new URLSearchParams({
    exact: name,
  })

  const card = await scryfallFetch<ScryfallCard>(
    `/cards/named?${params.toString()}`,
    { revalidate: CACHE_DURATIONS.CARD_DETAILS },
  )

  return mapScryfallCard(card)
}

/**
 * Get a card by set code and collector number.
 * Uses longer cache (24 hours) since card details rarely change.
 * Tagged by set for potential bulk invalidation when sets update.
 */
export async function getCardBySetAndNumber(
  setCode: string,
  collectorNumber: string,
): Promise<Card> {
  const normalizedSet = setCode.toLowerCase()

  const card = await scryfallFetch<ScryfallCard>(
    `/cards/${encodeURIComponent(normalizedSet)}/${encodeURIComponent(collectorNumber)}`,
    {
      revalidate: CACHE_DURATIONS.CARD_DETAILS,
      tags: [`set-${normalizedSet}`],
    },
  )

  return mapScryfallCard(card)
}
