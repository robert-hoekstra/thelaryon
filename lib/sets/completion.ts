/**
 * Pure functions for set completion calculations.
 * These functions are testable without server-only restrictions.
 */

/**
 * Calculates completion percentage.
 * Returns a number between 0 and 100, rounded to one decimal.
 */
export function calculateCompletionPercentage(
  owned: number,
  total: number,
): number {
  if (total === 0) return 0
  return Math.round((owned / total) * 1000) / 10
}

/**
 * Formats a completion percentage for display.
 */
export function formatCompletionPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`
}

/**
 * Determines ownership status from a collection map.
 */
export function isOwnedInCollection(
  scryfallId: string,
  collectionMap: Map<string, { quantity: number }>,
): boolean {
  const item = collectionMap.get(scryfallId)
  return item != null && item.quantity > 0
}

/**
 * Gets the quantity owned from a collection map.
 */
export function getQuantityOwned(
  scryfallId: string,
  collectionMap: Map<string, { quantity: number }>,
): number {
  return collectionMap.get(scryfallId)?.quantity ?? 0
}
