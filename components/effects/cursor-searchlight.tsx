"use client"

import { useEffect, useRef } from "react"

/**
 * Soft searchlight that follows the cursor via a single composited layer.
 * Glow only — no pattern copy, so it brightens without duplicating the playmat.
 */
export function CursorSearchlight() {
  const glowRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)
  const activeRef = useRef(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const finePointer = window.matchMedia("(pointer: fine)")

    if (reducedMotion.matches || !finePointer.matches) {
      return
    }

    const glow = glowRef.current
    if (!glow) return

    function setActive(next: boolean) {
      if (activeRef.current === next) return
      activeRef.current = next
      glow!.classList.toggle("is-active", next)
    }

    function paint() {
      frameRef.current = null
      const pending = pendingRef.current
      if (!pending) return

      glow!.style.transform = `translate3d(${pending.x}px, ${pending.y}px, 0) translate(-50%, -50%)`
    }

    function onMove(event: PointerEvent) {
      pendingRef.current = { x: event.clientX, y: event.clientY }
      setActive(true)

      if (frameRef.current == null) {
        frameRef.current = requestAnimationFrame(paint)
      }
    }

    function onLeave() {
      setActive(false)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)

    return () => {
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return <div ref={glowRef} className="cursor-searchlight" aria-hidden />
}
