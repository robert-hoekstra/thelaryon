import { describe, expect, it } from "vitest"

import {
  calculateCompletionPercentage,
  formatCompletionPercentage,
  getQuantityOwned,
  isOwnedInCollection,
} from "../completion"

describe("calculateCompletionPercentage", () => {
  it("calculates percentage correctly", () => {
    expect(calculateCompletionPercentage(174, 190)).toBe(91.6)
  })

  it("handles 0 owned", () => {
    expect(calculateCompletionPercentage(0, 100)).toBe(0)
  })

  it("handles 100% completion", () => {
    expect(calculateCompletionPercentage(100, 100)).toBe(100)
  })

  it("handles 0 total (empty set)", () => {
    expect(calculateCompletionPercentage(0, 0)).toBe(0)
  })

  it("rounds to one decimal place", () => {
    expect(calculateCompletionPercentage(201, 318)).toBe(63.2)
  })

  it("handles small percentages", () => {
    expect(calculateCompletionPercentage(1, 1000)).toBe(0.1)
  })

  it("handles exact fractions", () => {
    expect(calculateCompletionPercentage(50, 100)).toBe(50)
    expect(calculateCompletionPercentage(25, 100)).toBe(25)
    expect(calculateCompletionPercentage(75, 100)).toBe(75)
  })
})

describe("formatCompletionPercentage", () => {
  it("formats percentage with one decimal", () => {
    expect(formatCompletionPercentage(91.6)).toBe("91.6%")
  })

  it("formats whole numbers with one decimal", () => {
    expect(formatCompletionPercentage(100)).toBe("100.0%")
  })

  it("formats zero", () => {
    expect(formatCompletionPercentage(0)).toBe("0.0%")
  })
})

describe("isOwnedInCollection", () => {
  it("returns true when card is owned with quantity > 0", () => {
    const map = new Map([["card-1", { quantity: 1 }]])
    expect(isOwnedInCollection("card-1", map)).toBe(true)
  })

  it("returns true when card is owned with quantity > 1", () => {
    const map = new Map([["card-1", { quantity: 3 }]])
    expect(isOwnedInCollection("card-1", map)).toBe(true)
  })

  it("returns false when card is not in collection", () => {
    const map = new Map<string, { quantity: number }>()
    expect(isOwnedInCollection("card-1", map)).toBe(false)
  })

  it("returns false when quantity is 0", () => {
    const map = new Map([["card-1", { quantity: 0 }]])
    expect(isOwnedInCollection("card-1", map)).toBe(false)
  })
})

describe("getQuantityOwned", () => {
  it("returns quantity when card is owned", () => {
    const map = new Map([["card-1", { quantity: 3 }]])
    expect(getQuantityOwned("card-1", map)).toBe(3)
  })

  it("returns 0 when card is not in collection", () => {
    const map = new Map<string, { quantity: number }>()
    expect(getQuantityOwned("card-1", map)).toBe(0)
  })
})
