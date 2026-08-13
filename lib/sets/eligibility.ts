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

type EligibilityOptions = {
  /**
   * When true, exclude cards with booster === false.
   * Only apply this when the set actually has booster printings;
   * some Universes Beyond / special sets mark every card as booster:false.
   */
  requireBooster?: boolean
}

/**
 * Determines if a card is eligible for "Main Set Completion".
 *
 * Main set completion includes:
 * - Regular numbered cards that appear in boosters (when the set has them)
 * - Cards with standard borders
 *
 * Excludes:
 * - Promo cards (buy-a-box, prerelease, etc.)
 * - Special guest cards
 * - Art cards
 * - Gold-bordered World Championship printings
 */
export function isCardEligibleForMainSetCompletion(
  card: Card,
  options: EligibilityOptions = {},
): boolean {
  const { requireBooster = false } = options

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

  // Only enforce booster membership when the set has known booster cards
  if (requireBooster && card.booster === false) {
    return false
  }

  // Exclude gold-bordered cards (e.g., World Championship decks)
  if (card.borderColor === "gold") {
    return false
  }

  return true
}

/**
 * Filters cards to only include those eligible for main set completion.
 * If any card is marked booster:true, prefer booster printings.
 * Otherwise include all non-promo cards (handles sets where Scryfall
 * marks everything as booster:false, e.g. some Universes Beyond sets).
 */
export function filterEligibleCards(cards: Card[]): Card[] {
  const baseEligible = cards.filter((card) =>
    isCardEligibleForMainSetCompletion(card, { requireBooster: false }),
  )

  const hasBoosterPrintings = baseEligible.some((card) => card.booster === true)

  if (!hasBoosterPrintings) {
    return baseEligible
  }

  return baseEligible.filter((card) =>
    isCardEligibleForMainSetCompletion(card, { requireBooster: true }),
  )
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
