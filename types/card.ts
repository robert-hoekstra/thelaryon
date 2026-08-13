export type CardImageUris = {
  small?: string
  normal?: string
  large?: string
}

export type CardFace = {
  name: string
  manaCost?: string
  typeLine?: string
  oracleText?: string
  flavorText?: string
  power?: string
  toughness?: string
  loyalty?: string
  defense?: string
  artist?: string
  colors?: string[]
  image: CardImageUris
}

export type CardLegality =
  | "legal"
  | "not_legal"
  | "restricted"
  | "banned"

export type CardLegalities = {
  standard?: CardLegality
  pioneer?: CardLegality
  modern?: CardLegality
  legacy?: CardLegality
  vintage?: CardLegality
  commander?: CardLegality
  pauper?: CardLegality
  historic?: CardLegality
  alchemy?: CardLegality
  brawl?: CardLegality
  timeless?: CardLegality
  standardbrawl?: CardLegality
  duel?: CardLegality
  oldschool?: CardLegality
  premodern?: CardLegality
  predh?: CardLegality
  oathbreaker?: CardLegality
  penny?: CardLegality
  gladiator?: CardLegality
}

export type Card = {
  id: string
  name: string
  setCode: string
  setName: string
  collectorNumber: string
  rarity: string
  image: CardImageUris
  /** Present when Scryfall provides multiple faces (DFC / MDFC / adventure / split). */
  faces?: CardFace[]
  manaCost?: string
  cmc?: number
  typeLine?: string
  oracleText?: string
  flavorText?: string
  power?: string
  toughness?: string
  loyalty?: string
  defense?: string
  colors?: string[]
  colorIdentity?: string[]
  keywords?: string[]
  artist?: string
  releasedAt?: string
  layout?: string
  legalities?: CardLegalities
  scryfallUri?: string
  prices: {
    eur: number | null
    eurFoil: number | null
    usd: number | null
    usdFoil: number | null
  }
  finishes: string[]
  borderColor?: string
  frameEffects?: string[]
  fullArt?: boolean
  promo?: boolean
  promoTypes?: string[]
  booster?: boolean
  securityStamp?: string
  lang?: string
}
