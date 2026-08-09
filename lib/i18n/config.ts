export const locales = ["en", "nl"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeCookieName = "thelaryon-locale"

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "nl"
}

/** Prefer Dutch only when the browser language is Dutch (`nl` / `nl-NL` / …). */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale

  const parts = header.split(",").map((part) => {
    const [tag, ...params] = part.trim().split(";")
    const qParam = params.find((param) => param.trim().startsWith("q="))
    const q = qParam ? Number.parseFloat(qParam.split("=")[1] ?? "1") : 1
    return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 1 }
  })

  parts.sort((a, b) => b.q - a.q)

  for (const { tag } of parts) {
    if (tag === "*" || !tag) continue
    if (tag === "nl" || tag.startsWith("nl-")) return "nl"
    if (tag === "en" || tag.startsWith("en-")) return "en"
  }

  return defaultLocale
}

export function intlLocale(locale: Locale): string {
  return locale === "nl" ? "nl-NL" : "en-GB"
}
