import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { collectionItems, users } from "@/lib/db/schema"
import { areAcceptedFriends } from "@/lib/friends/service"
import { getCardsBySet, getSetByCode } from "@/lib/scryfall/client"
import type { FriendUser } from "@/types/friends"
import type { CardSet } from "@/types/set"

import { filterEligibleCards, sortByCollectorNumber } from "./eligibility"
import { calculateCompletionPercentage } from "./service"

export type SetComparisonCard = {
  scryfallId: string
  name: string
  collectorNumber: string
  rarity: string
  image?: string
  myQuantity: number
  friendQuantity: number
  status: "both" | "only_me" | "only_friend" | "neither"
}

export type SetComparisonResult = {
  set: CardSet
  friend: FriendUser
  cards: SetComparisonCard[]
  myCompletion: {
    owned: number
    total: number
    percentage: number
  }
  friendCompletion: {
    owned: number
    total: number
    percentage: number
  }
  summary: {
    bothOwn: number
    onlyMe: number
    onlyFriend: number
    neitherOwns: number
  }
  potentialTrades: {
    iNeed: SetComparisonCard[]
    theyNeed: SetComparisonCard[]
  }
}

type CollectionMap = Map<string, number>

async function loadUserCollectionForSet(
  userId: string,
): Promise<CollectionMap> {
  const items = await db
    .select({
      scryfallId: collectionItems.scryfallId,
      quantity: collectionItems.quantity,
    })
    .from(collectionItems)
    .where(eq(collectionItems.userId, userId))

  const map = new Map<string, number>()

  for (const item of items) {
    const existing = map.get(item.scryfallId) ?? 0
    map.set(item.scryfallId, existing + item.quantity)
  }

  return map
}

async function getUserById(userId: string): Promise<FriendUser | null> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return rows[0] ?? null
}

export async function compareSetCollections(
  myUserId: string,
  friendUserId: string,
  setCode: string,
): Promise<SetComparisonResult | null> {
  // Check friendship
  const areFriends = await areAcceptedFriends(myUserId, friendUserId)
  if (!areFriends) {
    return null
  }

  const friend = await getUserById(friendUserId)
  if (!friend) {
    return null
  }

  // Load set and cards
  const [set, allCards] = await Promise.all([
    getSetByCode(setCode),
    getCardsBySet(setCode),
  ])

  const eligibleCards = filterEligibleCards(allCards)
  const sortedCards = sortByCollectorNumber(eligibleCards)

  // Load both users' collections
  const [myCollection, friendCollection] = await Promise.all([
    loadUserCollectionForSet(myUserId),
    loadUserCollectionForSet(friendUserId),
  ])

  // Compare cards
  const cards: SetComparisonCard[] = []
  let bothOwn = 0
  let onlyMe = 0
  let onlyFriend = 0
  let neitherOwns = 0
  let myOwned = 0
  let friendOwned = 0

  const iNeed: SetComparisonCard[] = []
  const theyNeed: SetComparisonCard[] = []

  for (const card of sortedCards) {
    const myQty = myCollection.get(card.id) ?? 0
    const friendQty = friendCollection.get(card.id) ?? 0

    let status: SetComparisonCard["status"]
    if (myQty > 0 && friendQty > 0) {
      status = "both"
      bothOwn++
    } else if (myQty > 0) {
      status = "only_me"
      onlyMe++
    } else if (friendQty > 0) {
      status = "only_friend"
      onlyFriend++
    } else {
      status = "neither"
      neitherOwns++
    }

    if (myQty > 0) myOwned++
    if (friendQty > 0) friendOwned++

    const comparisonCard: SetComparisonCard = {
      scryfallId: card.id,
      name: card.name,
      collectorNumber: card.collectorNumber,
      rarity: card.rarity,
      image: card.image.normal ?? card.image.small,
      myQuantity: myQty,
      friendQuantity: friendQty,
      status,
    }

    cards.push(comparisonCard)

    // Identify potential trade opportunities
    // I need: cards I don't have that friend has extras of (qty >= 2)
    if (myQty === 0 && friendQty >= 2) {
      iNeed.push(comparisonCard)
    }
    // They need: cards they don't have that I have extras of (qty >= 2)
    if (friendQty === 0 && myQty >= 2) {
      theyNeed.push(comparisonCard)
    }
  }

  const totalCards = sortedCards.length

  return {
    set,
    friend,
    cards,
    myCompletion: {
      owned: myOwned,
      total: totalCards,
      percentage: calculateCompletionPercentage(myOwned, totalCards),
    },
    friendCompletion: {
      owned: friendOwned,
      total: totalCards,
      percentage: calculateCompletionPercentage(friendOwned, totalCards),
    },
    summary: {
      bothOwn,
      onlyMe,
      onlyFriend,
      neitherOwns,
    },
    potentialTrades: {
      iNeed,
      theyNeed,
    },
  }
}

export type CollectionComparisonSummary = {
  friend: FriendUser
  myTotalCards: number
  myUniqueCards: number
  friendTotalCards: number
  friendUniqueCards: number
  bothOwn: number
  onlyMe: number
  onlyFriend: number
}

export async function compareFullCollections(
  myUserId: string,
  friendUserId: string,
): Promise<CollectionComparisonSummary | null> {
  const areFriends = await areAcceptedFriends(myUserId, friendUserId)
  if (!areFriends) {
    return null
  }

  const friend = await getUserById(friendUserId)
  if (!friend) {
    return null
  }

  // Load both collections
  const [myItems, friendItems] = await Promise.all([
    db
      .select({
        scryfallId: collectionItems.scryfallId,
        quantity: collectionItems.quantity,
      })
      .from(collectionItems)
      .where(eq(collectionItems.userId, myUserId)),
    db
      .select({
        scryfallId: collectionItems.scryfallId,
        quantity: collectionItems.quantity,
      })
      .from(collectionItems)
      .where(eq(collectionItems.userId, friendUserId)),
  ])

  // Aggregate collections
  const myMap = new Map<string, number>()
  let myTotalCards = 0
  for (const item of myItems) {
    const existing = myMap.get(item.scryfallId) ?? 0
    myMap.set(item.scryfallId, existing + item.quantity)
    myTotalCards += item.quantity
  }

  const friendMap = new Map<string, number>()
  let friendTotalCards = 0
  for (const item of friendItems) {
    const existing = friendMap.get(item.scryfallId) ?? 0
    friendMap.set(item.scryfallId, existing + item.quantity)
    friendTotalCards += item.quantity
  }

  // Calculate overlap
  let bothOwn = 0
  let onlyMe = 0

  for (const scryfallId of myMap.keys()) {
    if (friendMap.has(scryfallId)) {
      bothOwn++
    } else {
      onlyMe++
    }
  }

  let onlyFriend = 0
  for (const scryfallId of friendMap.keys()) {
    if (!myMap.has(scryfallId)) {
      onlyFriend++
    }
  }

  return {
    friend,
    myTotalCards,
    myUniqueCards: myMap.size,
    friendTotalCards,
    friendUniqueCards: friendMap.size,
    bothOwn,
    onlyMe,
    onlyFriend,
  }
}
