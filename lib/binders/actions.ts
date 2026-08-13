"use server"

import { revalidatePath } from "next/cache"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import {
  assignBinderSlot,
  continueBinderSeries,
  createBinder,
  deleteBinder,
  moveBinderSlotAssignment,
  renameBinder,
} from "@/lib/binders/service"
import { getTranslator } from "@/lib/i18n/get-locale"
import {
  assignBinderSlotSchema,
  createBinderSchema,
  updateBinderNameSchema,
} from "@/lib/validation/binder"

export type BinderActionResult =
  | {
      ok: true
      message: string
      binderId?: string
      volumeCount?: number
    }
  | { ok: false; message: string }

async function requireUserId(): Promise<
  { ok: true; userId: string } | { ok: false; message: string }
> {
  const t = await getTranslator()
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    return { ok: false, message: t("action.loginRequired") }
  }

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  return { ok: true, userId }
}

function createErrorMessage(
  error: unknown,
  t: Awaited<ReturnType<typeof getTranslator>>,
) {
  if (!(error instanceof Error)) {
    return t("binders.errorGeneric")
  }

  switch (error.message) {
    case "BINDER_TOO_LARGE":
      return t("binders.errorTooLarge")
    case "SET_CODE_REQUIRED":
      return t("binders.errorSetRequired")
    case "COLLECTION_ITEM_NOT_FOUND":
      return t("binders.errorCollectionItem")
    case "INVALID_CAPACITY":
      return t("binders.errorInvalid")
    case "BINDER_NOT_FOUND":
      return t("binders.errorNotFound")
    case "CONTINUE_NOT_SUPPORTED":
      return t("binders.errorContinueUnsupported")
    case "NO_REMAINING_CARDS":
      return t("binders.errorNoRemaining")
    default:
      return t("binders.errorGeneric")
  }
}

export async function createBinderAction(
  input: unknown,
): Promise<BinderActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  const parsed = createBinderSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: t("binders.errorInvalid") }
  }

  try {
    const result = await createBinder(parsed.data, user.userId)
    revalidatePath("/binders", "layout")
    return {
      ok: true,
      message:
        result.volumeCount > 1
          ? t("binders.createdSeries", { count: result.volumeCount })
          : t("binders.created"),
      binderId: result.primaryBinderId,
      volumeCount: result.volumeCount,
    }
  } catch (error) {
    console.error("createBinderAction failed", error)
    return { ok: false, message: createErrorMessage(error, t) }
  }
}

export async function continueBinderSeriesAction(
  binderId: string,
): Promise<BinderActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  try {
    const result = await continueBinderSeries(binderId, user.userId)
    revalidatePath("/binders", "layout")
    return {
      ok: true,
      message: t("binders.continuedSeries", { count: result.volumeCount }),
      binderId: result.primaryBinderId,
      volumeCount: result.volumeCount,
    }
  } catch (error) {
    console.error("continueBinderSeriesAction failed", error)
    return { ok: false, message: createErrorMessage(error, t) }
  }
}

export async function renameBinderAction(
  binderId: string,
  input: unknown,
): Promise<BinderActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  const parsed = updateBinderNameSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: t("binders.errorInvalid") }
  }

  try {
    const binder = await renameBinder(binderId, parsed.data.name, user.userId)
    if (!binder) {
      return { ok: false, message: t("binders.errorNotFound") }
    }

    revalidatePath("/binders", "layout")
    revalidatePath(`/binders/${binderId}`)
    return { ok: true, message: t("binders.renamed") }
  } catch (error) {
    console.error("renameBinderAction failed", error)
    return { ok: false, message: t("binders.errorGeneric") }
  }
}

export async function deleteBinderAction(
  binderId: string,
): Promise<BinderActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  try {
    const deleted = await deleteBinder(binderId, user.userId)
    if (!deleted) {
      return { ok: false, message: t("binders.errorNotFound") }
    }

    revalidatePath("/binders", "layout")
    return { ok: true, message: t("binders.deleted") }
  } catch (error) {
    console.error("deleteBinderAction failed", error)
    return { ok: false, message: t("binders.errorGeneric") }
  }
}

export async function assignBinderSlotAction(
  slotId: string,
  binderId: string,
  input: unknown,
): Promise<BinderActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  const parsed = assignBinderSlotSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: t("binders.errorInvalid") }
  }

  try {
    const slot = await assignBinderSlot(slotId, parsed.data, user.userId)
    if (!slot) {
      return { ok: false, message: t("binders.errorNotFound") }
    }

    revalidatePath("/binders", "layout")
    revalidatePath(`/binders/${binderId}`)
    return {
      ok: true,
      message: parsed.data.collectionItemId
        ? t("binders.slotAssigned")
        : t("binders.slotCleared"),
    }
  } catch (error) {
    console.error("assignBinderSlotAction failed", error)
    return { ok: false, message: createErrorMessage(error, t) }
  }
}

export async function moveBinderSlotAction(
  fromSlotId: string,
  toSlotId: string,
  binderId: string,
): Promise<BinderActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  try {
    const moved = await moveBinderSlotAssignment(
      fromSlotId,
      toSlotId,
      user.userId,
    )
    if (!moved) {
      return { ok: false, message: t("binders.errorMove") }
    }

    revalidatePath(`/binders/${binderId}`)
    return { ok: true, message: t("binders.slotMoved") }
  } catch (error) {
    console.error("moveBinderSlotAction failed", error)
    return { ok: false, message: t("binders.errorGeneric") }
  }
}
