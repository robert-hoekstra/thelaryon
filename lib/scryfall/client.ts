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

export class ScryfallApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ScryfallApiError"
    this.status = status
  }
}

async function scryfallFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${SCRYFALL_API_BASE}${path}`, {
    headers: {
      Accept: ACCEPT_HEADER,
      "User-Agent": USER_AGENT,
    },
    next: {
      revalidate: 3600,
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
    )

    return result.data.map(mapScryfallCard)
  } catch (error) {
    if (error instanceof ScryfallApiError && error.status === 404) {
      return []
    }

    throw error
  }
}

export async function getCardById(id: string): Promise<Card> {
  const card = await scryfallFetch<ScryfallCard>(`/cards/${id}`)
  return mapScryfallCard(card)
}

export async function getCardByExactName(name: string): Promise<Card> {
  const params = new URLSearchParams({
    exact: name,
  })

  const card = await scryfallFetch<ScryfallCard>(
    `/cards/named?${params.toString()}`,
  )

  return mapScryfallCard(card)
}

export async function getCardBySetAndNumber(
  setCode: string,
  collectorNumber: string,
): Promise<Card> {
  const card = await scryfallFetch<ScryfallCard>(
    `/cards/${encodeURIComponent(setCode.toLowerCase())}/${encodeURIComponent(collectorNumber)}`,
  )

  return mapScryfallCard(card)
}
