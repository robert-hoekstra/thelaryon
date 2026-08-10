"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useTranslations } from "@/components/i18n/locale-provider"
import { cn } from "@/lib/utils"

export function DesktopNavigation() {
  const pathname = usePathname()
  const t = useTranslations()

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/search", label: t("nav.search") },
    { href: "/collection", label: t("nav.collection") },
    { href: "/friends", label: t("nav.friends") },
    { href: "/profile", label: t("nav.profile") },
  ] as const

  return (
    <nav aria-label={t("nav.desktopAria")} className="hidden items-center gap-1 md:flex">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-white shadow-sm"
                : "bg-transparent text-ink/70 hover:bg-surface-elevated hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
