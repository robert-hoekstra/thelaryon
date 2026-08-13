"use client"

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type CardTiltProps = {
  children: ReactNode
  className?: string
  /** Max tilt in degrees from center. */
  maxTilt?: number
  /** Extra scale while hovering. */
  hoverScale?: number
}

const IDLE_TRANSFORM =
  "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"

/**
 * Pokemon.com-style 3D tilt with a soft glare that follows the pointer.
 * Updates the DOM imperatively to avoid React re-renders on every move.
 */
export function CardTilt({
  children,
  className,
  maxTilt = 12,
  hoverScale = 1.05,
}: CardTiltProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const frameRef = useRef<number | null>(null)
  const enabledRef = useRef(false)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const finePointer = window.matchMedia("(pointer: fine)")

    function syncEnabled() {
      enabledRef.current = !reducedMotion.matches && finePointer.matches
    }

    syncEnabled()
    reducedMotion.addEventListener("change", syncEnabled)
    finePointer.addEventListener("change", syncEnabled)

    return () => {
      reducedMotion.removeEventListener("change", syncEnabled)
      finePointer.removeEventListener("change", syncEnabled)
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  function applyTilt(clientX: number, clientY: number) {
    const el = rootRef.current
    if (!el) return

    const rect = rectRef.current
    if (!rect || rect.width === 0 || rect.height === 0) return

    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * (maxTilt * 2)
    const rotateX = (0.5 - y) * (maxTilt * 2)

    el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${hoverScale}, ${hoverScale}, 1)`
    el.style.setProperty("--shine-x", `${(x * 100).toFixed(1)}%`)
    el.style.setProperty("--shine-y", `${(y * 100).toFixed(1)}%`)
  }

  function scheduleTilt(clientX: number, clientY: number) {
    pendingRef.current = { x: clientX, y: clientY }
    if (frameRef.current != null) return

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const pending = pendingRef.current
      if (!pending) return
      applyTilt(pending.x, pending.y)
    })
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (!enabledRef.current) return

    const el = rootRef.current
    if (!el) return

    rectRef.current = el.getBoundingClientRect()
    el.dataset.tilting = "true"
    el.style.willChange = "transform"
    applyTilt(event.clientX, event.clientY)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!enabledRef.current || !rectRef.current) return
    scheduleTilt(event.clientX, event.clientY)
  }

  function handlePointerLeave() {
    if (!enabledRef.current) return

    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    pendingRef.current = null
    rectRef.current = null

    const el = rootRef.current
    if (!el) return

    el.dataset.tilting = "false"
    el.style.transform = IDLE_TRANSFORM
    el.style.setProperty("--shine-x", "50%")
    el.style.setProperty("--shine-y", "50%")
    el.style.willChange = "auto"
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "card-tilt-root relative z-10 transform-gpu transition-[transform,filter] duration-150 ease-out",
        className,
      )}
      data-tilting="false"
      style={{ transform: IDLE_TRANSFORM }}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      <div className="card-tilt-glare pointer-events-none absolute inset-0 z-10 rounded-[inherit]" />
    </div>
  )
}
