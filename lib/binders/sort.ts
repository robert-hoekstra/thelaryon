import type { Card } from "@/types/card"

export type BinderSortOrder =
  | "collector_number"
  | "typeline"
  | "color"
  | "rarity"
  | "cmc"
  | "name"

/**
 * Primary type buckets for binder organization.
 * Order matches a common physical binder layout:
 * creatures → artifacts → enchantments → planeswalkers → battles →
 * instants → sorceries → lands → other.
 */
const TYPE_ORDER = [
  "creature",
  "artifact",
  "enchantment",
  "planeswalker",
  "battle",
  "instant",
  "sorcery",
  "land",
  "other",
] as const

type TypeBucket = (typeof TYPE_ORDER)[number]

const COLOR_ORDER = ["W", "U", "B", "R", "G"] as const

const RARITY_ORDER: Record<string, number> = {
  mythic: 0,
  rare: 1,
  uncommon: 2,
  common: 3,
  special: 4,
  bonus: 5,
}

function compareCollectorNumber(a: string, b: string): number {
  const aNum = Number.parseInt(a, 10)
  const bNum = Number.parseInt(b, 10)

  if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
    return aNum - bNum
  }

  return a.localeCompare(b, undefined, { numeric: true })
}

function getTypeBucket(typeLine: string | undefined): TypeBucket {
  const line = (typeLine ?? "").toLowerCase()

  // Check permanent types before spell types; lands after other permanents
  // so dual-typed cards (e.g. Artifact Creature) land in the earlier bucket.
  if (line.includes("creature")) return "creature"
  if (line.includes("planeswalker")) return "planeswalker"
  if (line.includes("battle")) return "battle"
  if (line.includes("land")) return "land"
  if (line.includes("artifact")) return "artifact"
  if (line.includes("enchantment")) return "enchantment"
  if (line.includes("instant")) return "instant"
  if (line.includes("sorcery")) return "sorcery"
  return "other"
}

function typeRank(typeLine: string | undefined): number {
  return TYPE_ORDER.indexOf(getTypeBucket(typeLine))
}

/**
 * WUBRG mono first (by pip), then multicolor, then colorless.
 * Lands without other colors sort after colorless.
 */
function colorRank(card: Card): number {
  const identity = card.colorIdentity?.length
    ? card.colorIdentity
    : (card.colors ?? [])
  const typeLine = (card.typeLine ?? "").toLowerCase()
  const isLand = typeLine.includes("land")

  if (identity.length === 1) {
    const idx = COLOR_ORDER.indexOf(
      identity[0] as (typeof COLOR_ORDER)[number],
    )
    return idx >= 0 ? idx : 50
  }

  if (identity.length > 1) {
    // Stable-ish multicolor key using WUBRG bitmask
    let mask = 0
    for (const c of identity) {
      const idx = COLOR_ORDER.indexOf(c as (typeof COLOR_ORDER)[number])
      if (idx >= 0) mask |= 1 << idx
    }
    return 10 + mask
  }

  return isLand ? 100 : 90
}

function rarityRank(rarity: string): number {
  return RARITY_ORDER[rarity.toLowerCase()] ?? 99
}

function secondaryByCollectorThenName(a: Card, b: Card): number {
  const byNumber = compareCollectorNumber(a.collectorNumber, b.collectorNumber)
  if (byNumber !== 0) return byNumber
  return a.name.localeCompare(b.name)
}

export function sortCardsForBinder(
  cards: Card[],
  sortOrder: BinderSortOrder,
): Card[] {
  const copy = [...cards]

  switch (sortOrder) {
    case "typeline":
      return copy.sort((a, b) => {
        const byType = typeRank(a.typeLine) - typeRank(b.typeLine)
        if (byType !== 0) return byType
        const byCmc = (a.cmc ?? 0) - (b.cmc ?? 0)
        if (byCmc !== 0) return byCmc
        return secondaryByCollectorThenName(a, b)
      })

    case "color":
      return copy.sort((a, b) => {
        const byColor = colorRank(a) - colorRank(b)
        if (byColor !== 0) return byColor
        const byType = typeRank(a.typeLine) - typeRank(b.typeLine)
        if (byType !== 0) return byType
        return secondaryByCollectorThenName(a, b)
      })

    case "rarity":
      return copy.sort((a, b) => {
        const byRarity = rarityRank(a.rarity) - rarityRank(b.rarity)
        if (byRarity !== 0) return byRarity
        return secondaryByCollectorThenName(a, b)
      })

    case "cmc":
      return copy.sort((a, b) => {
        const byCmc = (a.cmc ?? 0) - (b.cmc ?? 0)
        if (byCmc !== 0) return byCmc
        return secondaryByCollectorThenName(a, b)
      })

    case "name":
      return copy.sort((a, b) => {
        const byName = a.name.localeCompare(b.name)
        if (byName !== 0) return byName
        return compareCollectorNumber(a.collectorNumber, b.collectorNumber)
      })

    case "collector_number":
    default:
      return copy.sort((a, b) => secondaryByCollectorThenName(a, b))
  }
}

export function chunkCardsForVolumes<T>(
  cards: T[],
  capacityPerBinder: number,
): T[][] {
  if (capacityPerBinder <= 0) {
    throw new Error("INVALID_CAPACITY")
  }

  if (cards.length === 0) {
    return [[]]
  }

  const volumes: T[][] = []
  for (let i = 0; i < cards.length; i += capacityPerBinder) {
    volumes.push(cards.slice(i, i + capacityPerBinder))
  }
  return volumes
}

export function volumeBinderName(
  baseName: string,
  volumeIndex: number,
  volumeCount: number,
): string {
  if (volumeCount <= 1) return baseName
  return `${baseName} (${volumeIndex}/${volumeCount})`
}
