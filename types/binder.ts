export type BinderFillStrategy = "manual" | "set_order" | "collection_only"

export type BinderSortOrder =
  | "collector_number"
  | "typeline"
  | "color"
  | "rarity"
  | "cmc"
  | "name"

export type BinderPageSide = "front" | "back"

export type Binder = {
  id: string
  userId: string
  name: string
  pageCount: number
  rowsPerPage: number
  columnsPerPage: number
  doubleSided: boolean
  fillStrategy: BinderFillStrategy
  sortOrder: BinderSortOrder
  setCode: string | null
  setName: string | null
  seriesId: string | null
  volumeIndex: number | null
  volumeCount: number | null
  createdAt: Date
  updatedAt: Date
}

export type BinderSlot = {
  id: string
  binderId: string
  pageNumber: number
  side: BinderPageSide
  position: number
  expectedScryfallId: string | null
  expectedName: string | null
  expectedCollectorNumber: string | null
  expectedImage: {
    small?: string
    normal?: string
  }
  collectionItemId: string | null
  createdAt: Date
  updatedAt: Date
}

/** Slot enriched with live ownership from the user's collection. */
export type BinderSlotView = BinderSlot & {
  /** True when the expected (or assigned) card is present in the collection. */
  collected: boolean
  /** Quantity owned for the expected Scryfall printing, if any. */
  quantityOwned: number
  /** Display image preferring collection item, then expected printing. */
  displayImage?: string
  displayName: string | null
  displayCollectorNumber: string | null
  displayScryfallId: string | null
}

export type BinderProgress = {
  /** Slots that have an expected card planned. */
  expectedCount: number
  collectedCount: number
  missingCount: number
  completionPercentage: number
  /** Physical capacity of the binder. */
  totalSlots: number
  /** Slots with an explicit collection item assignment. */
  placedCount: number
}

export type BinderSeriesSibling = {
  id: string
  name: string
  volumeIndex: number
}

export type BinderSummary = Binder & {
  progress: BinderProgress
}

export type BinderDetail = Binder & {
  slots: BinderSlotView[]
  progress: BinderProgress
  slotsPerSide: number
  displayPageCount: number
  seriesSiblings: BinderSeriesSibling[]
}

export type CreateBinderInput = {
  name: string
  pageCount: number
  rowsPerPage: number
  columnsPerPage: number
  doubleSided: boolean
  fillStrategy: BinderFillStrategy
  sortOrder?: BinderSortOrder
  setCode?: string
}

export type CreateBinderResult = {
  binders: BinderDetail[]
  /** First volume — useful for redirect after create. */
  primaryBinderId: string
  volumeCount: number
}

export type AssignBinderSlotInput = {
  collectionItemId: string | null
}
