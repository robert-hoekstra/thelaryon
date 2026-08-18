"use server"

import { revalidatePath } from "next/cache"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import {
  addCollectionItem,
  addPreconDeckToCollection,
  deleteCollectionItem,
  getCollectionItemById,
  updateCollectionItem,
} from "@/lib/collection/service"
import {
  getPreconDeck,
  PreconDeckNotFoundError,
  PreconDeckTooLargeError,
} from "@/lib/decks/service"
import { getTranslator } from "@/lib/i18n/get-locale"
import { MtgjsonApiError } from "@/lib/mtgjson/client"
import { getDefaultCardPurchasePrice } from "@/lib/user/service"
import {
  addCollectionItemSchema,
  addPreconDeckSchema,
  updateCollectionItemSchema,
} from "@/lib/validation/collection"

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string }

async function requireUserId(): Promise<
  { ok: true; userId: string } | { ok: false; message: string }
> {
  const t = await getTranslator()
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    return {
      ok: false,
      message: t("action.loginRequired"),
    }
  }

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  return { ok: true, userId }
}

export async function addToCollectionAction(
  input: unknown,
): Promise<ActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) {
    return user
  }

  const parsed = addCollectionItemSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false,
      message: t("action.invalidCollectionData"),
    }
  }

  try {
    const data = { ...parsed.data }

    if (data.purchasePrice === undefined) {
      const defaultPrice = await getDefaultCardPurchasePrice(user.userId)
      if (defaultPrice != null) {
        data.purchasePrice = defaultPrice
      }
    }

    const item = await addCollectionItem(data, user.userId)
    revalidatePath("/collection")
    revalidatePath("/")
    revalidatePath("/binders", "layout")
    revalidatePath(`/cards/${item.scryfallId}`)

    return {
      ok: true,
      message: t("action.added", { name: item.name }),
    }
  } catch (error) {
    console.error("addToCollectionAction failed", error)
    return {
      ok: false,
      message: t("action.addFailed"),
    }
  }
}

export async function addPreconDeckAction(
  input: unknown,
): Promise<ActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) {
    return user
  }

  const parsed = addPreconDeckSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false,
      message: t("action.invalidCollectionData"),
    }
  }

  try {
    const deck = await getPreconDeck(parsed.data.fileName)

    if (deck.totalCards === 0) {
      return {
        ok: false,
        message: t("precon.emptyDeck"),
      }
    }

    const result = await addPreconDeckToCollection(deck, user.userId, {
      condition: parsed.data.condition,
      purchasePrice: parsed.data.purchasePrice,
      purchaseDate: parsed.data.purchaseDate,
    })

    if (result.addedCount === 0) {
      return {
        ok: false,
        message: t("precon.addNone"),
      }
    }

    revalidatePath("/collection")
    revalidatePath("/")
    revalidatePath("/binders", "layout")

    if (result.skippedCount > 0) {
      return {
        ok: true,
        message: t("precon.addedPartial", {
          name: deck.name,
          added: result.addedCount,
          skipped: result.skippedCount,
        }),
      }
    }

    return {
      ok: true,
      message: t("precon.added", {
        name: deck.name,
        count: result.addedCount,
      }),
    }
  } catch (error) {
    if (error instanceof PreconDeckNotFoundError) {
      return {
        ok: false,
        message: t("precon.notFound"),
      }
    }

    if (error instanceof PreconDeckTooLargeError) {
      return {
        ok: false,
        message: t("precon.tooLarge"),
      }
    }

    if (error instanceof MtgjsonApiError) {
      return {
        ok: false,
        message: t("precon.fetchFailed"),
      }
    }

    console.error("addPreconDeckAction failed", error)
    return {
      ok: false,
      message: t("precon.addFailed"),
    }
  }
}

export async function updateCollectionItemAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) {
    return user
  }

  const parsed = updateCollectionItemSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false,
      message: t("action.invalidChanges"),
    }
  }

  try {
    const item = await updateCollectionItem(id, parsed.data, user.userId)

    if (!item) {
      return {
        ok: false,
        message: t("action.itemNotFound"),
      }
    }

    revalidatePath("/collection")
    revalidatePath("/")
    revalidatePath("/binders", "layout")

    return {
      ok: true,
      message: t("action.updatedNamed", { name: item.name }),
    }
  } catch (error) {
    console.error("updateCollectionItemAction failed", error)
    return {
      ok: false,
      message: t("action.updateFailed"),
    }
  }
}

export async function deleteCollectionItemAction(
  id: string,
): Promise<ActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) {
    return user
  }

  try {
    const existing = await getCollectionItemById(id, user.userId)
    if (!existing) {
      return {
        ok: false,
        message: t("action.itemNotFound"),
      }
    }

    const deleted = await deleteCollectionItem(id, user.userId)

    if (!deleted) {
      return {
        ok: false,
        message: t("action.itemNotFound"),
      }
    }

    revalidatePath("/collection")
    revalidatePath("/")
    revalidatePath("/binders", "layout")

    return {
      ok: true,
      message: t("action.deletedNamed", { name: existing.name }),
    }
  } catch (error) {
    console.error("deleteCollectionItemAction failed", error)
    return {
      ok: false,
      message: t("action.deleteFailed"),
    }
  }
}
