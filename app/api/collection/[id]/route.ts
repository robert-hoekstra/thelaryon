import { NextResponse } from "next/server"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import {
  deleteCollectionItem,
  getCollectionItemById,
  updateCollectionItem,
} from "@/lib/collection/service"
import { getTranslator } from "@/lib/i18n/get-locale"
import { updateCollectionItemSchema } from "@/lib/validation/collection"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

async function getAuthenticatedUserId() {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    return null
  }

  return ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })
}

export async function GET(_request: Request, context: RouteContext) {
  const t = await getTranslator()
  const { id } = await context.params

  try {
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return NextResponse.json(
        { message: t("api.unauthorized") },
        { status: 401 },
      )
    }

    const item = await getCollectionItemById(id, userId)

    if (!item) {
      return NextResponse.json(
        { message: t("action.itemNotFound") },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("GET /api/collection/[id] failed", error)
    return NextResponse.json(
      { message: t("api.collectionFailed") },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const t = await getTranslator()
  const { id } = await context.params
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    return NextResponse.json(
      { message: t("api.unauthorized") },
      { status: 401 },
    )
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: t("api.invalidBody") },
      { status: 400 },
    )
  }

  const parsed = updateCollectionItemSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: t("action.invalidChanges") },
      { status: 400 },
    )
  }

  try {
    const item = await updateCollectionItem(id, parsed.data, userId)

    if (!item) {
      return NextResponse.json(
        { message: t("action.itemNotFound") },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: item })
  } catch (error) {
    console.error("PATCH /api/collection/[id] failed", error)
    return NextResponse.json(
      { message: t("action.updateFailed") },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const t = await getTranslator()
  const { id } = await context.params
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    return NextResponse.json(
      { message: t("api.unauthorized") },
      { status: 401 },
    )
  }

  try {
    const deleted = await deleteCollectionItem(id, userId)

    if (!deleted) {
      return NextResponse.json(
        { message: t("action.itemNotFound") },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: { id } })
  } catch (error) {
    console.error("DELETE /api/collection/[id] failed", error)
    return NextResponse.json(
      { message: t("action.deleteFailed") },
      { status: 500 },
    )
  }
}
