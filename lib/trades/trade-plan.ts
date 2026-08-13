export type TradeOfferCard = {
  scryfallId: string
  name: string
  collectorNumber: string
  setCode?: string
  image?: string
  /** Extra copies available to trade (quantity − 1). */
  extras: number
  marketPrice: number | null
}

export type TradePlan = {
  /** Cards the friend can send to you (their doubles you miss). */
  theyOffer: TradeOfferCard[]
  /** Cards you can send to the friend (your doubles they miss). */
  youOffer: TradeOfferCard[]
  theyOfferValue: number
  youOfferValue: number
  /** youOfferValue − theyOfferValue (positive = your side is worth more). */
  valueDifference: number
  theyPricedCount: number
  youPricedCount: number
  unpricedCount: number
}

export function sumTradeValue(cards: Pick<TradeOfferCard, "marketPrice">[]): {
  total: number
  priced: number
  unpriced: number
} {
  let total = 0
  let priced = 0
  let unpriced = 0

  for (const card of cards) {
    if (card.marketPrice == null) {
      unpriced++
      continue
    }
    total += card.marketPrice
    priced++
  }

  return {
    total: Math.round(total * 100) / 100,
    priced,
    unpriced,
  }
}

export function buildTradePlan(input: {
  theyOffer: TradeOfferCard[]
  youOffer: TradeOfferCard[]
}): TradePlan {
  const they = sumTradeValue(input.theyOffer)
  const you = sumTradeValue(input.youOffer)

  return {
    theyOffer: input.theyOffer,
    youOffer: input.youOffer,
    theyOfferValue: they.total,
    youOfferValue: you.total,
    valueDifference: Math.round((you.total - they.total) * 100) / 100,
    theyPricedCount: they.priced,
    youPricedCount: you.priced,
    unpricedCount: they.unpriced + you.unpriced,
  }
}
