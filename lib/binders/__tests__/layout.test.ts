import { describe, expect, it } from "vitest"

import {
  displayPageCount,
  fromDisplayPageNumber,
  generateSlotPositions,
  toDisplayPageNumber,
  totalSlotCapacity,
} from "../layout"

describe("binder layout", () => {
  it("calculates capacity for double-sided binders", () => {
    expect(
      totalSlotCapacity({
        pageCount: 40,
        rowsPerPage: 3,
        columnsPerPage: 3,
        doubleSided: true,
      }),
    ).toBe(720)
  })

  it("generates one slot per physical position", () => {
    const positions = generateSlotPositions({
      pageCount: 2,
      rowsPerPage: 2,
      columnsPerPage: 2,
      doubleSided: true,
    })

    expect(positions).toHaveLength(16)
    expect(positions[0]).toEqual({
      pageNumber: 1,
      side: "front",
      position: 0,
    })
    expect(positions[4]).toEqual({
      pageNumber: 1,
      side: "back",
      position: 0,
    })
  })

  it("maps display page numbers for double-sided binders", () => {
    expect(displayPageCount({ pageCount: 40, doubleSided: true })).toBe(80)
    expect(toDisplayPageNumber(1, "front", true)).toBe(1)
    expect(toDisplayPageNumber(1, "back", true)).toBe(2)
    expect(toDisplayPageNumber(2, "front", true)).toBe(3)
    expect(fromDisplayPageNumber(2, true)).toEqual({
      pageNumber: 1,
      side: "back",
    })
  })
})
