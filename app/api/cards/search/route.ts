import { NextResponse } from "next/server"
import { z } from "zod"

import { getTranslator } from "@/lib/i18n/get-locale"
import { ScryfallApiError, searchCards } from "@/lib/scryfall/client"

const searchSchema = z.object({
  q: z.string().trim().min(1).max(200),
})

export async function GET(request: Request) {
  const t = await getTranslator()
  const { searchParams } = new URL(request.url)
  const parsed = searchSchema.safeParse({
    q: searchParams.get("q") ?? "",
  })

  if (!parsed.success) {
    return NextResponse.json(
      { message: t("api.invalidSearchQuery") },
      { status: 400 },
    )
  }

  try {
    const cards = await searchCards(parsed.data.q)

    return NextResponse.json({
      data: cards,
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

    console.error("Card search failed", error)

    return NextResponse.json(
      { message: t("api.searchFailed") },
      { status: 500 },
    )
  }
}
