import { NextResponse } from "next/server"
import { z } from "zod"

import { getTranslator } from "@/lib/i18n/get-locale"
import { getCardById, ScryfallApiError } from "@/lib/scryfall/client"

const idSchema = z.string().uuid()

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const t = await getTranslator()
  const { id } = await context.params
  const parsed = idSchema.safeParse(id)

  if (!parsed.success) {
    return NextResponse.json(
      { message: t("api.invalidCardId") },
      { status: 400 },
    )
  }

  try {
    const card = await getCardById(parsed.data)

    return NextResponse.json({
      data: card,
    })
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

    console.error("Card fetch failed", error)

    return NextResponse.json(
      { message: t("api.cardFetchFailed") },
      { status: 500 },
    )
  }
}
