export type CardSet = {
  id: string
  code: string
  name: string
  setType: string
  releasedAt: string | null
  cardCount: number
  iconSvgUri: string
  digital: boolean
  parentSetCode?: string
}

export type SetCompletion = {
  set: CardSet
  totalEligibleCards: number
  ownedCount: number
  missingCount: number
  completionPercentage: number
}

export type SetCardOwnership = {
  scryfallId: string
  name: string
  collectorNumber: string
  rarity: string
  image?: string
  owned: boolean
  quantity: number
}
