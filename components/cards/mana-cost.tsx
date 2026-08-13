import { cn } from "@/lib/utils"

type ManaCostProps = {
  cost?: string
  className?: string
}

/**
 * Renders Scryfall mana cost strings like `{2}{W}{U}` via Scryfall's SVG symbols.
 */
export function ManaCost({ cost, className }: ManaCostProps) {
  if (!cost) return null

  const symbols = cost.match(/\{[^}]+\}/g)
  if (!symbols?.length) {
    return <span className={cn("font-mono text-sm text-ink", className)}>{cost}</span>
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-0.5", className)}>
      {symbols.map((symbol, index) => {
        const code = symbol.slice(1, -1)
        return (
          <img
            key={`${code}-${index}`}
            src={`https://svgs.scryfall.io/card-symbols/${encodeURIComponent(code)}.svg`}
            alt={symbol}
            title={symbol}
            width={18}
            height={18}
            className="inline-block h-[1.15em] w-[1.15em]"
            loading="lazy"
          />
        )
      })}
    </span>
  )
}
