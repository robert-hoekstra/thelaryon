import type { BinderPageSide } from "@/types/binder"

export type BinderLayoutConfig = {
  pageCount: number
  rowsPerPage: number
  columnsPerPage: number
  doubleSided: boolean
}

export type BinderSlotPosition = {
  pageNumber: number
  side: BinderPageSide
  position: number
}

export function slotsPerSide(config: Pick<BinderLayoutConfig, "rowsPerPage" | "columnsPerPage">) {
  return config.rowsPerPage * config.columnsPerPage
}

export function sidesPerPage(doubleSided: boolean): BinderPageSide[] {
  return doubleSided ? ["front", "back"] : ["front"]
}

export function totalSlotCapacity(config: BinderLayoutConfig): number {
  return (
    config.pageCount *
    slotsPerSide(config) *
    (config.doubleSided ? 2 : 1)
  )
}

export function displayPageCount(config: Pick<BinderLayoutConfig, "pageCount" | "doubleSided">) {
  return config.pageCount * (config.doubleSided ? 2 : 1)
}

/**
 * Converts a physical (page, side) into a 1-based display page number
 * used in the binder viewer (each side counts as a page).
 */
export function toDisplayPageNumber(
  pageNumber: number,
  side: BinderPageSide,
  doubleSided: boolean,
): number {
  if (!doubleSided) {
    return pageNumber
  }
  return (pageNumber - 1) * 2 + (side === "back" ? 2 : 1)
}

/**
 * Converts a 1-based display page number back to physical page + side.
 */
export function fromDisplayPageNumber(
  displayPage: number,
  doubleSided: boolean,
): { pageNumber: number; side: BinderPageSide } {
  if (!doubleSided) {
    return { pageNumber: displayPage, side: "front" }
  }
  const pageNumber = Math.ceil(displayPage / 2)
  const side: BinderPageSide = displayPage % 2 === 0 ? "back" : "front"
  return { pageNumber, side }
}

export function generateSlotPositions(
  config: BinderLayoutConfig,
): BinderSlotPosition[] {
  const positions: BinderSlotPosition[] = []
  const perSide = slotsPerSide(config)
  const sides = sidesPerPage(config.doubleSided)

  for (let pageNumber = 1; pageNumber <= config.pageCount; pageNumber++) {
    for (const side of sides) {
      for (let position = 0; position < perSide; position++) {
        positions.push({ pageNumber, side, position })
      }
    }
  }

  return positions
}

export function positionToRowCol(
  position: number,
  columnsPerPage: number,
): { row: number; col: number } {
  return {
    row: Math.floor(position / columnsPerPage),
    col: position % columnsPerPage,
  }
}
