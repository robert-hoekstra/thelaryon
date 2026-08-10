import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { collectionItems } from "@/lib/db/schema"
import { getCardsBySet, getSetByCode, getSets } from "@/lib/scryfall/client"
import type { CardSet, SetCardOwnership, SetCompletion } from "@/types/set"

import { calculateCompletionPercentage } from "./completion"
import {
  filterEligibleCards,
  filterRelevantSets,
  sortByCollectorNumber,
} from "./eligibility"

export { calculateCompletionPercentage }

export type UserCollectionMap = Map<
  string,
  { quantity: number; scryfallId: string }
>

/**
 * Loads a user's collection as a map keyed by Scryfall ID.
 * This allows efficient O(1) lookups when checking ownership.
 */
export async function loadUserCollectionMap(
  userId: string,
): Promise<UserCollectionMap> {
  const items = await db
    .select({
      scryfallId: collectionItems.scryfallId,
      quantity: collectionItems.quantity,
    })
    .from(collectionItems)
    .where(eq(collectionItems.userId, userId))

  const map = new Map<string, { quantity: number; scryfallId: string }>()

  for (const item of items) {
    const existing = map.get(item.scryfallId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      map.set(item.scryfallId, {
        scryfallId: item.scryfallId,
        quantity: item.quantity,
      })
    }
  }

  return map
}

/**
 * Loads a user's collection for a specific set as a map.
 */
export async function loadUserCollectionBySet(
  userId: string,
): Promise<UserCollectionMap> {
  const items = await db
    .select({
      scryfallId: collectionItems.scryfallId,
      quantity: collectionItems.quantity,
    })
    .from(collectionItems)
    .where(eq(collectionItems.userId, userId))

  const map = new Map<string, { quantity: number; scryfallId: string }>()

  for (const item of items) {
    const existing = map.get(item.scryfallId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      map.set(item.scryfallId, {
        scryfallId: item.scryfallId,
        quantity: item.quantity,
      })
    }
  }

  return map
}

/**
 * Gets all relevant sets with completion data for a user.
 * Note: For performance, completion data is approximated here.
 * Detailed completion is calculated on the set detail page.
 */
export async function getSetsWithCompletion(): Promise<SetCompletion[]> {
  const allSets = await getSets()
  const relevantSets = filterRelevantSets(allSets)

  // Sort by release date (newest first)
  const sortedSets = relevantSets.sort((a, b) => {
    if (!a.releasedAt && !b.releasedAt) return 0
    if (!a.releasedAt) return 1
    if (!b.releasedAt) return -1
    return new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()
  })

  // Return sets with placeholder completion data
  // Actual completion is calculated via getSetsCompletionSummary for efficiency
  return sortedSets.map((set) => ({
    set,
    totalEligibleCards: set.cardCount,
    ownedCount: 0,
    missingCount: set.cardCount,
    completionPercentage: 0,
  }))
}

/**
 * Gets detailed completion data for a specific set.
 */
export async function getSetCompletionDetail(
  setCode: string,
  userId: string | null,
): Promise<{
  set: CardSet
  cards: SetCardOwnership[]
  totalEligibleCards: number
  ownedCount: number
  missingCount: number
  completionPercentage: number
}> {
  const [set, allCards] = await Promise.all([
    getSetByCode(setCode),
    getCardsBySet(setCode),
  ])

  const eligibleCards = filterEligibleCards(allCards)
  const sortedCards = sortByCollectorNumber(eligibleCards)

  let collectionMap: UserCollectionMap = new Map()
  if (userId) {
    collectionMap = await loadUserCollectionMap(userId)
  }

  const cards: SetCardOwnership[] = sortedCards.map((card) => {
    const owned = collectionMap.get(card.id)
    return {
      scryfallId: card.id,
      name: card.name,
      collectorNumber: card.collectorNumber,
      rarity: card.rarity,
      image: card.image.normal ?? card.image.small,
      owned: owned != null && owned.quantity > 0,
      quantity: owned?.quantity ?? 0,
    }
  })

  const ownedCount = cards.filter((c) => c.owned).length
  const totalEligibleCards = cards.length
  const missingCount = totalEligibleCards - ownedCount

  return {
    set,
    cards,
    totalEligibleCards,
    ownedCount,
    missingCount,
    completionPercentage: calculateCompletionPercentage(
      ownedCount,
      totalEligibleCards,
    ),
  }
}

/**
 * Gets completion summary for multiple sets efficiently.
 * Uses bulk loading of user collection and calculates completion per set.
 */
export async function getSetsCompletionSummary(
  userId: string,
): Promise<Map<string, { owned: number; total: number; percentage: number }>> {
  const summaryMap = new Map<
    string,
    { owned: number; total: number; percentage: number }
  >()

  // Group collection items by set code
  const items = await db
    .select({
      scryfallId: collectionItems.scryfallId,
      setCode: collectionItems.setCode,
      quantity: collectionItems.quantity,
    })
    .from(collectionItems)
    .where(eq(collectionItems.userId, userId))

  // Count unique owned cards per set
  const ownedBySet = new Map<string, Set<string>>()
  for (const item of items) {
    const normalizedSetCode = item.setCode.toUpperCase()
    if (!ownedBySet.has(normalizedSetCode)) {
      ownedBySet.set(normalizedSetCode, new Set())
    }
    ownedBySet.get(normalizedSetCode)!.add(item.scryfallId)
  }

  // Get all sets for their card counts
  const allSets = await getSets()
  const setsByCode = new Map(allSets.map((s) => [s.code, s]))

  for (const [setCode, ownedIds] of ownedBySet) {
    const set = setsByCode.get(setCode)
    if (!set) continue

    const owned = ownedIds.size
    const total = set.cardCount
    summaryMap.set(setCode, {
      owned,
      total,
      percentage: calculateCompletionPercentage(owned, total),
    })
  }

  return summaryMap
}
