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
