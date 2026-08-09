"use server"

import { redirect } from "next/navigation"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { getTranslator } from "@/lib/i18n/get-locale"

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const t = await getTranslator()
  const email = String(formData.get("email") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password || !name) {
    return { error: t("auth.signUp.missingFields") }
  }

  if (password.length < 8) {
    return { error: t("auth.signUp.passwordLength") }
  }

  const { data, error } = await auth.signUp.email({
    email,
    name,
    password,
  })

  if (error) {
    return { error: error.message || t("auth.signUp.failed") }
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
