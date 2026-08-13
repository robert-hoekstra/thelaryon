type NavBadgeProps = {
  count: number
  /** Accessible label, e.g. "2 pending friend requests" */
  label: string
}

export function NavBadge({ count, label }: NavBadgeProps) {
  if (count <= 0) return null

  const display = count > 99 ? "99+" : String(count)

  return (
    <span
      className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mana-red px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-surface"
      aria-label={label}
    >
      {display}
    </span>
  )
}
