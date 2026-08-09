import type { Card } from "@/types/card"

import { CardGridItem } from "./card-grid-item"

type CardGridProps = {
  cards: Card[]
  showQuickActions?: boolean
  isAuthenticated?: boolean
}

export function CardGrid({
  cards,
  showQuickActions = false,
  isAuthenticated = false,
}: CardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((card) => (
        <CardGridItem
          key={card.id}
          card={card}
          showQuickActions={showQuickActions}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}
