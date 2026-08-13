import { describe, expect, it } from "vitest"

import type { Card } from "@/types/card"

import {
  chunkCardsForVolumes,
  sortCardsForBinder,
  volumeBinderName,
} from "../sort"

function card(partial: Partial<Card> & Pick<Card, "id" | "name">): Card {
  return {
    setCode: "tst",
    setName: "Test",
    collectorNumber: "1",
    rarity: "common",
    image: {},
    prices: { eur: null, eurFoil: null, usd: null, usdFoil: null },
    finishes: [],
    ...partial,
  }
}

describe("sortCardsForBinder", () => {
  it("orders by typeline: creatures before artifacts before instants", () => {
    const cards = [
      card({
        id: "1",
        name: "Lightning Bolt",
        typeLine: "Instant",
        collectorNumber: "3",
      }),
      card({
        id: "2",
        name: "Sol Ring",
        typeLine: "Artifact",
        collectorNumber: "2",
      }),
      card({
        id: "3",
        name: "Grizzly Bears",
        typeLine: "Creature — Bear",
        collectorNumber: "1",
      }),
    ]

    const sorted = sortCardsForBinder(cards, "typeline")
    expect(sorted.map((c) => c.name)).toEqual([
      "Grizzly Bears",
      "Sol Ring",
      "Lightning Bolt",
    ])
  })

  it("orders by collector number", () => {
    const cards = [
      card({ id: "a", name: "B", collectorNumber: "10" }),
      card({ id: "b", name: "A", collectorNumber: "2" }),
    ]
    const sorted = sortCardsForBinder(cards, "collector_number")
    expect(sorted.map((c) => c.collectorNumber)).toEqual(["2", "10"])
  })
})

describe("chunkCardsForVolumes", () => {
  it("splits overflow across binders", () => {
    const cards = [1, 2, 3, 4, 5]
    expect(chunkCardsForVolumes(cards, 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it("keeps a single volume when everything fits", () => {
    expect(chunkCardsForVolumes([1, 2, 3], 10)).toEqual([[1, 2, 3]])
  })
})

describe("volumeBinderName", () => {
  it("appends volume suffix only when needed", () => {
    expect(volumeBinderName("Marvel", 1, 1)).toBe("Marvel")
    expect(volumeBinderName("Marvel", 2, 3)).toBe("Marvel (2/3)")
  })
})
