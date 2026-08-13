"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useTranslations } from "@/components/i18n/locale-provider"
import { NavBadge } from "@/components/layout/nav-badge"
import { cn } from "@/lib/utils"

type MobileNavigationProps = {
  pendingFriendRequests?: number
}

export function MobileNavigation({
  pendingFriendRequests = 0,
}: MobileNavigationProps) {
  const pathname = usePathname()
  const t = useTranslations()

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/collection", label: t("nav.collection") },
    { href: "/binders", label: t("nav.binders") },
    { href: "/sets", label: t("nav.sets") },
    {
      href: "/friends",
      label: t("nav.friends"),
      badge: pendingFriendRequests,
    },
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
          const badge = "badge" in item ? item.badge : 0

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center rounded-lg px-1 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-accent text-white"
                    : "bg-transparent text-ink/70 hover:bg-surface-elevated hover:text-ink",
                )}
              >
                <span className="relative inline-flex">
                  {item.label}
                  <NavBadge
                    count={badge ?? 0}
                    label={t("nav.pendingFriendsBadge", { count: badge ?? 0 })}
                  />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
