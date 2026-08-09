import "server-only"

import { cookies, headers } from "next/headers"

import {
  defaultLocale,
  isLocale,
  localeCookieName,
  localeFromAcceptLanguage,
  type Locale,
} from "./config"
import { createTranslator } from "./dictionaries"

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(localeCookieName)?.value

  if (isLocale(cookieLocale)) {
    return cookieLocale
  }

  const headerStore = await headers()
  return localeFromAcceptLanguage(headerStore.get("accept-language"))
}

export async function getTranslator() {
  const locale = await getLocale()
  return createTranslator(locale)
}

export { defaultLocale, localeCookieName }
