import { check, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { notificationChannel } from "./notification-schema";
import { sql } from "drizzle-orm";

export const notificationPricing = pgTable(
  "notification_pricing",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: notificationChannel("channel").notNull().unique(),
    creditsPerNotification: integer("credits_per_notification").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      "notification_pricing_credits_positive",
      sql`${table.creditsPerNotification} > 0`,
    ),
  ],
);
