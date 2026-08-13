import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { CARDS_PER_BOOSTER } from "@/lib/user/constants"

export { CARDS_PER_BOOSTER }

function toNumber(value: string | null): number | null {
  if (value == null || value === "") {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Default per-card purchase price from a booster pack (pack price ÷ 14).
 */
export function defaultPurchasePriceFromBooster(
  boosterPackPrice: number | null | undefined,
): number | undefined {
  if (
    boosterPackPrice == null ||
    !Number.isFinite(boosterPackPrice) ||
    boosterPackPrice < 0
  ) {
    return undefined
  }

  return Math.round((boosterPackPrice / CARDS_PER_BOOSTER) * 100) / 100
}

export async function getUserBoosterPackPrice(
  userId: string,
): Promise<number | null> {
  const rows = await db
    .select({ boosterPackPrice: users.boosterPackPrice })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return toNumber(rows[0]?.boosterPackPrice ?? null)
}

export async function getDefaultCardPurchasePrice(
  userId: string,
): Promise<number | undefined> {
  const packPrice = await getUserBoosterPackPrice(userId)
  return defaultPurchasePriceFromBooster(packPrice)
}

export async function updateUserBoosterPackPrice(
  userId: string,
  price: number | null,
): Promise<number | null> {
  const [row] = await db
    .update(users)
    .set({
      boosterPackPrice: price != null ? price.toFixed(2) : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({ boosterPackPrice: users.boosterPackPrice })

  return toNumber(row?.boosterPackPrice ?? null)
}
