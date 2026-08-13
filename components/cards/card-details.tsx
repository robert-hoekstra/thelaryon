"use client"

import { CardImage } from "@/components/cards/card-image"
import { CardTilt } from "@/components/cards/card-tilt"
import { ManaCost } from "@/components/cards/mana-cost"
import { useLocale, useTranslations } from "@/components/i18n/locale-provider"
import { formatEuroPrice } from "@/lib/pricing/price"
import { cn } from "@/lib/utils"
import type { Card, CardFace, CardLegality } from "@/types/card"
import type { ReactNode } from "react"

type CardDetailsProps = {
  card: Card
  actions?: ReactNode
}

const PRIMARY_FORMATS = [
  "standard",
  "pioneer",
  "modern",
  "legacy",
  "vintage",
  "commander",
  "pauper",
  "historic",
] as const

function formatRarity(rarity: string) {
  return rarity.replaceAll("_", " ")
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ")
}

function hasFaceArt(face: CardFace) {
  return Boolean(face.image.large ?? face.image.normal ?? face.image.small)
}

function hasFaceText(face: CardFace) {
  return Boolean(
    face.typeLine ||
      face.oracleText ||
      face.manaCost ||
      face.power ||
      face.toughness ||
      face.loyalty ||
      face.defense,
  )
}

function formatPt(face: Pick<CardFace, "power" | "toughness" | "loyalty" | "defense">) {
  if (face.loyalty) return face.loyalty
  if (face.defense) return face.defense
  if (face.power != null && face.toughness != null) {
    return `${face.power}/${face.toughness}`
  }
  return null
}

function FaceCard({
  face,
  label,
  priority,
}: {
  face: CardFace
  label: string
  priority?: boolean
}) {
  const imageSrc = face.image.large ?? face.image.normal ?? face.image.small

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </p>
      <CardTilt className="rounded-2xl">
        <div className="relative aspect-[5/7] overflow-hidden rounded-2xl bg-surface shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)] ring-1 ring-ink/20">
          {imageSrc ? (
            <CardImage
              src={imageSrc}
              alt={face.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 90vw, 280px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-soft">
              —
            </div>
          )}
        </div>
      </CardTilt>
      <p className="text-sm font-semibold text-ink">{face.name}</p>
    </div>
  )
}

function MetaTile({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl bg-surface/80 p-4 ring-1 ring-ink/15">
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{children}</dd>
    </div>
  )
}

function OracleBlock({
  title,
  manaCost,
  typeLine,
  oracleText,
  flavorText,
  stats,
  statsLabel,
}: {
  title?: string
  manaCost?: string
  typeLine?: string
  oracleText?: string
  flavorText?: string
  stats?: string | null
  statsLabel?: string
}) {
  if (!typeLine && !oracleText && !manaCost && !stats && !flavorText) {
    return null
  }

  return (
    <section className="space-y-3 rounded-2xl bg-surface/80 p-4 ring-1 ring-ink/15 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          {title ? (
            <h2 className="text-base font-semibold text-ink">{title}</h2>
          ) : null}
          {typeLine ? (
            <p className="text-sm font-medium text-ink-soft">{typeLine}</p>
          ) : null}
        </div>
        <ManaCost cost={manaCost} />
      </div>

      {oracleText ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {oracleText}
        </p>
      ) : null}

      {flavorText ? (
        <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-ink-soft">
          {flavorText}
        </p>
      ) : null}

      {stats ? (
        <p className="text-sm font-semibold text-ink">
          {statsLabel ? `${statsLabel}: ` : null}
          {stats}
        </p>
      ) : null}
    </section>
  )
}

function legalityClass(status: CardLegality) {
  switch (status) {
    case "legal":
      return "bg-mana-green/15 text-mana-green ring-mana-green/30"
    case "banned":
      return "bg-mana-red/15 text-mana-red ring-mana-red/30"
    case "restricted":
      return "bg-gold/15 text-gold ring-gold/30"
    default:
      return "bg-ink/10 text-ink-soft ring-ink/15"
  }
}

