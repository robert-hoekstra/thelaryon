export type FriendshipStatus = "pending" | "accepted" | "declined"

export type FriendUser = {
  id: string
  name: string
  email: string
}

export type FriendshipView = {
  id: string
  status: FriendshipStatus
  direction: "outgoing" | "incoming"
  friend: FriendUser
  createdAt: Date
}

export type CollectionCompareCard = {
  scryfallId: string
  name: string
  setCode: string
  setName: string
  collectorNumber: string
  image?: string
  myQuantity: number
  friendQuantity: number
  friendExtras: number
  currentPrice: number | null
}

export type CollectionCompareResult = {
  friend: FriendUser
  missingForMe: CollectionCompareCard[]
  theirExtrasINeed: CollectionCompareCard[]
  missingForThem: CollectionCompareCard[]
  summary: {
    missingForMeCount: number
    theirExtrasINeedCount: number
    missingForThemCount: number
  }
}
