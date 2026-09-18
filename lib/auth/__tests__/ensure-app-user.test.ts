import { describe, expect, it } from "vitest"

/**
 * Mirrors the change-detection used by ensureAppUser:
 * only write when email/name actually differ.
 */
function shouldUpdateUser(
  existing: { email: string; name: string },
  next: { email: string; name: string },
) {
  const nextName = next.name || next.email
  return existing.email !== next.email || existing.name !== nextName
}

describe("ensureAppUser write guard", () => {
  it("skips update when profile is unchanged", () => {
    expect(
      shouldUpdateUser(
        { email: "a@example.com", name: "Ada" },
        { email: "a@example.com", name: "Ada" },
      ),
    ).toBe(false)
  })

  it("updates when email changes", () => {
    expect(
      shouldUpdateUser(
        { email: "a@example.com", name: "Ada" },
        { email: "b@example.com", name: "Ada" },
      ),
    ).toBe(true)
  })

  it("updates when name changes", () => {
    expect(
      shouldUpdateUser(
        { email: "a@example.com", name: "Ada" },
        { email: "a@example.com", name: "Ada Lovelace" },
      ),
    ).toBe(true)
  })
})
