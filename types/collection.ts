export type CardCondition =
  | "MINT"
  | "NEAR_MINT"
  | "EXCELLENT"
  | "GOOD"
  | "LIGHT_PLAYED"
  | "PLAYED"
  | "POOR"

export type CardFinish = "NON_FOIL" | "FOIL" | "ETCHED"

export type CollectionItem = {
  id: string
  userId: string
  scryfallId: string
  name: string
  setCode: string
  setName: string
  collectorNumber: string
  quantity: number
  condition: CardCondition
  finish: CardFinish
  language: string
  purchasePrice: number | null
  purchaseDate: Date | null
  currentPrice: number | null
  image: {
    small?: string
    normal?: string
  }
  createdAt: Date
  updatedAt: Date
}

export type AddCollectionItemInput = {
  scryfallId: string
  quantity: number
  condition: CardCondition
  finish: CardFinish
  language: string
  purchasePrice?: number
  purchaseDate?: string
}

export type UpdateCollectionItemInput = {
  quantity?: number
  condition?: CardCondition
  finish?: CardFinish
  language?: string
  purchasePrice?: number | null
  purchaseDate?: string | null
}
