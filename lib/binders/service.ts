import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"

import { calculateBinderProgress } from "@/lib/binders/completion"
import {
  generateSlotPositions,
  slotsPerSide,
  totalSlotCapacity,
  displayPageCount,
} from "@/lib/binders/layout"
import {
  chunkCardsForVolumes,
  sortCardsForBinder,
  volumeBinderName,
  type BinderSortOrder as SortOrder,
} from "@/lib/binders/sort"
import { db } from "@/lib/db"
import { binderSlots, binders, collectionItems } from "@/lib/db/schema"
import { getCardsBySet, getSetByCode } from "@/lib/scryfall/client"
import { filterEligibleCards } from "@/lib/sets/eligibility"
import { loadUserCollectionMap } from "@/lib/sets/service"
import type {
  AssignBinderSlotInput,
  Binder,
  BinderDetail,
  BinderFillStrategy,
  BinderPageSide,
  BinderSeriesSibling,
  BinderSlot,
  BinderSlotView,
  BinderSortOrder,
  BinderSummary,
  CreateBinderInput,
  CreateBinderResult,
} from "@/types/binder"
import type { Card } from "@/types/card"

const MAX_SLOTS = 2000

function mapBinder(row: typeof binders.$inferSelect): Binder {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    pageCount: row.pageCount,
    rowsPerPage: row.rowsPerPage,
    columnsPerPage: row.columnsPerPage,
    doubleSided: row.doubleSided,
    fillStrategy: row.fillStrategy as BinderFillStrategy,
    sortOrder: row.sortOrder as BinderSortOrder,
    setCode: row.setCode,
    setName: row.setName,
    seriesId: row.seriesId,
    volumeIndex: row.volumeIndex,
    volumeCount: row.volumeCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function mapSlot(row: typeof binderSlots.$inferSelect): BinderSlot {
  return {
    id: row.id,
    binderId: row.binderId,
    pageNumber: row.pageNumber,
    side: row.side as BinderPageSide,
    position: row.position,
    expectedScryfallId: row.expectedScryfallId,
    expectedName: row.expectedName,
    expectedCollectorNumber: row.expectedCollectorNumber,
    expectedImage: {
      small: row.expectedImageSmall ?? undefined,
      normal: row.expectedImageNormal ?? undefined,
    },
    collectionItemId: row.collectionItemId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

type ExpectedCardSeed = {
  id: string
  name: string
  collectorNumber: string
  image: {
    small?: string
    normal?: string
  }
}

function expectedFieldsFromCard(card: ExpectedCardSeed) {
  return {
    expectedScryfallId: card.id,
    expectedName: card.name,
    expectedCollectorNumber: card.collectorNumber,
    expectedImageSmall: card.image.small ?? null,
    expectedImageNormal: card.image.normal ?? null,
  }
}

async function getOwnedBinder(binderId: string, userId: string) {
  const rows = await db
    .select()
    .from(binders)
    .where(and(eq(binders.id, binderId), eq(binders.userId, userId)))
    .limit(1)

  return rows[0] ? mapBinder(rows[0]) : null
}

function toSlotViews(
  slots: BinderSlot[],
  collectionByScryfallId: Map<string, { quantity: number }>,
  collectionItemsById: Map<
    string,
    {
      scryfallId: string
      name: string
      collectorNumber: string
      quantity: number
      imageSmall: string | null
      imageNormal: string | null
    }
  >,
): BinderSlotView[] {
  return slots.map((slot) => {
    const assigned = slot.collectionItemId
      ? collectionItemsById.get(slot.collectionItemId)
      : undefined

    const scryfallId =
      assigned?.scryfallId ?? slot.expectedScryfallId ?? null
    const ownedEntry = scryfallId
      ? collectionByScryfallId.get(scryfallId)
      : undefined

    const collected =
      assigned != null ||
      (ownedEntry != null && ownedEntry.quantity > 0)

    const displayName = assigned?.name ?? slot.expectedName
    const displayCollectorNumber =
      assigned?.collectorNumber ?? slot.expectedCollectorNumber
    const displayImage =
      assigned?.imageNormal ??
      assigned?.imageSmall ??
      slot.expectedImage.normal ??
      slot.expectedImage.small

    return {
      ...slot,
      collected,
      quantityOwned: ownedEntry?.quantity ?? assigned?.quantity ?? 0,
      displayImage,
      displayName,
      displayCollectorNumber,
      displayScryfallId: scryfallId,
    }
  })
}

async function loadCollectionItemMap(
  userId: string,
  itemIds: string[],
) {
  const map = new Map<
    string,
    {
      scryfallId: string
      name: string
      collectorNumber: string
      quantity: number
      imageSmall: string | null
      imageNormal: string | null
    }
  >()

  if (itemIds.length === 0) {
    return map
  }

  const rows = await db
    .select({
      id: collectionItems.id,
      scryfallId: collectionItems.scryfallId,
      name: collectionItems.name,
      collectorNumber: collectionItems.collectorNumber,
      quantity: collectionItems.quantity,
      imageSmall: collectionItems.imageSmall,
      imageNormal: collectionItems.imageNormal,
    })
    .from(collectionItems)
    .where(
      and(
        eq(collectionItems.userId, userId),
        inArray(collectionItems.id, itemIds),
      ),
    )

  for (const row of rows) {
    map.set(row.id, row)
  }

  return map
}

export async function listBinders(userId: string): Promise<BinderSummary[]> {
  const binderRows = await db
    .select()
    .from(binders)
    .where(eq(binders.userId, userId))
    .orderBy(asc(binders.createdAt))

  if (binderRows.length === 0) {
    return []
  }

  const binderIds = binderRows.map((row) => row.id)
  const slotRows = await db
    .select()
    .from(binderSlots)
    .where(inArray(binderSlots.binderId, binderIds))

  const collectionMap = await loadUserCollectionMap(userId)
  const assignedIds = slotRows
    .map((row) => row.collectionItemId)
    .filter((id): id is string => id != null)
  const itemMap = await loadCollectionItemMap(userId, assignedIds)

  const slotsByBinder = new Map<string, BinderSlotView[]>()
  for (const row of slotRows) {
    const mapped = mapSlot(row)
    const [view] = toSlotViews([mapped], collectionMap, itemMap)
    const list = slotsByBinder.get(row.binderId) ?? []
    list.push(view)
    slotsByBinder.set(row.binderId, list)
  }

  return binderRows.map((row) => {
    const binder = mapBinder(row)
    const slots = slotsByBinder.get(binder.id) ?? []
    const capacity = totalSlotCapacity(binder)
    return {
      ...binder,
      progress: calculateBinderProgress(slots, capacity),
    }
  })
}

async function loadSeriesSiblings(
  binder: Binder,
  userId: string,
): Promise<BinderSeriesSibling[]> {
  if (!binder.seriesId) return []

  const rows = await db
    .select({
      id: binders.id,
      name: binders.name,
      volumeIndex: binders.volumeIndex,
    })
    .from(binders)
    .where(
      and(eq(binders.userId, userId), eq(binders.seriesId, binder.seriesId)),
    )
    .orderBy(asc(binders.volumeIndex))

  return rows
    .filter((row) => row.volumeIndex != null)
    .map((row) => ({
      id: row.id,
      name: row.name,
      volumeIndex: row.volumeIndex!,
    }))
}

export async function getBinderDetail(
  binderId: string,
  userId: string,
): Promise<BinderDetail | null> {
  const binder = await getOwnedBinder(binderId, userId)
  if (!binder) {
    return null
  }

  const slotRows = await db
    .select()
    .from(binderSlots)
    .where(eq(binderSlots.binderId, binderId))
    .orderBy(
      asc(binderSlots.pageNumber),
      asc(binderSlots.side),
      asc(binderSlots.position),
    )

  // front before back: drizzle asc on enum uses declaration order
  const slots = slotRows.map(mapSlot)
  const collectionMap = await loadUserCollectionMap(userId)
  const assignedIds = slots
    .map((slot) => slot.collectionItemId)
    .filter((id): id is string => id != null)
  const itemMap = await loadCollectionItemMap(userId, assignedIds)
  const slotViews = toSlotViews(slots, collectionMap, itemMap)

  // Ensure front sides sort before back for the same page
  slotViews.sort((a, b) => {
    if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber
    if (a.side !== b.side) return a.side === "front" ? -1 : 1
    return a.position - b.position
  })

  const seriesSiblings = await loadSeriesSiblings(binder, userId)

  return {
    ...binder,
    slots: slotViews,
    progress: calculateBinderProgress(
      slotViews,
      totalSlotCapacity(binder),
    ),
    slotsPerSide: slotsPerSide(binder),
    displayPageCount: displayPageCount(binder),
    seriesSiblings,
  }
}

async function insertBinderWithSlots(params: {
  userId: string
  name: string
  input: CreateBinderInput
  sortOrder: BinderSortOrder
  setCode: string | null
  setName: string | null
  seriesId: string | null
  volumeIndex: number | null
  volumeCount: number | null
  expectedCards: ExpectedCardSeed[]
}): Promise<string> {
  const {
    userId,
    name,
    input,
    sortOrder,
    setCode,
    setName,
    seriesId,
    volumeIndex,
    volumeCount,
    expectedCards,
  } = params

  const positions = generateSlotPositions(input)

  const [binderRow] = await db
    .insert(binders)
    .values({
      userId,
      name,
      pageCount: input.pageCount,
      rowsPerPage: input.rowsPerPage,
      columnsPerPage: input.columnsPerPage,
      doubleSided: input.doubleSided,
      fillStrategy: input.fillStrategy,
      sortOrder,
      setCode,
      setName,
      seriesId,
      volumeIndex,
      volumeCount,
    })
    .returning()

  const slotValues = positions.map((pos, index) => {
    const card = expectedCards[index]
    return {
      binderId: binderRow.id,
      pageNumber: pos.pageNumber,
      side: pos.side,
      position: pos.position,
      ...(card ? expectedFieldsFromCard(card) : {}),
    }
  })

  const CHUNK = 200
  for (let i = 0; i < slotValues.length; i += CHUNK) {
    await db.insert(binderSlots).values(slotValues.slice(i, i + CHUNK))
  }

  return binderRow.id
}

function cardToSeed(card: Card): ExpectedCardSeed {
  return {
    id: card.id,
    name: card.name,
    collectorNumber: card.collectorNumber,
    image: {
      small: card.image.small,
      normal: card.image.normal,
    },
  }
}

export async function createBinder(
  input: CreateBinderInput,
  userId: string,
): Promise<CreateBinderResult> {
  const capacity = totalSlotCapacity(input)
  if (capacity > MAX_SLOTS) {
    throw new Error("BINDER_TOO_LARGE")
  }
  if (capacity < 1) {
    throw new Error("INVALID_CAPACITY")
  }

  const sortOrder: BinderSortOrder =
    input.sortOrder ?? "collector_number"

  let setCode: string | null = null
  let setName: string | null = null
  let expectedCards: ExpectedCardSeed[] = []

  if (input.fillStrategy === "set_order") {
    if (!input.setCode) {
      throw new Error("SET_CODE_REQUIRED")
    }

    const set = await getSetByCode(input.setCode)
    const cards = await getCardsBySet(input.setCode)
    const eligible = filterEligibleCards(cards)
    const sorted = sortCardsForBinder(eligible, sortOrder as SortOrder)
    expectedCards = sorted.map(cardToSeed)
    setCode = set.code
    setName = set.name
  }

  if (input.fillStrategy === "collection_only") {
    const items = await db
      .select({
        scryfallId: collectionItems.scryfallId,
        name: collectionItems.name,
        collectorNumber: collectionItems.collectorNumber,
        setCode: collectionItems.setCode,
        imageSmall: collectionItems.imageSmall,
        imageNormal: collectionItems.imageNormal,
      })
      .from(collectionItems)
      .where(eq(collectionItems.userId, userId))

    const seen = new Set<string>()
    const uniqueItems = items.filter((item) => {
      if (seen.has(item.scryfallId)) return false
      seen.add(item.scryfallId)
      return true
    })

    // Collection-only has limited metadata; name / collector sorts work locally.
    // Advanced sorts fall back to collector number within set.
    const asCards: Card[] = uniqueItems.map((item) => ({
      id: item.scryfallId,
      name: item.name,
      setCode: item.setCode,
      setName: "",
      collectorNumber: item.collectorNumber,
      rarity: "common",
      image: {
        small: item.imageSmall ?? undefined,
        normal: item.imageNormal ?? undefined,
      },
      prices: { eur: null, eurFoil: null, usd: null, usdFoil: null },
      finishes: [],
    }))

    const localSort: SortOrder =
      sortOrder === "name" || sortOrder === "collector_number"
        ? sortOrder
        : "collector_number"

    expectedCards = sortCardsForBinder(asCards, localSort).map(cardToSeed)
  }

  // Manual empty binder: one volume with empty slots.
  // Set / collection fills chunk across binders when capacity is exceeded.
  const volumes =
    input.fillStrategy === "manual"
      ? [[]]
      : chunkCardsForVolumes(expectedCards, capacity)

  const volumeCards = volumes.length > 0 ? volumes : [[]]

  const actualVolumeCount = volumeCards.length
  const actualSeriesId =
    actualVolumeCount > 1 ? crypto.randomUUID() : null

  const binderIds: string[] = []

  for (let i = 0; i < volumeCards.length; i++) {
    const volumeIndex = i + 1
    const binderId = await insertBinderWithSlots({
      userId,
      name: volumeBinderName(input.name, volumeIndex, actualVolumeCount),
      input,
      sortOrder,
      setCode,
      setName,
      seriesId: actualSeriesId,
      volumeIndex: actualVolumeCount > 1 ? volumeIndex : null,
      volumeCount: actualVolumeCount > 1 ? actualVolumeCount : null,
      expectedCards: volumeCards[i] ?? [],
    })
    binderIds.push(binderId)
  }

  const details: BinderDetail[] = []
  for (const id of binderIds) {
    const detail = await getBinderDetail(id, userId)
    if (detail) details.push(detail)
  }

  if (details.length === 0 || !binderIds[0]) {
    throw new Error("BINDER_CREATE_FAILED")
  }

  return {
    binders: details,
    primaryBinderId: binderIds[0],
    volumeCount: actualVolumeCount,
  }
}

/**
 * Continues a set binder when the physical binder ran out of pockets.
 * Places remaining set cards (same sort order) into one or more new volumes.
 */
export async function continueBinderSeries(
  binderId: string,
  userId: string,
): Promise<CreateBinderResult> {
  const source = await getOwnedBinder(binderId, userId)
  if (!source) {
    throw new Error("BINDER_NOT_FOUND")
  }
  if (source.fillStrategy !== "set_order" || !source.setCode) {
    throw new Error("CONTINUE_NOT_SUPPORTED")
  }

  const seriesId = source.seriesId ?? crypto.randomUUID()
  const seriesBinderIds = source.seriesId
    ? (
        await db
          .select({ id: binders.id })
          .from(binders)
          .where(
            and(
              eq(binders.userId, userId),
              eq(binders.seriesId, source.seriesId),
            ),
          )
      ).map((row) => row.id)
    : [source.id]

  // Ensure the original binder belongs to the series going forward
  if (!source.seriesId) {
    await db
      .update(binders)
      .set({
        seriesId,
        volumeIndex: 1,
        volumeCount: 1,
        updatedAt: new Date(),
      })
      .where(eq(binders.id, source.id))
  }

  const placedRows = await db
    .select({ expectedScryfallId: binderSlots.expectedScryfallId })
    .from(binderSlots)
    .where(inArray(binderSlots.binderId, seriesBinderIds))

  const placedIds = new Set(
    placedRows
      .map((row) => row.expectedScryfallId)
      .filter((id): id is string => id != null),
  )

  const set = await getSetByCode(source.setCode)
  const cards = await getCardsBySet(source.setCode)
  const sorted = sortCardsForBinder(
    filterEligibleCards(cards),
    source.sortOrder as SortOrder,
  )
  const remaining = sorted.filter((card) => !placedIds.has(card.id))

  if (remaining.length === 0) {
    throw new Error("NO_REMAINING_CARDS")
  }

  const capacity = totalSlotCapacity(source)
  const volumes = chunkCardsForVolumes(remaining.map(cardToSeed), capacity)
  const existingVolumeCount = source.volumeCount ?? seriesBinderIds.length
  const newVolumeCount = existingVolumeCount + volumes.length
  const baseName = source.name.replace(/\s*\(\d+\/\d+\)\s*$/, "").trim()

  // Update existing volumes' names and volumeCount
  const existingBinders = await db
    .select()
    .from(binders)
    .where(and(eq(binders.userId, userId), eq(binders.seriesId, seriesId)))
    .orderBy(asc(binders.volumeIndex))

  for (const row of existingBinders) {
    const index = row.volumeIndex ?? 1
    await db
      .update(binders)
      .set({
        seriesId,
        volumeIndex: index,
        volumeCount: newVolumeCount,
        name: volumeBinderName(baseName, index, newVolumeCount),
        updatedAt: new Date(),
      })
      .where(eq(binders.id, row.id))
  }

  // If source had no series yet, refresh its metadata
  if (existingBinders.length === 0) {
    await db
      .update(binders)
      .set({
        seriesId,
        volumeIndex: 1,
        volumeCount: newVolumeCount,
        name: volumeBinderName(baseName, 1, newVolumeCount),
        updatedAt: new Date(),
      })
      .where(eq(binders.id, source.id))
  }

  const layoutInput: CreateBinderInput = {
    name: baseName,
    pageCount: source.pageCount,
    rowsPerPage: source.rowsPerPage,
    columnsPerPage: source.columnsPerPage,
    doubleSided: source.doubleSided,
    fillStrategy: source.fillStrategy,
    sortOrder: source.sortOrder,
    setCode: source.setCode ?? undefined,
  }

  const binderIds: string[] = []
  for (let i = 0; i < volumes.length; i++) {
    const volumeIndex = existingVolumeCount + i + 1
    const id = await insertBinderWithSlots({
      userId,
      name: volumeBinderName(baseName, volumeIndex, newVolumeCount),
      input: layoutInput,
      sortOrder: source.sortOrder,
      setCode: set.code,
      setName: set.name,
      seriesId,
      volumeIndex,
      volumeCount: newVolumeCount,
      expectedCards: volumes[i] ?? [],
    })
    binderIds.push(id)
  }

  const details: BinderDetail[] = []
  for (const id of binderIds) {
    const detail = await getBinderDetail(id, userId)
    if (detail) details.push(detail)
  }

  if (!binderIds[0] || details.length === 0) {
    throw new Error("BINDER_CREATE_FAILED")
  }

  return {
    binders: details,
    primaryBinderId: binderIds[0],
    volumeCount: volumes.length,
  }
}

export async function renameBinder(
  binderId: string,
  name: string,
  userId: string,
): Promise<Binder | null> {
  const [row] = await db
    .update(binders)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(binders.id, binderId), eq(binders.userId, userId)))
    .returning()

  return row ? mapBinder(row) : null
}

export async function deleteBinder(
  binderId: string,
  userId: string,
): Promise<boolean> {
  const deleted = await db
    .delete(binders)
    .where(and(eq(binders.id, binderId), eq(binders.userId, userId)))
    .returning({ id: binders.id })

  return deleted.length > 0
}

export async function assignBinderSlot(
  slotId: string,
  input: AssignBinderSlotInput,
  userId: string,
): Promise<BinderSlotView | null> {
  const slotRows = await db
    .select({
      slot: binderSlots,
      binderUserId: binders.userId,
    })
    .from(binderSlots)
    .innerJoin(binders, eq(binderSlots.binderId, binders.id))
    .where(eq(binderSlots.id, slotId))
    .limit(1)

  const match = slotRows[0]
  if (!match || match.binderUserId !== userId) {
    return null
  }

  let expectedUpdate: Partial<typeof binderSlots.$inferInsert> = {
    collectionItemId: null,
  }

  if (input.collectionItemId) {
    const itemRows = await db
      .select()
      .from(collectionItems)
      .where(
        and(
          eq(collectionItems.id, input.collectionItemId),
          eq(collectionItems.userId, userId),
        ),
      )
      .limit(1)

    const item = itemRows[0]
    if (!item) {
      throw new Error("COLLECTION_ITEM_NOT_FOUND")
    }

    // Preserve planned expected cards (set binders). For empty manual slots,
    // also store expected so the pocket remembers the card if the collection
    // item is later deleted (FK set null).
    if (match.slot.expectedScryfallId != null) {
      expectedUpdate = { collectionItemId: item.id }
    } else {
      expectedUpdate = {
        collectionItemId: item.id,
        expectedScryfallId: item.scryfallId,
        expectedName: item.name,
        expectedCollectorNumber: item.collectorNumber,
        expectedImageSmall: item.imageSmall,
        expectedImageNormal: item.imageNormal,
      }
    }
  } else if (match.slot.expectedScryfallId == null) {
    // Clearing an unplanned manual slot — wipe expected too
    expectedUpdate = {
      collectionItemId: null,
      expectedScryfallId: null,
      expectedName: null,
      expectedCollectorNumber: null,
      expectedImageSmall: null,
      expectedImageNormal: null,
    }
  }

  const [updated] = await db
    .update(binderSlots)
    .set({
      ...expectedUpdate,
      updatedAt: new Date(),
    })
    .where(eq(binderSlots.id, slotId))
    .returning()

  if (!updated) {
    return null
  }

  const mapped = mapSlot(updated)
  const collectionMap = await loadUserCollectionMap(userId)
  const itemMap = await loadCollectionItemMap(
    userId,
    mapped.collectionItemId ? [mapped.collectionItemId] : [],
  )

  return toSlotViews([mapped], collectionMap, itemMap)[0] ?? null
}

/**
 * Moves a collection item assignment from one slot to another within the same binder.
 */
export async function moveBinderSlotAssignment(
  fromSlotId: string,
  toSlotId: string,
  userId: string,
): Promise<boolean> {
  const rows = await db
    .select({
      slot: binderSlots,
      binderId: binders.id,
      binderUserId: binders.userId,
      fillStrategy: binders.fillStrategy,
    })
    .from(binderSlots)
    .innerJoin(binders, eq(binderSlots.binderId, binders.id))
    .where(inArray(binderSlots.id, [fromSlotId, toSlotId]))

  if (rows.length !== 2) {
    return false
  }

  const from = rows.find((row) => row.slot.id === fromSlotId)
  const to = rows.find((row) => row.slot.id === toSlotId)

  if (
    !from ||
    !to ||
    from.binderUserId !== userId ||
    to.binderUserId !== userId ||
    from.binderId !== to.binderId
  ) {
    return false
  }

  const fromItemId = from.slot.collectionItemId
  const toItemId = to.slot.collectionItemId

  // Swap collection item assignments; keep expected cards in place for set binders
  await db
    .update(binderSlots)
    .set({ collectionItemId: toItemId, updatedAt: new Date() })
    .where(eq(binderSlots.id, fromSlotId))

  await db
    .update(binderSlots)
    .set({ collectionItemId: fromItemId, updatedAt: new Date() })
    .where(eq(binderSlots.id, toSlotId))

  return true
}
