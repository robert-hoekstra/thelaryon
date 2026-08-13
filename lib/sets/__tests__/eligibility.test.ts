import { describe, expect, it } from "vitest"

import type { Card } from "@/types/card"
import type { CardSet } from "@/types/set"

import {
  filterEligibleCards,
  filterRelevantSets,
  isCardEligibleForMainSetCompletion,
  isRelevantSetType,
  sortByCollectorNumber,
} from "../eligibility"

function createCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "test-id",
    name: "Test Card",
    setCode: "TST",
    setName: "Test Set",
    collectorNumber: "001",
    rarity: "common",
    image: {},
    prices: { eur: null, eurFoil: null, usd: null, usdFoil: null },
    finishes: ["nonfoil"],
    ...overrides,
  }
}

function createSet(overrides: Partial<CardSet> = {}): CardSet {
  return {
    id: "test-set-id",
    code: "TST",
    name: "Test Set",
    setType: "expansion",
    releasedAt: "2024-01-01",
    cardCount: 100,
    iconSvgUri: "https://example.com/icon.svg",
    digital: false,
    ...overrides,
  }
}

describe("isRelevantSetType", () => {
  it("returns true for expansion sets", () => {
    expect(isRelevantSetType("expansion")).toBe(true)
  })

  it("returns true for core sets", () => {
    expect(isRelevantSetType("core")).toBe(true)
  })

  it("returns true for masters sets", () => {
    expect(isRelevantSetType("masters")).toBe(true)
  })

  it("returns true for commander sets", () => {
    expect(isRelevantSetType("commander")).toBe(true)
  })

  it("returns false for token sets", () => {
    expect(isRelevantSetType("token")).toBe(false)
  })

  it("returns false for memorabilia sets", () => {
    expect(isRelevantSetType("memorabilia")).toBe(false)
  })

  it("returns false for art series sets", () => {
    expect(isRelevantSetType("art_series")).toBe(false)
  })

  it("returns false for minigame sets", () => {
    expect(isRelevantSetType("minigame")).toBe(false)
  })
})

describe("filterRelevantSets", () => {
  it("filters out non-relevant set types", () => {
    const sets = [
      createSet({ code: "EXP", setType: "expansion" }),
      createSet({ code: "TKN", setType: "token" }),
      createSet({ code: "COR", setType: "core" }),
    ]

    const filtered = filterRelevantSets(sets)

    expect(filtered).toHaveLength(2)
    expect(filtered.map((s) => s.code)).toEqual(["EXP", "COR"])
  })

  it("filters out digital-only sets", () => {
    const sets = [
      createSet({ code: "PHY", digital: false }),
      createSet({ code: "DIG", digital: true }),
    ]

    const filtered = filterRelevantSets(sets)

    expect(filtered).toHaveLength(1)
    expect(filtered[0].code).toBe("PHY")
  })
})

describe("isCardEligibleForMainSetCompletion", () => {
  it("includes regular cards", () => {
    const card = createCard()
    expect(isCardEligibleForMainSetCompletion(card)).toBe(true)
  })

  it("excludes promo cards", () => {
    const card = createCard({ promo: true })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(false)
  })

  it("excludes cards with buyabox promo type", () => {
    const card = createCard({ promoTypes: ["buyabox"] })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(false)
  })

  it("excludes cards with prerelease promo type", () => {
    const card = createCard({ promoTypes: ["prerelease"] })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(false)
  })

  it("excludes non-English cards", () => {
    const card = createCard({ lang: "ja" })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(false)
  })

  it("includes English cards explicitly", () => {
    const card = createCard({ lang: "en" })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(true)
  })

  it("includes cards not in boosters when checked alone", () => {
    const card = createCard({ booster: false })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(true)
  })

  it("excludes non-booster cards when requireBooster is set", () => {
    const card = createCard({ booster: false })
    expect(
      isCardEligibleForMainSetCompletion(card, { requireBooster: true }),
    ).toBe(false)
  })

  it("includes cards in boosters", () => {
    const card = createCard({ booster: true })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(true)
  })

  it("includes cards without booster field (older sets)", () => {
    const card = createCard({ booster: undefined })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(true)
  })

  it("excludes gold-bordered cards", () => {
    const card = createCard({ borderColor: "gold" })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(false)
  })

  it("includes black-bordered cards", () => {
    const card = createCard({ borderColor: "black" })
    expect(isCardEligibleForMainSetCompletion(card)).toBe(true)
  })
})

describe("filterEligibleCards", () => {
  it("filters out ineligible cards", () => {
    const cards = [
      createCard({ id: "1", name: "Regular Card" }),
      createCard({ id: "2", name: "Promo Card", promo: true }),
      createCard({ id: "3", name: "Another Regular" }),
    ]

    const filtered = filterEligibleCards(cards)

    expect(filtered).toHaveLength(2)
    expect(filtered.map((c) => c.name)).toEqual([
      "Regular Card",
      "Another Regular",
    ])
  })

  it("keeps booster:false cards when the set has no booster printings", () => {
    const cards = [
      createCard({ id: "1", name: "UB Card A", booster: false }),
      createCard({ id: "2", name: "UB Card B", booster: false }),
    ]

    const filtered = filterEligibleCards(cards)

    expect(filtered).toHaveLength(2)
  })

  it("prefers booster printings when the set has them", () => {
    const cards = [
      createCard({ id: "1", name: "Draft Card", booster: true }),
      createCard({ id: "2", name: "Collector Only", booster: false }),
      createCard({ id: "3", name: "Another Draft", booster: true }),
    ]

    const filtered = filterEligibleCards(cards)

    expect(filtered.map((c) => c.name)).toEqual([
      "Draft Card",
      "Another Draft",
    ])
  })
})

describe("sortByCollectorNumber", () => {
  it("sorts numeric collector numbers correctly", () => {
    const cards = [
      createCard({ collectorNumber: "10" }),
      createCard({ collectorNumber: "2" }),
      createCard({ collectorNumber: "100" }),
      createCard({ collectorNumber: "1" }),
    ]

    const sorted = sortByCollectorNumber(cards)

    expect(sorted.map((c) => c.collectorNumber)).toEqual(["1", "2", "10", "100"])
  })

  it("handles alphanumeric collector numbers", () => {
    const cards = [
      createCard({ collectorNumber: "10a" }),
      createCard({ collectorNumber: "2" }),
      createCard({ collectorNumber: "10b" }),
      createCard({ collectorNumber: "1" }),
    ]

    const sorted = sortByCollectorNumber(cards)

    expect(sorted.map((c) => c.collectorNumber)).toEqual([
      "1",
      "2",
      "10a",
      "10b",
    ])
  })

  it("does not mutate the original array", () => {
    const cards = [
      createCard({ collectorNumber: "3" }),
      createCard({ collectorNumber: "1" }),
    ]
    const original = [...cards]

    sortByCollectorNumber(cards)

    expect(cards).toEqual(original)
  })
})
