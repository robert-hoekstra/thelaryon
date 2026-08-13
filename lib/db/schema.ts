import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

export const cardConditionEnum = pgEnum("card_condition", [
  "MINT",
  "NEAR_MINT",
  "EXCELLENT",
  "GOOD",
  "LIGHT_PLAYED",
  "PLAYED",
  "POOR",
])

export const cardFinishEnum = pgEnum("card_finish", [
  "NON_FOIL",
  "FOIL",
  "ETCHED",
])

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "declined",
])

export const binderFillStrategyEnum = pgEnum("binder_fill_strategy", [
  "manual",
  "set_order",
  "collection_only",
])

export const binderSortOrderEnum = pgEnum("binder_sort_order", [
  "collector_number",
  "typeline",
  "color",
  "rarity",
  "cmc",
  "name",
])

export const binderPageSideEnum = pgEnum("binder_page_side", [
  "front",
  "back",
])

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  /** EUR price paid for a booster pack; used as purchase-price default ÷ 14. */
  boosterPackPrice: numeric("booster_pack_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const collectionItems = pgTable("collection_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scryfallId: uuid("scryfall_id").notNull(),
  name: text("name").notNull(),
  setCode: text("set_code").notNull(),
  setName: text("set_name").notNull(),
  collectorNumber: text("collector_number").notNull(),
  quantity: integer("quantity").notNull().default(1),
  condition: cardConditionEnum("condition").notNull().default("NEAR_MINT"),
  finish: cardFinishEnum("finish").notNull().default("NON_FOIL"),
  language: text("language").notNull().default("en"),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }),
  currentPrice: numeric("current_price", { precision: 10, scale: 2 }),
  imageSmall: text("image_small"),
  imageNormal: text("image_normal"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: uuid("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniquePair: unique().on(table.requesterId, table.addresseeId),
  }),
)

export const binders = pgTable("binders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  pageCount: integer("page_count").notNull(),
  rowsPerPage: integer("rows_per_page").notNull(),
  columnsPerPage: integer("columns_per_page").notNull(),
  doubleSided: boolean("double_sided").notNull().default(true),
  fillStrategy: binderFillStrategyEnum("fill_strategy")
    .notNull()
    .default("manual"),
  sortOrder: binderSortOrderEnum("sort_order")
    .notNull()
    .default("collector_number"),
  setCode: text("set_code"),
  setName: text("set_name"),
  /** Shared id across volumes when a set is split into multiple binders. */
  seriesId: uuid("series_id"),
  volumeIndex: integer("volume_index"),
  volumeCount: integer("volume_count"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const binderSlots = pgTable(
  "binder_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    binderId: uuid("binder_id")
      .notNull()
      .references(() => binders.id, { onDelete: "cascade" }),
    pageNumber: integer("page_number").notNull(),
    side: binderPageSideEnum("side").notNull().default("front"),
    position: integer("position").notNull(),
    expectedScryfallId: uuid("expected_scryfall_id"),
    expectedName: text("expected_name"),
    expectedCollectorNumber: text("expected_collector_number"),
    expectedImageSmall: text("expected_image_small"),
    expectedImageNormal: text("expected_image_normal"),
    collectionItemId: uuid("collection_item_id").references(
      () => collectionItems.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniquePosition: unique().on(
      table.binderId,
      table.pageNumber,
      table.side,
      table.position,
    ),
  }),
)

export const usersRelations = relations(users, ({ many }) => ({
  collectionItems: many(collectionItems),
  binders: many(binders),
  sentFriendships: many(friendships, { relationName: "friendshipRequester" }),
  receivedFriendships: many(friendships, {
    relationName: "friendshipAddressee",
  }),
}))

export const collectionItemsRelations = relations(
  collectionItems,
  ({ one, many }) => ({
    user: one(users, {
      fields: [collectionItems.userId],
      references: [users.id],
    }),
    binderSlots: many(binderSlots),
  }),
)

export const bindersRelations = relations(binders, ({ one, many }) => ({
  user: one(users, {
    fields: [binders.userId],
    references: [users.id],
  }),
  slots: many(binderSlots),
}))

export const binderSlotsRelations = relations(binderSlots, ({ one }) => ({
  binder: one(binders, {
    fields: [binderSlots.binderId],
    references: [binders.id],
  }),
  collectionItem: one(collectionItems, {
    fields: [binderSlots.collectionItemId],
    references: [collectionItems.id],
  }),
}))

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "friendshipRequester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "friendshipAddressee",
  }),
}))

