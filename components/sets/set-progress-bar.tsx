"use client"

import { cn } from "@/lib/utils"

type SetProgressBarProps = {
  percentage: number
  size?: "sm" | "md"
  className?: string
}

export function SetProgressBar({
  percentage,
  size = "sm",
  className,
}: SetProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage))

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-surface/50",
        size === "sm" ? "h-2" : "h-3",
        className,
      )}
      role="progressbar"
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          clampedPercentage === 100
            ? "bg-mana-green"
            : clampedPercentage >= 75
              ? "bg-accent"
              : clampedPercentage >= 50
                ? "bg-gold"
                : "bg-ink-soft/50",
        )}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  )
}
