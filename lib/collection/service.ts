import "server-only"

import { and, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { collectionItems } from "@/lib/db/schema"
import { getCardPrice } from "@/lib/pricing/price"
import { getCardById } from "@/lib/scryfall/client"
import type {
  AddCollectionItemInput,
  CardCondition,
  CardFinish,
  CollectionItem,
  UpdateCollectionItemInput,
} from "@/types/collection"

function toNumber(value: string | null): number | null {
  if (value == null) {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function mapCollectionItem(
  row: typeof collectionItems.$inferSelect,
): CollectionItem {
  return {
    id: row.id,
    userId: row.userId,
    scryfallId: row.scryfallId,
    name: row.name,
    setCode: row.setCode,
    setName: row.setName,
    collectorNumber: row.collectorNumber,
    quantity: row.quantity,
    condition: row.condition as CardCondition,
    finish: row.finish as CardFinish,
    language: row.language,
    purchasePrice: toNumber(row.purchasePrice),
    purchaseDate: row.purchaseDate,
    currentPrice: toNumber(row.currentPrice),
    image: {
      small: row.imageSmall ?? undefined,
      normal: row.imageNormal ?? undefined,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function parseOptionalDate(value?: string | null): Date | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null || value === "") {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid purchase date.")
  }

  return date
}

export async function listCollectionItems(
  userId: string,
): Promise<CollectionItem[]> {
  const rows = await db
    .select()
    .from(collectionItems)
    .where(eq(collectionItems.userId, userId))
    .orderBy(desc(collectionItems.createdAt))

  return rows.map(mapCollectionItem)
}

export async function getCollectionItemById(
  id: string,
  userId: string,
): Promise<CollectionItem | null> {
  const rows = await db
    .select()
    .from(collectionItems)
    .where(
      and(eq(collectionItems.id, id), eq(collectionItems.userId, userId)),
    )
    .limit(1)

  const row = rows[0]
  return row ? mapCollectionItem(row) : null
}

export async function addCollectionItem(
  input: AddCollectionItemInput,
  userId: string,
): Promise<CollectionItem> {
  const card = await getCardById(input.scryfallId)
  const currentPrice = getCardPrice(card, input.finish)
  const purchaseDate = parseOptionalDate(input.purchaseDate)

  const [row] = await db
    .insert(collectionItems)
    .values({
      userId,
      scryfallId: card.id,
      name: card.name,
      setCode: card.setCode,
      setName: card.setName,
      collectorNumber: card.collectorNumber,
      quantity: input.quantity,
      condition: input.condition,
      finish: input.finish,
      language: input.language,
      purchasePrice:
        input.purchasePrice != null ? input.purchasePrice.toFixed(2) : null,
      purchaseDate: purchaseDate ?? null,
      currentPrice: currentPrice != null ? currentPrice.toFixed(2) : null,
      imageSmall: card.image.small ?? null,
      imageNormal: card.image.normal ?? null,
    })
    .returning()

  return mapCollectionItem(row)
}

export async function updateCollectionItem(
  id: string,
  input: UpdateCollectionItemInput,
  userId: string,
): Promise<CollectionItem | null> {
  const existing = await getCollectionItemById(id, userId)

  if (!existing) {
    return null
  }

  const purchaseDate = parseOptionalDate(input.purchaseDate)
  let currentPrice = existing.currentPrice

  if (input.finish && input.finish !== existing.finish) {
    const card = await getCardById(existing.scryfallId)
    currentPrice = getCardPrice(card, input.finish)
  }

  const [row] = await db
    .update(collectionItems)
    .set({
      quantity: input.quantity ?? existing.quantity,
      condition: input.condition ?? existing.condition,
      finish: input.finish ?? existing.finish,
      language: input.language ?? existing.language,
      purchasePrice:
        input.purchasePrice === undefined
          ? existing.purchasePrice != null
            ? existing.purchasePrice.toFixed(2)
            : null
          : input.purchasePrice != null
            ? input.purchasePrice.toFixed(2)
            : null,
      purchaseDate:
        purchaseDate === undefined ? existing.purchaseDate : purchaseDate,
      currentPrice: currentPrice != null ? currentPrice.toFixed(2) : null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(collectionItems.id, id), eq(collectionItems.userId, userId)),
    )
    .returning()

  return row ? mapCollectionItem(row) : null
}

export async function deleteCollectionItem(
  id: string,
  userId: string,
): Promise<boolean> {
  const deleted = await db
    .delete(collectionItems)
    .where(
      and(eq(collectionItems.id, id), eq(collectionItems.userId, userId)),
    )
    .returning({ id: collectionItems.id })

  return deleted.length > 0
}

export function summarizeCollection(items: CollectionItem[]) {
  const totalCards = items.reduce((sum, item) => sum + item.quantity, 0)
  const uniqueCards = new Set(items.map((item) => item.scryfallId)).size

  const collectionValue = items.reduce((sum, item) => {
    if (item.currentPrice == null) {
      return sum
    }
    return sum + item.currentPrice * item.quantity
  }, 0)

  const purchaseValue = items.reduce((sum, item) => {
    if (item.purchasePrice == null) {
      return sum
    }
    return sum + item.purchasePrice * item.quantity
  }, 0)

  return {
    totalCards,
    uniqueCards,
    collectionValue,
    purchaseValue,
    profitLoss: collectionValue - purchaseValue,
  }
}
