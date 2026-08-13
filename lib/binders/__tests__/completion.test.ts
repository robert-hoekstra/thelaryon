import { describe, expect, it } from "vitest"

import { calculateBinderProgress } from "../completion"

describe("calculateBinderProgress", () => {
  it("uses expected cards as denominator for set binders", () => {
    const progress = calculateBinderProgress(
      [
        { expectedScryfallId: "a", collectionItemId: null, collected: true },
        { expectedScryfallId: "b", collectionItemId: null, collected: true },
        { expectedScryfallId: "c", collectionItemId: null, collected: false },
        { expectedScryfallId: null, collectionItemId: null, collected: false },
      ],
      720,
    )

    expect(progress.expectedCount).toBe(3)
    expect(progress.collectedCount).toBe(2)
    expect(progress.missingCount).toBe(1)
    expect(progress.completionPercentage).toBe(66.7)
  })

  it("falls back to placed vs capacity for empty manual binders", () => {
    const progress = calculateBinderProgress(
      [
        {
          expectedScryfallId: null,
          collectionItemId: "item-1",
          collected: true,
        },
        {
          expectedScryfallId: null,
          collectionItemId: null,
          collected: false,
        },
      ],
      10,
    )

    expect(progress.expectedCount).toBe(0)
    expect(progress.placedCount).toBe(1)
    expect(progress.collectedCount).toBe(1)
    expect(progress.completionPercentage).toBe(10)
  })
})
