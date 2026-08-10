import type { Card } from "@/types/card"
import type { CardSet } from "@/types/set"

/**
 * Set types that are relevant for collection completion tracking.
 * Excludes tokens, memorabilia, art series, minigames, etc.
 */
const RELEVANT_SET_TYPES = new Set([
  "core",
  "expansion",
  "masters",
  "draft_innovation",
  "commander",
  "starter",
  "planechase",
  "archenemy",
  "from_the_vault",
  "spellbook",
  "premium_deck",
  "duel_deck",
  "box",
  "funny",
  "masterpiece",
])

/**
 * Determines if a set type is relevant for normal collection tracking.
 * Filters out tokens, memorabilia, art series, etc.
 */
export function isRelevantSetType(setType: string): boolean {
  return RELEVANT_SET_TYPES.has(setType)
}

/**
 * Filters sets to only include those relevant for collection tracking.
 */
export function filterRelevantSets(sets: CardSet[]): CardSet[] {
  return sets.filter(
    (set) => isRelevantSetType(set.setType) && !set.digital,
  )
}

/**
 * Determines if a card is eligible for "Main Set Completion".
 * 
 * Main set completion includes:
 * - Regular numbered cards that appear in boosters
 * - Cards with standard borders
 * 
 * Excludes:
 * - Promo cards (buy-a-box, prerelease, etc.)
 * - Special guest cards
 * - Bonus sheet cards (typically high collector numbers)
 * - Art cards
 * - Extended art / borderless variants (often in collector boosters only)
 * 
 * This function can be extended later to support different completion modes
 * (e.g., "All printings", "Master set", "Non-foil complete").
 */
export function isCardEligibleForMainSetCompletion(card: Card): boolean {
  // Exclude promo cards
  if (card.promo) {
    return false
  }

  // Exclude cards with promo types that indicate special releases
  const excludedPromoTypes = [
    "buyabox",
    "prerelease",
    "promopak",
    "bundle",
    "gameday",
    "release",
    "datestamped",
    "serialized",
    "surgefoil",
    "galaxyfoil",
  ]
  
  if (card.promoTypes?.some((type) => excludedPromoTypes.includes(type))) {
    return false
  }

  // Exclude non-English cards (for main set, we typically track English)
  if (card.lang && card.lang !== "en") {
    return false
  }

  // Include cards that appear in boosters (best indicator for main set)
  // If booster field is undefined, we include the card (older sets may not have this field)
  if (card.booster === false) {
    return false
  }

  // Exclude gold-bordered cards (e.g., World Championship decks)
  if (card.borderColor === "gold") {
    return false
  }

  // Exclude silver-bordered cards (un-sets joke cards when not tracking the un-set itself)
  // Note: We allow silver borders for sets that are specifically silver-bordered (funny sets)
  // This is handled at the set level, not card level

  return true
}

/**
 * Filters cards to only include those eligible for main set completion.
 */
export function filterEligibleCards(cards: Card[]): Card[] {
  return cards.filter(isCardEligibleForMainSetCompletion)
}

/**
 * Sorts cards by collector number for display.
 * Handles numeric and alphanumeric collector numbers.
 */
export function sortByCollectorNumber(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const aNum = parseInt(a.collectorNumber, 10)
    const bNum = parseInt(b.collectorNumber, 10)

    // Both numeric - compare as numbers
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      return aNum - bNum
    }

    // Mixed or both non-numeric - compare as strings
    return a.collectorNumber.localeCompare(b.collectorNumber, undefined, {
      numeric: true,
    })
  })
}
