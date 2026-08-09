import { NextResponse } from "next/server"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import {
  addCollectionItem,
  listCollectionItems,
} from "@/lib/collection/service"
import { getTranslator } from "@/lib/i18n/get-locale"
import { ScryfallApiError } from "@/lib/scryfall/client"
import { addCollectionItemSchema } from "@/lib/validation/collection"

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

export async function GET() {
  const t = await getTranslator()

  try {
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return NextResponse.json(
        { message: t("api.unauthorized") },
        { status: 401 },
      )
    }

    const items = await listCollectionItems(userId)
    return NextResponse.json({ data: items })
  } catch (error) {
    console.error("GET /api/collection failed", error)
    return NextResponse.json(
      { message: t("api.collectionFailed") },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const t = await getTranslator()
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

  const parsed = addCollectionItemSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: t("action.invalidCollectionData") },
      { status: 400 },
    )
  }

  try {
    const item = await addCollectionItem(parsed.data, userId)
    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    if (error instanceof ScryfallApiError) {
      return NextResponse.json(
        { message: error.message },
        {
          status:
            error.status >= 400 && error.status < 600 ? error.status : 502,
        },
      )
    }

    console.error("POST /api/collection failed", error)
    return NextResponse.json(
      { message: t("action.addFailed") },
      { status: 500 },
    )
  }
}
