import { NextResponse } from "next/server"
import { z } from "zod"

import { searchPreconDecks } from "@/lib/decks/service"
import { getTranslator } from "@/lib/i18n/get-locale"
import { MtgjsonApiError } from "@/lib/mtgjson/client"

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
    const decks = await searchPreconDecks(parsed.data.q)

    return NextResponse.json({
      data: decks,
    })
  } catch (error) {
    if (error instanceof MtgjsonApiError) {
      return NextResponse.json(
        { message: t("precon.fetchFailed") },
        {
          status:
            error.status >= 400 && error.status < 600 ? error.status : 502,
        },
      )
    }

    console.error("Precon deck search failed", error)

    return NextResponse.json(
      { message: t("precon.searchFailed") },
      { status: 500 },
    )
  }
}
