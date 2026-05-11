// @/trynotifly/database/src/db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  boolean,
  pgEnum,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth-schema";
import { relations } from "drizzle-orm";

export * from "./auth-schema";

export const logLevel = pgEnum("log_level", ["info", "warn", "error"]);
export type LogLevel = (typeof logLevel.enumValues)[number];
export const apiKeyEnvironment = pgEnum("api_key_environment", [
  "test",
  "live",
]);

/* LOGS */

export const logs = pgTable(
  "logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    level: logLevel("level").notNull(),
    message: text("message").notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("logs_level_idx").on(table.level),
    index("logs_created_at_idx").on(table.createdAt),
  ],
);

/* WORKSPACE */

export const workspace = pgTable(
  "workspace",
  {
    id: text("id").primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .unique()
      .references(() => organization.id, { onDelete: "cascade" }),

    plan: text("plan").default("free").notNull(),

    // Company
    companyName: text("company_name"),
    companySize: text("company_size"),
    industry: text("industry"),
    website: text("website"),

    // Address
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    city: text("city"),
    state: text("state"),
    country: text("country"),
    postalCode: text("postal_code"),

    // Tax / billing
    taxId: text("tax_id"),
    taxType: text("tax_type"),
    billingEmail: text("billing_email"),

    // Product
    useCase: text("use_case"),
    channels: jsonb("channels").$type<string[]>().default([]).notNull(),
    expectedVolume: text("expected_volume"),

    // State
    onboardingCompleted: boolean("onboarding_completed")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("workspace_org_idx").on(table.organizationId)],
);

/* CUSTOMER */

export const customer = pgTable(
  "customer",
  {
    id: text("id").primaryKey(),

    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),

    provider: text("provider").notNull(), // stripe | razorpay

    providerCustomerId: text("provider_customer_id").notNull(),

    email: text("email"),
    name: text("name"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("customer_workspace_idx").on(table.workspaceId)],
);

/* SUBSCRIPTION */

export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey(),

    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),

    provider: text("provider").notNull(),

    providerSubscriptionId: text("provider_subscription_id"),

    status: text("status").notNull(), // active, canceled, trialing

    plan: text("plan").notNull(),

    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("subscription_workspace_idx").on(table.workspaceId)],
);

/* USAGE */

export const usage = pgTable(
  "usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // 📊 Metrics (numeric, not text)
    notificationsSent: integer("notifications_sent").default(0).notNull(),
    emailsSent: integer("emails_sent").default(0).notNull(),

    // 📅 Billing / tracking window
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),

    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("usage_org_idx").on(table.organizationId)],
);

/* EVENTS */

export const event = pgTable(
  "event",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    type: text("type").notNull(), // e.g. "user.created", "notification.sent"

    // 🧠 Use jsonb for flexible event payloads
    payload: jsonb("payload"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("event_org_idx").on(table.organizationId)],
);

/* RELATIONS */

export const workspaceRelations = relations(workspace, ({ one }) => ({
  organization: one(organization, {
    fields: [workspace.organizationId],
    references: [organization.id],
  }),
}));

/* TAX PROFILE */

export const taxProfile = pgTable(
  "tax_profile",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),

    country: text("country").notNull(),

    // 🇮🇳 India GST
    gstNumber: text("gst_number"),

    // 🌍 generic
    taxId: text("tax_id"),
    companyName: text("company_name"),

    address: jsonb("address"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("tax_workspace_idx").on(table.workspaceId)],
);

/* INVOICE */

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),

    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),

    providerInvoiceId: text("provider_invoice_id"),

    amount: integer("amount").notNull(), // in smallest unit (paise/cents)
    currency: text("currency").notNull(),

    taxAmount: integer("tax_amount").default(0),

    status: text("status").notNull(), // paid, pending, failed

    issuedAt: timestamp("issued_at"),
    paidAt: timestamp("paid_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("invoice_workspace_idx").on(table.workspaceId)],
);

/* PAYMENT */

export const payment = pgTable(
  "payment",
  {
    id: text("id").primaryKey(),

    invoiceId: text("invoice_id").references(() => invoice.id, {
      onDelete: "cascade",
    }),

    providerPaymentId: text("provider_payment_id"),

    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),

    status: text("status").notNull(), // success, failed

    method: text("method"), // card, upi, etc.

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("payment_invoice_idx").on(table.invoiceId)],
);

/* API KEY */

export const apiKey = pgTable(
  "api_key",
  {
    id: text("id").primaryKey(),

    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    keyPrefix: text("key_prefix").notNull(),

    hashedKey: text("hashed_key").notNull(),

    environment: apiKeyEnvironment("environment").default("test").notNull(),

    description: text("description"),

    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    lastUsedAt: timestamp("last_used_at"),

    lastUsedIp: text("last_used_ip"),

    expiresAt: timestamp("expires_at"),

    revoked: boolean("revoked").default(false).notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("api_key_workspace_idx").on(table.workspaceId),
    index("api_key_prefix_idx").on(table.keyPrefix),
    index("api_key_workspace_revoked_idx").on(table.workspaceId, table.revoked),
    uniqueIndex("api_key_hashed_key_uidx").on(table.hashedKey),
    uniqueIndex("api_key_prefix_uidx").on(table.keyPrefix),
  ],
);
