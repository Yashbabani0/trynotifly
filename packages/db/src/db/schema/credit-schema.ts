import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./organization-schema";
import { sql } from "drizzle-orm";

export const creditType = pgEnum("credit_type", [
  "PURCHASE",
  "USAGE",
  "REFUND",
  "BONUS",
  "ADJUSTMENT",
  "SUBSCRIPTION_RENEWAL",
  "ADDON_PURCHASE",
  "USAGE_DEDUCTION",
  "MANUAL_ADJUSTMENT",
]);
export const creditTransactionStatus = pgEnum("credit_transaction_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);
export const creditTransactionProvider = pgEnum("credit_transaction_provider", [
  "free",
  "razorpay",
  "manual",
  "system",
]);

export const creditTransaction = pgTable(
  "credit_transaction",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    amount: integer("amount").notNull(),
    type: creditType("type").notNull(),
    status: creditTransactionStatus("status").notNull().default("COMPLETED"),
    description: varchar("description", {
      length: 500,
    }),
    metadata: jsonb("metadata"),
    providerTransactionId: varchar("provider_transaction_id", {
      length: 255,
    }),
    provider: creditTransactionProvider("provider"),
    providerPaymentId: varchar("provider_payment_id", {
      length: 255,
    }),
    providerOrderId: varchar("provider_order_id", {
      length: 255,
    }),
    providerSubscriptionId: varchar("provider_subscription_id", {
      length: 255,
    }),
    currency: varchar("currency", {
      length: 10,
    }),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("credit_transaction_amount_non_zero", sql`${table.amount} != 0`),
    index("credit_transaction_organization_id_idx").on(table.organizationId),
    index("credit_transaction_created_at_idx").on(table.createdAt),
    index("credit_transaction_provider_order_idx").on(table.providerOrderId),
    index("credit_transaction_provider_payment_idx").on(table.providerPaymentId),
  ],
);

export type CreditTransaction = typeof creditTransaction.$inferSelect;
export type NewCreditTransaction = typeof creditTransaction.$inferInsert;
