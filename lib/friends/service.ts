import "server-only"

import { and, eq, or, sql } from "drizzle-orm"

import { listCollectionItems } from "@/lib/collection/service"
import { db } from "@/lib/db"
import { friendships, users } from "@/lib/db/schema"
import type {
  CollectionCompareCard,
  CollectionCompareResult,
  FriendshipStatus,
  FriendshipView,
  FriendUser,
} from "@/types/friends"

function mapFriendUser(row: {
  id: string
  name: string
  email: string
}): FriendUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
  }
}

async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  const rows = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalized}`)
    .limit(1)

  return rows[0] ?? null
}

async function findFriendshipBetween(userA: string, userB: string) {
  const rows = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userA),
          eq(friendships.addresseeId, userB),
        ),
        and(
          eq(friendships.requesterId, userB),
          eq(friendships.addresseeId, userA),
        ),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

export async function areAcceptedFriends(
  userId: string,
  otherUserId: string,
): Promise<boolean> {
  const friendship = await findFriendshipBetween(userId, otherUserId)
  return friendship?.status === "accepted"
}

export async function listFriendships(
  userId: string,
): Promise<FriendshipView[]> {
  const all = await db
    .select()
    .from(friendships)
    .where(
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId),
      ),
    )

  const result: FriendshipView[] = []

  for (const row of all) {
    const friendId =
      row.requesterId === userId ? row.addresseeId : row.requesterId
    const friendRows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, friendId))
      .limit(1)

    const friend = friendRows[0]
    if (!friend) continue

    result.push({
      id: row.id,
      status: row.status as FriendshipStatus,
      direction: row.requesterId === userId ? "outgoing" : "incoming",
      friend: mapFriendUser(friend),
      createdAt: row.createdAt,
    })
  }

  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/** Incoming pending friend requests waiting for this user. */
export async function countIncomingPendingFriendRequests(
  userId: string,
): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(friendships)
    .where(
      and(
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending"),
      ),
    )

  return rows[0]?.count ?? 0
}

export async function sendFriendRequest(
  requesterId: string,
  email: string,
): Promise<
  | { ok: true; friendshipId: string; friendName: string }
  | { ok: false; code: string }
> {
  const target = await findUserByEmail(email)

  if (!target) {
    return { ok: false, code: "user_not_found" }
  }

  if (target.id === requesterId) {
    return { ok: false, code: "cannot_add_self" }
  }

  const existing = await findFriendshipBetween(requesterId, target.id)

  if (existing) {
    if (existing.status === "accepted") {
      return { ok: false, code: "already_friends" }
    }
    if (existing.status === "pending") {
      return { ok: false, code: "already_pending" }
    }
    // Re-open declined request from this side
    if (existing.requesterId === requesterId) {
      await db
        .update(friendships)
        .set({ status: "pending", updatedAt: new Date() })
        .where(eq(friendships.id, existing.id))
      return {
        ok: true,
        friendshipId: existing.id,
        friendName: target.name,
      }
    }
  }

  const inserted = await db
    .insert(friendships)
    .values({
      requesterId,
      addresseeId: target.id,
      status: "pending",
    })
    .returning({ id: friendships.id })

  return {
    ok: true,
    friendshipId: inserted[0].id,
    friendName: target.name,
  }
}

export async function respondToFriendRequest(
  userId: string,
  friendshipId: string,
  accept: boolean,
): Promise<
  { ok: true; friendName: string } | { ok: false; code: string }
> {
  const rows = await db
    .select()
    .from(friendships)
    .where(eq(friendships.id, friendshipId))
    .limit(1)

  const friendship = rows[0]
  if (!friendship) {
    return { ok: false, code: "not_found" }
  }

  if (friendship.addresseeId !== userId) {
    return { ok: false, code: "forbidden" }
  }

  if (friendship.status !== "pending") {
    return { ok: false, code: "not_pending" }
  }

  const friendRows = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, friendship.requesterId))
    .limit(1)

  await db
    .update(friendships)
    .set({
      status: accept ? "accepted" : "declined",
      updatedAt: new Date(),
    })
    .where(eq(friendships.id, friendshipId))

  return { ok: true, friendName: friendRows[0]?.name ?? "Friend" }
}

export async function removeFriendship(
  userId: string,
  friendshipId: string,
): Promise<
  { ok: true; friendName: string } | { ok: false; code: string }
> {
  const rows = await db
    .select()
    .from(friendships)
    .where(eq(friendships.id, friendshipId))
    .limit(1)

  const friendship = rows[0]
  if (!friendship) {
    return { ok: false, code: "not_found" }
  }

  if (
    friendship.requesterId !== userId &&
    friendship.addresseeId !== userId
  ) {
    return { ok: false, code: "forbidden" }
  }

  const friendId =
    friendship.requesterId === userId
      ? friendship.addresseeId
      : friendship.requesterId

  const friendRows = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, friendId))
    .limit(1)

  await db.delete(friendships).where(eq(friendships.id, friendshipId))
  return { ok: true, friendName: friendRows[0]?.name ?? "Friend" }
}

type AggregateCard = {
  scryfallId: string
  name: string
  setCode: string
  setName: string
  collectorNumber: string
  image?: string
  quantity: number
  currentPrice: number | null
}

function aggregateCollection(
  items: Awaited<ReturnType<typeof listCollectionItems>>,
): Map<string, AggregateCard> {
  const map = new Map<string, AggregateCard>()

  for (const item of items) {
    const existing = map.get(item.scryfallId)
    if (existing) {
      existing.quantity += item.quantity
      if (existing.currentPrice == null && item.currentPrice != null) {
        existing.currentPrice = item.currentPrice
      }
      continue
    }

    map.set(item.scryfallId, {
      scryfallId: item.scryfallId,
      name: item.name,
      setCode: item.setCode,
      setName: item.setName,
      collectorNumber: item.collectorNumber,
      image: item.image.normal ?? item.image.small,
      quantity: item.quantity,
      currentPrice: item.currentPrice,
    })
  }

  return map
}

function toCompareCard(
  card: AggregateCard,
  myQuantity: number,
  friendQuantity: number,
): CollectionCompareCard {
  return {
    scryfallId: card.scryfallId,
    name: card.name,
    setCode: card.setCode,
    setName: card.setName,
    collectorNumber: card.collectorNumber,
    image: card.image,
    myQuantity,
    friendQuantity,
    friendExtras: Math.max(0, friendQuantity - 1),
    currentPrice: card.currentPrice,
  }
}

export async function compareCollections(
  myUserId: string,
  friendUserId: string,
): Promise<CollectionCompareResult | null> {
  if (!(await areAcceptedFriends(myUserId, friendUserId))) {
    return null
  }

  const friendRows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, friendUserId))
    .limit(1)

  const friend = friendRows[0]
  if (!friend) return null

  const [mine, theirs] = await Promise.all([
    listCollectionItems(myUserId),
    listCollectionItems(friendUserId),
  ])

  const myMap = aggregateCollection(mine)
  const friendMap = aggregateCollection(theirs)

  const missingForMe: CollectionCompareCard[] = []
  const theirExtrasINeed: CollectionCompareCard[] = []
  const missingForThem: CollectionCompareCard[] = []
  const myExtrasTheyNeed: CollectionCompareCard[] = []

  for (const [scryfallId, friendCard] of friendMap) {
    const myQty = myMap.get(scryfallId)?.quantity ?? 0
    if (myQty > 0) continue

    const compare = toCompareCard(friendCard, 0, friendCard.quantity)
    missingForMe.push(compare)
    if (friendCard.quantity >= 2) {
      theirExtrasINeed.push(compare)
    }
  }

  for (const [scryfallId, myCard] of myMap) {
    const friendQty = friendMap.get(scryfallId)?.quantity ?? 0
    if (friendQty > 0) continue
    const compare = toCompareCard(myCard, myCard.quantity, 0)
    missingForThem.push(compare)
    if (myCard.quantity >= 2) {
      myExtrasTheyNeed.push(compare)
    }
  }

  const byName = (a: CollectionCompareCard, b: CollectionCompareCard) =>
    a.name.localeCompare(b.name)

  missingForMe.sort(byName)
  theirExtrasINeed.sort(byName)
  missingForThem.sort(byName)
  myExtrasTheyNeed.sort(byName)

  return {
    friend: mapFriendUser(friend),
    missingForMe,
    theirExtrasINeed,
    missingForThem,
    myExtrasTheyNeed,
    summary: {
      missingForMeCount: missingForMe.length,
      theirExtrasINeedCount: theirExtrasINeed.length,
      missingForThemCount: missingForThem.length,
      myExtrasTheyNeedCount: myExtrasTheyNeed.length,
    },
  }
}
