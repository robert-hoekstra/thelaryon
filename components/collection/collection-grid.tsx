import type { CollectionItem } from "@/types/collection"

import { CollectionItemCard } from "./collection-item-card"

type CollectionGridProps = {
  items: CollectionItem[]
}

export function CollectionGrid({ items }: CollectionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <CollectionItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
