import type { CardFinish } from "./collection"

export type PreconDeckSummary = {
  fileName: string
  name: string
  code: string
  type: string
  releaseDate: string | null
}

export type PreconDeckCardRole = "commander" | "mainboard" | "sideboard"

export type PreconDeckCard = {
  scryfallId: string
  name: string
  setCode: string
  collectorNumber: string
  quantity: number
  finish: CardFinish
  language: string
  role: PreconDeckCardRole
}

export type PreconDeck = {
  fileName: string
  name: string
  code: string
  type: string
  releaseDate: string | null
  cards: PreconDeckCard[]
  totalCards: number
}
