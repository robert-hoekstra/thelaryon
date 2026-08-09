import { intlLocale, type Locale } from "@/lib/i18n/config"
import { createTranslator } from "@/lib/i18n/dictionaries"
import type { Card } from "@/types/card"
import type { CardFinish } from "@/types/collection"

export function getCardPrice(
  card: Card,
  finish: CardFinish = "NON_FOIL",
): number | null {
  if (finish === "FOIL" || finish === "ETCHED") {
    return card.prices.eurFoil ?? card.prices.eur
  }

  return card.prices.eur
}

export function formatEuroPrice(
  price: number | null,
  locale: Locale = "en",
): string {
  if (price == null) {
    return createTranslator(locale)("price.unavailable")
  }

  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
  }).format(price)
}
