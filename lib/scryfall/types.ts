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
  image_uris?: ScryfallImageUris
}

export type ScryfallCard = {
  id: string
  name: string
  set: string
  set_name: string
  collector_number: string
  rarity: string
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
