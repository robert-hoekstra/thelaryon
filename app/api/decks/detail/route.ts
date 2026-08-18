import { NextResponse } from "next/server"
import { z } from "zod"

import {
  getPreconDeck,
  PreconDeckNotFoundError,
  PreconDeckTooLargeError,
} from "@/lib/decks/service"
import { getTranslator } from "@/lib/i18n/get-locale"
import { MtgjsonApiError } from "@/lib/mtgjson/client"

const detailSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
})

export async function GET(request: Request) {
  const t = await getTranslator()
  const { searchParams } = new URL(request.url)
  const parsed = detailSchema.safeParse({
    fileName: searchParams.get("fileName") ?? "",
  })

  if (!parsed.success) {
    return NextResponse.json(
      { message: t("precon.notFound") },
      { status: 400 },
    )
  }

  try {
    const deck = await getPreconDeck(parsed.data.fileName)

    return NextResponse.json({
      data: deck,
    })
  } catch (error) {
    if (error instanceof PreconDeckNotFoundError) {
      return NextResponse.json(
        { message: t("precon.notFound") },
        { status: 404 },
      )
    }

    if (error instanceof PreconDeckTooLargeError) {
      return NextResponse.json(
        { message: t("precon.tooLarge") },
        { status: 400 },
      )
    }

    if (error instanceof MtgjsonApiError) {
      return NextResponse.json(
        { message: t("precon.fetchFailed") },
        {
          status:
            error.status >= 400 && error.status < 600 ? error.status : 502,
        },
      )
    }

    console.error("Precon deck fetch failed", error)

    return NextResponse.json(
      { message: t("precon.fetchFailed") },
      { status: 500 },
    )
  }
}
