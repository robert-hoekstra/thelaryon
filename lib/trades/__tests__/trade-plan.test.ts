import { describe, expect, it } from "vitest"

import { buildTradePlan, sumTradeValue } from "../trade-plan"

describe("sumTradeValue", () => {
  it("sums priced cards and counts gaps", () => {
    expect(
      sumTradeValue([
        { marketPrice: 1.5 },
        { marketPrice: null },
        { marketPrice: 2.25 },
      ]),
    ).toEqual({ total: 3.75, priced: 2, unpriced: 1 })
  })
})

describe("buildTradePlan", () => {
  it("computes value difference between sides", () => {
    const plan = buildTradePlan({
      theyOffer: [
        {
          scryfallId: "a",
          name: "A",
          collectorNumber: "1",
          extras: 1,
          marketPrice: 2,
        },
      ],
      youOffer: [
        {
          scryfallId: "b",
          name: "B",
          collectorNumber: "2",
          extras: 1,
          marketPrice: 5,
        },
      ],
    })

    expect(plan.theyOfferValue).toBe(2)
    expect(plan.youOfferValue).toBe(5)
    expect(plan.valueDifference).toBe(3)
  })
})
