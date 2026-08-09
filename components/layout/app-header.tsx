import Link from "next/link"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { DesktopNavigation } from "./desktop-navigation"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-ink">
            Thelaryon
          </span>
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
              Magic
            </span>
            <span className="mana-dots" aria-hidden>
              <span className="w" />
              <span className="u" />
              <span className="b" />
              <span className="r" />
              <span className="g" />
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <DesktopNavigation />
        </div>
      </div>
      <div className="mana-ribbon" aria-hidden />
    </header>
  )
}
