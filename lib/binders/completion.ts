import { calculateCompletionPercentage } from "@/lib/sets/completion"
import type { BinderProgress, BinderSlotView } from "@/types/binder"

/**
 * Progress is based on planned/expected cards when present.
 * Empty manual binders fall back to placed vs capacity.
 */
export function calculateBinderProgress(
  slots: Pick<
    BinderSlotView,
    "expectedScryfallId" | "collectionItemId" | "collected"
  >[],
  totalSlots: number,
): BinderProgress {
  const expectedSlots = slots.filter((slot) => slot.expectedScryfallId != null)
  const placedCount = slots.filter((slot) => slot.collectionItemId != null).length

  if (expectedSlots.length > 0) {
    const collectedCount = expectedSlots.filter((slot) => slot.collected).length
    const expectedCount = expectedSlots.length
    const missingCount = expectedCount - collectedCount

    return {
      expectedCount,
      collectedCount,
      missingCount,
      completionPercentage: calculateCompletionPercentage(
        collectedCount,
        expectedCount,
      ),
      totalSlots,
      placedCount,
    }
  }

  return {
    expectedCount: 0,
    collectedCount: placedCount,
    missingCount: 0,
    completionPercentage: calculateCompletionPercentage(placedCount, totalSlots),
    totalSlots,
    placedCount,
  }
}
