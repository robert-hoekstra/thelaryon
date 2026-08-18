import "server-only"

import type {
  MtgjsonDeck,
  MtgjsonDeckListEntry,
  MtgjsonDeckListResponse,
  MtgjsonDeckResponse,
} from "./types"

const MTGJSON_API_BASE = "https://mtgjson.com/api/v5"
const USER_AGENT = "Thelaryon/0.1 (https://thelaryon.com)"
const ACCEPT_HEADER = "application/json;q=0.9,*/*;q=0.8"

const CACHE_DURATIONS = {
  DECK_LIST: 86400,
  DECK: 86400,
} as const

export class MtgjsonApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "MtgjsonApiError"
    this.status = status
  }
}

async function mtgjsonFetch<T>(
  path: string,
  revalidate: number,
  tags: string[],
): Promise<T> {
  const response = await fetch(`${MTGJSON_API_BASE}${path}`, {
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
    throw new MtgjsonApiError(
      `MTGJSON request failed (${response.status})`,
      response.status,
    )
  }

  return (await response.json()) as T
}

export async function getDeckList(): Promise<MtgjsonDeckListEntry[]> {
  const result = await mtgjsonFetch<MtgjsonDeckListResponse>(
    "/DeckList.json",
    CACHE_DURATIONS.DECK_LIST,
    ["mtgjson-decks"],
  )

  return result.data ?? []
}

export async function getDeckByFileName(fileName: string): Promise<MtgjsonDeck> {
  const encoded = encodeURIComponent(fileName)
  const result = await mtgjsonFetch<MtgjsonDeckResponse>(
    `/decks/${encoded}.json`,
    CACHE_DURATIONS.DECK,
    [`mtgjson-deck-${fileName}`],
  )

  return result.data
}
