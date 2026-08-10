"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useTranslations } from "@/components/i18n/locale-provider"
import { cn } from "@/lib/utils"

export function MobileNavigation() {
  const pathname = usePathname()
  const t = useTranslations()

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/collection", label: t("nav.collection") },
    { href: "/sets", label: t("nav.sets") },
    { href: "/search", label: t("nav.search") },
    { href: "/friends", label: t("nav.friends") },
  ] as const

  return (
    <nav
      aria-label={t("nav.mobileAria")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-surface/95 backdrop-blur-md md:hidden"
    >
      <div className="mana-ribbon opacity-80" aria-hidden />
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center rounded-lg px-1 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-accent text-white"
                    : "bg-transparent text-ink/70 hover:bg-surface-elevated hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
