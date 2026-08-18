export type MtgjsonDeckListEntry = {
  code: string
  fileName: string
  name: string
  releaseDate: string | null
  type: string
}

export type MtgjsonDeckListResponse = {
  data: MtgjsonDeckListEntry[]
}

export type MtgjsonDeckCardIdentifiers = {
  scryfallId?: string
}

export type MtgjsonDeckCard = {
  name: string
  count: number
  isFoil?: boolean
  finishes?: string[]
  language?: string
  setCode?: string
  number?: string
  identifiers?: MtgjsonDeckCardIdentifiers
}

export type MtgjsonDeck = {
  code: string
  name: string
  type: string
  releaseDate: string | null
  commander?: MtgjsonDeckCard[] | null
  mainBoard?: MtgjsonDeckCard[] | null
  sideBoard?: MtgjsonDeckCard[] | null
}

export type MtgjsonDeckResponse = {
  data: MtgjsonDeck
}
