"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"
import { updateUserBoosterPackPrice } from "@/lib/user/service"

export type ProfileActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string }

const boosterPackPriceSchema = z.object({
  boosterPackPrice: z
    .union([z.number().nonnegative(), z.null()])
    .optional(),
})

export async function updateBoosterPackPriceAction(
  input: unknown,
): Promise<ProfileActionResult> {
  const t = await getTranslator()
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    return { ok: false, message: t("action.loginRequired") }
  }

  const parsed = boosterPackPriceSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: t("profile.boosterPriceInvalid") }
  }

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  try {
    await updateUserBoosterPackPrice(
      userId,
      parsed.data.boosterPackPrice ?? null,
    )
    revalidatePath("/profile")
    revalidatePath("/cards", "layout")

    return { ok: true, message: t("profile.boosterPriceSaved") }
  } catch (error) {
    console.error("updateBoosterPackPriceAction failed", error)
    return { ok: false, message: t("profile.boosterPriceSaveFailed") }
  }
}
