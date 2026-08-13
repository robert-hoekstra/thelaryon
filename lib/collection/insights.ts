import type { CollectionItem } from "@/types/collection"

export type ValuedCollectionItem = CollectionItem & {
  unitValue: number
  totalValue: number
}

export type GainCollectionItem = CollectionItem & {
  unitGain: number
  totalGain: number
}

export type SetCount = {
  setCode: string
  setName: string
  cards: number
  unique: number
  value: number
}

export type FinishBreakdown = {
  finish: CollectionItem["finish"]
  cards: number
  unique: number
}

function unitValue(item: CollectionItem): number {
  return item.currentPrice ?? 0
}

export function getRecentlyAdded(
  items: CollectionItem[],
  limit = 8,
): CollectionItem[] {
  return [...items]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}

export function getMostValuable(
  items: CollectionItem[],
  limit = 8,
): ValuedCollectionItem[] {
  return items
    .filter((item) => item.currentPrice != null && item.currentPrice > 0)
    .map((item) => ({
      ...item,
      unitValue: unitValue(item),
      totalValue: unitValue(item) * item.quantity,
    }))
    .sort((a, b) => b.unitValue - a.unitValue || b.totalValue - a.totalValue)
    .slice(0, limit)
}

export function getBiggestGains(
  items: CollectionItem[],
  limit = 6,
): GainCollectionItem[] {
  return items
    .filter(
      (item) =>
        item.currentPrice != null &&
        item.purchasePrice != null &&
        item.currentPrice - item.purchasePrice !== 0,
    )
    .map((item) => {
      const unitGain = (item.currentPrice ?? 0) - (item.purchasePrice ?? 0)
      return {
        ...item,
        unitGain,
        totalGain: unitGain * item.quantity,
      }
    })
    .sort((a, b) => b.totalGain - a.totalGain)
    .slice(0, limit)
}

export function getTopSets(items: CollectionItem[], limit = 5): SetCount[] {
  const bySet = new Map<string, SetCount>()

  for (const item of items) {
    const existing = bySet.get(item.setCode)
    if (existing) {
      existing.cards += item.quantity
      existing.unique += 1
      existing.value += (item.currentPrice ?? 0) * item.quantity
    } else {
      bySet.set(item.setCode, {
        setCode: item.setCode,
        setName: item.setName,
        cards: item.quantity,
        unique: 1,
        value: (item.currentPrice ?? 0) * item.quantity,
      })
    }
  }

  return [...bySet.values()]
    .sort((a, b) => b.cards - a.cards || b.value - a.value)
    .slice(0, limit)
}

export function getFinishBreakdown(items: CollectionItem[]): FinishBreakdown[] {
  const byFinish = new Map<CollectionItem["finish"], FinishBreakdown>()

  for (const item of items) {
    const existing = byFinish.get(item.finish)
    if (existing) {
      existing.cards += item.quantity
      existing.unique += 1
    } else {
      byFinish.set(item.finish, {
        finish: item.finish,
        cards: item.quantity,
        unique: 1,
      })
    }
  }

  const order: CollectionItem["finish"][] = ["NON_FOIL", "FOIL", "ETCHED"]
  return order
    .map((finish) => byFinish.get(finish))
    .filter((entry): entry is FinishBreakdown => entry != null)
}
