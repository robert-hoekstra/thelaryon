"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"

import type { Locale } from "@/lib/i18n/config"
import {
  createTranslator,
  type MessageKey,
  type TranslateParams,
} from "@/lib/i18n/dictionaries"

type LocaleContextValue = {
  locale: Locale
  t: (key: MessageKey, params?: TranslateParams) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: createTranslator(locale),
    }),
    [locale],
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return context
}

export function useTranslations() {
  return useLocale().t
}
