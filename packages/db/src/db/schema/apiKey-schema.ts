import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./organization-schema";
import { user } from "./auth-schema";

export const apiKeyType = pgEnum("api_key_type", ["LIVE", "TEST"]);
export const apiKeyStatus = pgEnum("api_key_status", [
  "ACTIVE",
  "INACTIVE",
  "REVOKED",
]);

export const apiKey = pgTable(
  "api_key",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", {
      length: 255,
    }).notNull(),
    type: apiKeyType("type").notNull().default("TEST"),
    hashedKey: varchar("hashed_key", {
      length: 255,
    }).notNull(),
    prefix: varchar("prefix", {
      length: 32,
    }).notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    status: apiKeyStatus("status").notNull().default("ACTIVE"),
    lastUsedAt: timestamp("last_used_at"),
    revokedAt: timestamp("revoked_at"),
    revokedByUserId: text("revoked_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("organization_type_idx").on(table.organizationId, table.type),
    uniqueIndex("hashed_key_unique_idx").on(table.hashedKey),
    uniqueIndex("prefix_unique_idx").on(table.prefix),
    index("api_key_organization_id_idx").on(table.organizationId),
    index("api_key_status_idx").on(table.status),
    index("api_key_created_by_user_idx").on(table.createdByUserId),
  ],
);

export type ApiKey = typeof apiKey.$inferSelect;
export type NewApiKey = typeof apiKey.$inferInsert;
