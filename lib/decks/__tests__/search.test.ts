import { describe, expect, it } from "vitest"

import type { MtgjsonDeckListEntry } from "@/lib/mtgjson/types"

import { isSearchablePreconType, searchPreconDeckList } from "../search"

function entry(
  overrides: Partial<MtgjsonDeckListEntry> = {},
): MtgjsonDeckListEntry {
  return {
    code: "TDC",
    fileName: "AbzanArmor_TDC",
    name: "Abzan Armor",
    releaseDate: "2025-04-11",
    type: "Commander Deck",
    ...overrides,
  }
}

describe("isSearchablePreconType", () => {
  it("includes commander decks", () => {
    expect(isSearchablePreconType("Commander Deck")).toBe(true)
  })

  it("excludes digital and non-deck products", () => {
    expect(isSearchablePreconType("Secret Lair Drop")).toBe(false)
    expect(isSearchablePreconType("MTGO Redemption")).toBe(false)
    expect(isSearchablePreconType("Arena Starter Deck")).toBe(false)
  })
})

describe("searchPreconDeckList", () => {
  const entries = [
    entry(),
    entry({
      fileName: "JeskaiStriker_TDC",
      name: "Jeskai Striker",
      releaseDate: "2025-04-11",
    }),
    entry({
      code: "FIC",
      fileName: "LimitBreak_FIC",
      name: "Limit Break",
      releaseDate: "2025-06-13",
    }),
    entry({
      type: "Secret Lair Drop",
      fileName: "Secret_SLD",
      name: "Abzan Armor",
    }),
  ]

  it("ranks exact name matches first", () => {
    const results = searchPreconDeckList(entries, "Abzan Armor")
    expect(results[0]?.fileName).toBe("AbzanArmor_TDC")
  })

  it("matches set codes and ignores excluded types", () => {
    const results = searchPreconDeckList(entries, "tdc")
    expect(results.map((deck) => deck.fileName)).toEqual([
      "AbzanArmor_TDC",
      "JeskaiStriker_TDC",
    ])
  })

  it("returns nothing for an empty query", () => {
    expect(searchPreconDeckList(entries, "   ")).toEqual([])
  })
})
