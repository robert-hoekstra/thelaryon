export type Card = {
  id: string
  name: string
  setCode: string
  setName: string
  collectorNumber: string
  rarity: string
  image: {
    small?: string
    normal?: string
    large?: string
  }
  prices: {
    eur: number | null
    eurFoil: number | null
    usd: number | null
    usdFoil: number | null
  }
  finishes: string[]
}
