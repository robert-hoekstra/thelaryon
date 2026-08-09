"use server"

import { revalidatePath } from "next/cache"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import {
  addCollectionItem,
  deleteCollectionItem,
  updateCollectionItem,
} from "@/lib/collection/service"
import { getTranslator } from "@/lib/i18n/get-locale"
import {
  addCollectionItemSchema,
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
    const item = await addCollectionItem(parsed.data, user.userId)
    revalidatePath("/collection")
    revalidatePath("/")
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

    return {
      ok: true,
      message: t("action.updated"),
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
    const deleted = await deleteCollectionItem(id, user.userId)

    if (!deleted) {
      return {
        ok: false,
        message: t("action.itemNotFound"),
      }
    }

    revalidatePath("/collection")
    revalidatePath("/")

    return {
      ok: true,
      message: t("action.deleted"),
    }
  } catch (error) {
    console.error("deleteCollectionItemAction failed", error)
    return {
      ok: false,
      message: t("action.deleteFailed"),
    }
  }
}
