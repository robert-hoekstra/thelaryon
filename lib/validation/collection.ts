import { z } from "zod"

export const cardConditionSchema = z.enum([
  "MINT",
  "NEAR_MINT",
  "EXCELLENT",
  "GOOD",
  "LIGHT_PLAYED",
  "PLAYED",
  "POOR",
])

export const cardFinishSchema = z.enum(["NON_FOIL", "FOIL", "ETCHED"])

export const addCollectionItemSchema = z.object({
  scryfallId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
  condition: cardConditionSchema.default("NEAR_MINT"),
  finish: cardFinishSchema.default("NON_FOIL"),
  language: z.string().min(2).max(10).default("en"),
  purchasePrice: z.number().nonnegative().optional(),
  purchaseDate: z.string().optional(),
})

export const updateCollectionItemSchema = z.object({
  quantity: z.number().int().min(1).max(999).optional(),
  condition: cardConditionSchema.optional(),
  finish: cardFinishSchema.optional(),
  language: z.string().min(2).max(10).optional(),
  purchasePrice: z.number().nonnegative().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
})
