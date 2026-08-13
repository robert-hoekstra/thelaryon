import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Geist_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google"

import { CursorSearchlight } from "@/components/effects/cursor-searchlight"
import { LocaleProvider } from "@/components/i18n/locale-provider"
import { AppHeader } from "@/components/layout/app-header"
import { MobileNavigation } from "@/components/layout/mobile-navigation"
import { Toaster } from "@/components/ui/toast"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import { countIncomingPendingFriendRequests } from "@/lib/friends/service"
import { createTranslator } from "@/lib/i18n/dictionaries"
import { getLocale } from "@/lib/i18n/get-locale"

import "./globals.css"

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = createTranslator(locale)

  return {
    title: {
      default: "Thelaryon",
      template: "%s · Thelaryon",
    },
    description: t("meta.description"),
    metadataBase: new URL("https://thelaryon.com"),
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale()
  const { data: session } = await auth.getSession()
  let pendingFriendRequests = 0

  if (session?.user) {
    const userId = await ensureAppUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
    pendingFriendRequests = await countIncomingPendingFriendRequests(userId)
  }

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <CursorSearchlight />
        <LocaleProvider locale={locale}>
          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            <AppHeader pendingFriendRequests={pendingFriendRequests} />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-10 md:pt-8">
              {children}
            </main>
            <MobileNavigation pendingFriendRequests={pendingFriendRequests} />
          </div>
          <Toaster />
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
