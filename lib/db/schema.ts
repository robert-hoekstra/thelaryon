import { relations } from "drizzle-orm"
import {
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

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
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

export const usersRelations = relations(users, ({ many }) => ({
  collectionItems: many(collectionItems),
  sentFriendships: many(friendships, { relationName: "friendshipRequester" }),
  receivedFriendships: many(friendships, {
    relationName: "friendshipAddressee",
  }),
}))

export const collectionItemsRelations = relations(
  collectionItems,
  ({ one }) => ({
    user: one(users, {
      fields: [collectionItems.userId],
      references: [users.id],
    }),
  }),
)

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

