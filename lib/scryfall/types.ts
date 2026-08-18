export type ScryfallImageUris = {
  small?: string
  normal?: string
  large?: string
  png?: string
  art_crop?: string
  border_crop?: string
}

export type ScryfallCardFace = {
  name?: string
  mana_cost?: string
  type_line?: string
  oracle_text?: string
  flavor_text?: string
  power?: string
  toughness?: string
  loyalty?: string
  defense?: string
  artist?: string
  colors?: string[]
  image_uris?: ScryfallImageUris
}

export type ScryfallLegality =
  | "legal"
  | "not_legal"
  | "restricted"
  | "banned"

export type ScryfallCard = {
  id: string
  name: string
  set: string
  set_name: string
  collector_number: string
  rarity: string
  mana_cost?: string
  cmc?: number
  type_line?: string
  oracle_text?: string
  flavor_text?: string
  power?: string
  toughness?: string
  loyalty?: string
  defense?: string
  colors?: string[]
  color_identity?: string[]
  keywords?: string[]
  artist?: string
  released_at?: string
  layout?: string
  legalities?: Record<string, ScryfallLegality>
  scryfall_uri?: string
  image_uris?: ScryfallImageUris
  card_faces?: ScryfallCardFace[]
  prices: {
    usd: string | null
    usd_foil: string | null
    eur: string | null
    eur_foil: string | null
  }
  finishes: string[]
  border_color?: string
  frame_effects?: string[]
  full_art?: boolean
  promo?: boolean
  promo_types?: string[]
  booster?: boolean
  security_stamp?: string
  lang?: string
}

export type ScryfallSet = {
  object: "set"
  id: string
  code: string
  name: string
  set_type: string
  released_at: string | null
  card_count: number
  icon_svg_uri: string
  digital?: boolean
  parent_set_code?: string
}

export type ScryfallCardListResponse = {
  object: "list"
  total_cards?: number
  has_more: boolean
  next_page?: string
  data: ScryfallCard[]
}

export type ScryfallCollectionIdentifier = {
  id: string
}

export type ScryfallCollectionResponse = {
  object: "list"
  not_found?: ScryfallCollectionIdentifier[]
  data: ScryfallCard[]
}

export type ScryfallSetListResponse = {
  object: "list"
  has_more: boolean
  data: ScryfallSet[]
}

export type ScryfallListResponse = {
  object: "list"
  total_cards?: number
  has_more?: boolean
  data: ScryfallCard[]
}

export type ScryfallErrorResponse = {
  object: "error"
  code: string
  status: number
  details: string
}
