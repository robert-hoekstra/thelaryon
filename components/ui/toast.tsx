"use client"

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-ink/15 bg-surface-elevated text-ink shadow-lg",
          title: "text-sm font-semibold text-ink",
          description: "text-sm text-ink-soft",
          success: "border-mana-green/30",
          error: "border-mana-red/30",
          closeButton: "bg-surface text-ink border-ink/15",
        },
      }}
    />
  )
}

export const toast = {
  success(message: string) {
    sonnerToast.success(message)
  },
  error(message: string) {
    sonnerToast.error(message)
  },
  message(message: string) {
    sonnerToast(message)
  },
  fromActionResult(result: { ok: boolean; message: string }) {
    if (result.ok) {
      sonnerToast.success(result.message)
    } else {
      sonnerToast.error(result.message)
    }
  },
}
