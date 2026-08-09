import Link from "next/link"

import { auth } from "@/lib/auth/server"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import {
  listCollectionItems,
  summarizeCollection,
} from "@/lib/collection/service"
import { getLocale, getTranslator } from "@/lib/i18n/get-locale"
import { formatEuroPrice } from "@/lib/pricing/price"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { data: session } = await auth.getSession()
  const locale = await getLocale()
  const t = await getTranslator()

  let summary = {
    totalCards: 0,
    uniqueCards: 0,
    collectionValue: 0,
    purchaseValue: 0,
    profitLoss: 0,
  }
  let hasPurchasePrices = false

  if (session?.user) {
    const userId = await ensureAppUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
    const items = await listCollectionItems(userId)
    summary = summarizeCollection(items)
    hasPurchasePrices = items.some((item) => item.purchasePrice != null)
  }

  return (
    <div className="space-y-8">
      <section className="relative max-w-2xl space-y-4 overflow-hidden rounded-3xl border border-ink/8 bg-white/55 p-6 shadow-[0_20px_50px_-32px_rgba(18,22,31,0.45)] backdrop-blur-sm sm:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 mana-ribbon opacity-90"
          aria-hidden
        />
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
            Magic: The Gathering
          </p>
          <span className="mana-dots" aria-hidden>
            <span className="w" />
            <span className="u" />
            <span className="b" />
            <span className="r" />
            <span className="g" />
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink sm:text-5xl">
          Thelaryon
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink/65">
          {session?.user
            ? t("home.welcomeBack", { name: session.user.name })
            : t("home.tagline")}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            {t("home.searchCards")}
          </Link>
          {session?.user ? (
            <Link
              href="/collection"
              className="inline-flex items-center justify-center rounded-full border border-ink/20 bg-white/80 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-mana-blue/40 hover:bg-white"
            >
              {t("home.viewCollection")}
            </Link>
          ) : (
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center rounded-full border border-ink/20 bg-white/80 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-mana-blue/40 hover:bg-white"
            >
              {t("home.createAccount")}
            </Link>
          )}
        </div>
      </section>

      {session?.user ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: t("home.statCards"),
              value: String(summary.totalCards),
              accent: "border-l-mana-white",
            },
            {
              label: t("home.statUnique"),
              value: String(summary.uniqueCards),
              accent: "border-l-mana-blue",
            },
            {
              label: t("home.statCollectionValue"),
              value: formatEuroPrice(
                summary.totalCards > 0 ? summary.collectionValue : null,
                locale,
              ),
              accent: "border-l-mana-green",
            },
            {
              label: t("home.statProfitLoss"),
              value:
                hasPurchasePrices && summary.totalCards > 0
                  ? formatEuroPrice(summary.profitLoss, locale)
                  : "—",
              accent: "border-l-mana-red",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border-l-4 bg-white/80 px-4 py-4 ring-1 ring-ink/5 ${stat.accent}`}
            >
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                {stat.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">{stat.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        {[
          {
            title: t("home.searchTitle"),
            body: t("home.searchBody"),
            href: "/search",
            tint: "hover:ring-mana-blue/25",
          },
          {
            title: t("home.collectionTitle"),
            body: session?.user
              ? t("home.collectionBodyLoggedIn")
              : t("home.collectionBodyLoggedOut"),
            href: session?.user ? "/collection" : "/auth/sign-in",
            tint: "hover:ring-mana-green/25",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`rounded-2xl bg-white/70 p-5 ring-1 ring-ink/5 transition hover:bg-white ${item.tint}`}
          >
            <h2 className="text-sm font-semibold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.body}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
