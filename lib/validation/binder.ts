import { z } from "zod"

export const binderFillStrategySchema = z.enum([
  "manual",
  "set_order",
  "collection_only",
])

export const binderSortOrderSchema = z.enum([
  "collector_number",
  "typeline",
  "color",
  "rarity",
  "cmc",
  "name",
])

export const createBinderSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    pageCount: z.number().int().min(1).max(200),
    rowsPerPage: z.number().int().min(1).max(6),
    columnsPerPage: z.number().int().min(1).max(6),
    doubleSided: z.boolean(),
    fillStrategy: binderFillStrategySchema,
    sortOrder: binderSortOrderSchema.default("collector_number"),
    setCode: z.string().trim().min(1).max(16).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.fillStrategy === "set_order" && !value.setCode) {
      ctx.addIssue({
        code: "custom",
        path: ["setCode"],
        message: "setCode required",
      })
    }
  })

export const assignBinderSlotSchema = z.object({
  collectionItemId: z.string().uuid().nullable(),
})

export const updateBinderNameSchema = z.object({
  name: z.string().trim().min(1).max(120),
})
