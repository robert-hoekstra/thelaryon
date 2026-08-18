import { describe, expect, it } from "vitest"

import type { MtgjsonDeck, MtgjsonDeckCard } from "@/lib/mtgjson/types"

import {
  mapFinish,
  mapLanguage,
  mapMtgjsonDeck,
  splitPurchasePrice,
} from "../map"

function card(overrides: Partial<MtgjsonDeckCard> = {}): MtgjsonDeckCard {
  return {
    name: "Sol Ring",
    count: 1,
    isFoil: false,
    finishes: ["nonfoil"],
    language: "English",
    setCode: "TDC",
    number: "10",
    identifiers: { scryfallId: "11111111-1111-1111-1111-111111111111" },
    ...overrides,
  }
}

describe("mapLanguage", () => {
  it("maps English to en", () => {
    expect(mapLanguage("English")).toBe("en")
  })

  it("defaults unknown or missing languages to en", () => {
    expect(mapLanguage(undefined)).toBe("en")
    expect(mapLanguage("Klingon")).toBe("en")
  })
})

describe("mapFinish", () => {
  it("maps foil copies to FOIL", () => {
    expect(mapFinish(card({ isFoil: true, finishes: ["foil", "nonfoil"] }))).toBe(
      "FOIL",
    )
  })

  it("maps etched foil copies to ETCHED", () => {
    expect(mapFinish(card({ isFoil: true, finishes: ["etched"] }))).toBe(
      "ETCHED",
    )
  })

  it("maps non-foil copies to NON_FOIL", () => {
    expect(mapFinish(card({ isFoil: false }))).toBe("NON_FOIL")
  })
})

describe("mapMtgjsonDeck", () => {
  it("includes commander, mainboard, and sideboard, and skips cards without a Scryfall id", () => {
    const deck: MtgjsonDeck = {
      code: "TDC",
      name: "Abzan Armor",
      type: "Commander Deck",
      releaseDate: "2025-04-11",
      commander: [card({ name: "Felothar the Steadfast", isFoil: true })],
      mainBoard: [
        card({
          name: "Command Tower",
          count: 1,
          identifiers: { scryfallId: "22222222-2222-2222-2222-222222222222" },
        }),
        card({ name: "Missing Id", identifiers: {} }),
      ],
      sideBoard: [
        card({
          name: "Forest",
          count: 2,
          identifiers: { scryfallId: "33333333-3333-3333-3333-333333333333" },
        }),
      ],
    }

    const mapped = mapMtgjsonDeck(deck, "AbzanArmor_TDC")

    expect(mapped.fileName).toBe("AbzanArmor_TDC")
    expect(mapped.totalCards).toBe(4)
    expect(mapped.cards).toHaveLength(3)
    expect(mapped.cards.map((item) => item.role)).toEqual([
      "commander",
      "mainboard",
      "sideboard",
    ])
  })

  it("merges duplicate printings with the same finish", () => {
    const id = "44444444-4444-4444-4444-444444444444"
    const deck: MtgjsonDeck = {
      code: "TDC",
      name: "Test",
      type: "Commander Deck",
      releaseDate: null,
      commander: [card({ identifiers: { scryfallId: id } })],
      mainBoard: [card({ count: 3, identifiers: { scryfallId: id } })],
    }

    const mapped = mapMtgjsonDeck(deck, "Test_TDC")

    expect(mapped.cards).toHaveLength(1)
    expect(mapped.cards[0]?.quantity).toBe(4)
    expect(mapped.cards[0]?.role).toBe("commander")
  })
})

describe("splitPurchasePrice", () => {
  it("splits a deck price evenly per copy", () => {
    expect(splitPurchasePrice(50, [1, 1, 2])).toEqual([12.5, 12.5, 12.5])
  })

  it("returns undefined prices when no total is given", () => {
    expect(splitPurchasePrice(undefined, [1, 2])).toEqual([undefined, undefined])
  })
})
