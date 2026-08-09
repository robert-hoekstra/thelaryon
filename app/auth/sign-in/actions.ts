"use server"

import { redirect } from "next/navigation"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const t = await getTranslator()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: t("auth.signIn.missingFields") }
  }

  const { data, error } = await auth.signIn.email({
    email,
    password,
  })

  if (error) {
    return { error: error.message || t("auth.signIn.failed") }
  }

  if (data?.user) {
    await ensureAppUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
    })
  }

  redirect("/collection")
}