function legalityLabel(
  status: CardLegality,
  t: ReturnType<typeof useTranslations>,
) {
  switch (status) {
    case "legal":
      return t("card.legality.legal")
    case "banned":
      return t("card.legality.banned")
    case "restricted":
      return t("card.legality.restricted")
    default:
      return t("card.legality.not_legal")
  }
}

export function CardDetails({ card, actions }: CardDetailsProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const faces = card.faces ?? []
  const artFaces = faces.filter(hasFaceArt)
  const textFaces = faces.filter(hasFaceText)
  const isDoubleFacedArt = artFaces.length >= 2
  const showFaceOracle = textFaces.length >= 2
  const imageSrc = card.image.large ?? card.image.normal ?? card.image.small
  const finishes =
    card.finishes.length > 0
      ? card.finishes.map((finish) => finish.replaceAll("_", " ")).join(", ")
      : t("card.unknownFinish")

  const rootStats = formatPt(card)
  const colorIdentity =
    card.colorIdentity && card.colorIdentity.length > 0
      ? card.colorIdentity.join("")
      : card.colors && card.colors.length > 0
        ? card.colors.join("")
        : "C"

  const keywords =
    card.keywords && card.keywords.length > 0
      ? card.keywords.join(", ")
      : null

  const releasedAt = card.releasedAt
    ? new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(card.releasedAt))
    : null

  const legalities = PRIMARY_FORMATS.map((format) => {
    const status = card.legalities?.[format]
    if (!status) return null
    return { format, status }
  }).filter(Boolean) as Array<{ format: string; status: CardLegality }>

  function statsLabelFor(
    face: Pick<CardFace, "loyalty" | "defense" | "power" | "toughness">,
  ) {
    if (face.loyalty) return t("card.loyalty")
    if (face.defense) return t("card.defense")
    if (face.power != null && face.toughness != null) return t("card.powerToughness")
    return undefined
  }

  return (
    <article className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_1.15fr] md:items-start md:gap-8">
      <div className="order-2 md:sticky md:top-24 md:order-0 md:self-start">
        {isDoubleFacedArt ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {artFaces.map((face, index) => (
              <FaceCard
                key={`${face.name}-${index}`}
                face={face}
                label={index === 0 ? t("card.frontFace") : t("card.backFace")}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <CardTilt className="mx-auto w-full max-w-sm rounded-2xl md:mx-0">
            <div className="relative aspect-[5/7] overflow-hidden rounded-2xl bg-surface shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)] ring-1 ring-ink/20">
              {imageSrc ? (
                <CardImage
                  src={imageSrc}
                  alt={card.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-ink-soft">
                  {t("card.noImage")}
                </div>
              )}
            </div>
          </CardTilt>
        )}
      </div>

      <div className="order-1 space-y-5 md:order-0 md:space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
            {card.setCode} · #{card.collectorNumber}
            {isDoubleFacedArt ? ` · ${t("card.doubleFaced")}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink sm:text-4xl">
              {card.name}
            </h1>
            {!showFaceOracle ? <ManaCost cost={card.manaCost} className="mt-1" /> : null}
          </div>
          {card.typeLine && !showFaceOracle ? (
            <p className="mt-2 text-base text-ink-soft">{card.typeLine}</p>
          ) : null}
          <p className="mt-2 text-base text-ink-soft">{card.setName}</p>
        </div>

        {actions}

        {showFaceOracle
          ? textFaces.map((face, index) => (
              <OracleBlock
                key={`${face.name}-oracle-${index}`}
                title={face.name}
                manaCost={face.manaCost}
                typeLine={face.typeLine}
                oracleText={face.oracleText}
                flavorText={face.flavorText}
                stats={formatPt(face)}
                statsLabel={statsLabelFor(face)}
              />
            ))
          : (
              <OracleBlock
                manaCost={undefined}
                typeLine={undefined}
                oracleText={card.oracleText}
                flavorText={card.flavorText}
                stats={rootStats}
                statsLabel={statsLabelFor(card)}
              />
            )}

        <dl className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <MetaTile label={t("card.rarity")}>
            <span className="capitalize">{formatRarity(card.rarity)}</span>
          </MetaTile>

          <MetaTile label={t("card.finishes")}>
            <span className="capitalize">{finishes}</span>
          </MetaTile>

          <MetaTile label={t("card.eurPrice")}>
            <span className="text-gold">
              {formatEuroPrice(card.prices.eur, locale)}
            </span>
          </MetaTile>

          <MetaTile label={t("card.eurFoil")}>
            <span className="text-gold">
              {formatEuroPrice(card.prices.eurFoil, locale)}
            </span>
          </MetaTile>

          {card.cmc != null ? (
            <MetaTile label={t("card.manaValue")}>{card.cmc}</MetaTile>
          ) : null}

          <MetaTile label={t("card.colorIdentity")}>
            {colorIdentity === "C" ? (
              t("card.colorless")
            ) : (
              <ManaCost
                cost={colorIdentity
                  .split("")
                  .map((color) => `{${color}}`)
                  .join("")}
              />
            )}
          </MetaTile>

          {card.artist ? (
            <MetaTile label={t("card.artist")}>{card.artist}</MetaTile>
          ) : null}

          {releasedAt ? (
            <MetaTile label={t("card.released")}>{releasedAt}</MetaTile>
          ) : null}

          {card.lang ? (
            <MetaTile label={t("card.language")}>
              <span className="uppercase">{card.lang}</span>
            </MetaTile>
          ) : null}

          {card.layout ? (
            <MetaTile label={t("card.layout")}>
              <span className="capitalize">{formatLabel(card.layout)}</span>
            </MetaTile>
          ) : null}

          {card.borderColor ? (
            <MetaTile label={t("card.border")}>
              <span className="capitalize">{formatLabel(card.borderColor)}</span>
            </MetaTile>
          ) : null}
        </dl>

        {keywords ? (
          <div className="rounded-2xl bg-surface/80 p-4 ring-1 ring-ink/15">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              {t("card.keywords")}
            </p>
            <p className="mt-2 text-sm text-ink">{keywords}</p>
          </div>
        ) : null}

        {(card.promo ||
          card.fullArt ||
          card.booster === false ||
          (card.frameEffects && card.frameEffects.length > 0) ||
          (card.promoTypes && card.promoTypes.length > 0)) && (
          <div className="flex flex-wrap gap-2">
            {card.fullArt ? (
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent ring-1 ring-accent/30">
                {t("card.badgeFullArt")}
              </span>
            ) : null}
            {card.promo ? (
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-gold/30">
                {t("card.badgePromo")}
              </span>
            ) : null}
            {card.booster === false ? (
              <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink-soft ring-1 ring-ink/15">
                {t("card.badgeNotInBooster")}
              </span>
            ) : null}
            {card.frameEffects?.map((effect) => (
              <span
                key={effect}
                className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold capitalize text-ink-soft ring-1 ring-ink/15"
              >
                {formatLabel(effect)}
              </span>
            ))}
            {card.promoTypes?.map((type) => (
              <span
                key={type}
                className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold capitalize text-ink-soft ring-1 ring-ink/15"
              >
                {formatLabel(type)}
              </span>
            ))}
          </div>
        )}

        {legalities.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">
              {t("card.legalities")}
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {legalities.map(({ format, status }) => (
                <li
                  key={format}
                  className={cn(
                    "rounded-xl px-3 py-2 ring-1",
                    legalityClass(status),
                  )}
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-80">
                    {formatLabel(format)}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold capitalize">
                    {legalityLabel(status, t)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm text-ink-soft">{t("card.priceDisclaimer")}</p>
          {card.scryfallUri ? (
            <a
              href={card.scryfallUri}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-accent transition hover:text-accent/80"
            >
              {t("card.viewOnScryfall")}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
