import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { notificationChannel } from "./notification-schema";
import { sql } from "drizzle-orm";
import { organization, organizationPlan } from "./organization-schema";

export const billingInterval = pgEnum("billing_interval", [
  "monthly",
  "yearly",
  "manual",
]);

export const billingProvider = pgEnum("billing_provider", [
  "free",
  "manual",
  "stripe",
  "razorpay",
  "paddle",
]);

export const billingStatus = pgEnum("billing_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "contact_sales",
]);

export const billingTransactionStatus = pgEnum("billing_transaction_status", [
  "created",
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const billingTransactionProvider = pgEnum(
  "billing_transaction_provider",
  ["razorpay", "paddle", "manual"],
);

export const subscriptionStatus = pgEnum("subscription_status", [
  "created",
  "authenticated",
  "active",
  "pending",
  "halted",
  "authentication_failed",
  "cancelled",
  "completed",
  "expired",
  "cancel_scheduled",
]);

export type PlanFeatureFlags = {
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    appPush: boolean;
  };
  support: string;
  analytics: "basic" | "advanced" | "custom";
  priorityQueues?: boolean;
  auditLogs?: boolean;
  dedicatedInfrastructure?: boolean;
  sla?: boolean;
  customIntegrations?: boolean;
  onboardingAssistance?: boolean;
};

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: organizationPlan("slug").notNull(),
    name: varchar("name", {
      length: 120,
    }).notNull(),
    description: text("description").notNull(),
    monthlyPriceInr: integer("monthly_price_inr"),
    yearlyPriceInr: integer("yearly_price_inr"),
    currency: varchar("currency", {
      length: 10,
    }).notNull().default("INR"),
    razorpayMonthlyPlanId: varchar("razorpay_monthly_plan_id", {
      length: 255,
    }),
    razorpayYearlyPlanId: varchar("razorpay_yearly_plan_id", {
      length: 255,
    }),
    razorpayPlanId: varchar("razorpay_plan_id", {
      length: 255,
    }),
    includedCredits: integer("included_credits"),
    monthlyNotificationLimit: integer("monthly_notification_limit"),
    emailLimit: integer("email_limit"),
    smsLimit: integer("sms_limit"),
    whatsappLimit: integer("whatsapp_limit"),
    appPushLimit: integer("app_push_limit"),
    memberLimit: integer("member_limit"),
    apiKeyLimit: integer("api_key_limit"),
    domainLimit: integer("domain_limit"),
    senderEmailLimit: integer("sender_email_limit"),
    support: varchar("support", {
      length: 120,
    }).notNull(),
    analytics: varchar("analytics", {
      length: 50,
    }).notNull().default("basic"),
    features: jsonb("features").$type<PlanFeatureFlags>().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isContactSales: boolean("is_contact_sales").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("plans_slug_uidx").on(table.slug),
    index("plans_active_idx").on(table.isActive),
    index("plans_sort_order_idx").on(table.sortOrder),
  ],
);

export const creditAddonPacks = pgTable(
  "credit_addon_packs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", {
      length: 120,
    }).notNull(),
    name: varchar("name", {
      length: 160,
    }).notNull(),
    description: text("description").notNull(),
    credits: integer("credits").notNull(),
    priceInr: integer("price_inr").notNull(),
    currency: varchar("currency", {
      length: 10,
    }).notNull().default("INR"),
    razorpayItemName: varchar("razorpay_item_name", {
      length: 255,
    }),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("credit_addon_packs_slug_uidx").on(table.slug),
    index("credit_addon_packs_active_idx").on(table.isActive),
    index("credit_addon_packs_sort_order_idx").on(table.sortOrder),
  ],
);

export const organizationBilling = pgTable(
  "organization_billing",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    planId: uuid("plan_id").references(() => plans.id, {
      onDelete: "set null",
    }),
    planSlug: organizationPlan("plan_slug").notNull().default("free"),
    billingInterval: billingInterval("billing_interval").notNull().default("monthly"),
    billingProvider: billingProvider("billing_provider").notNull().default("free"),
    status: billingStatus("status").notNull().default("active"),
    subscriptionStatus: subscriptionStatus("subscription_status")
      .notNull()
      .default("active"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    lastChargedAt: timestamp("last_charged_at"),
    creditsLastResetAt: timestamp("credits_last_reset_at"),
    nextCreditResetAt: timestamp("next_credit_reset_at"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    cancelledAt: timestamp("cancelled_at"),
    pendingPlanSlug: organizationPlan("pending_plan_slug"),
    pendingRazorpaySubscriptionId: varchar("pending_razorpay_subscription_id", {
      length: 255,
    }),
    pendingSubscriptionStatus: subscriptionStatus("pending_subscription_status"),
    pendingCurrentPeriodStart: timestamp("pending_current_period_start"),
    pendingCurrentPeriodEnd: timestamp("pending_current_period_end"),
    providerCustomerId: varchar("provider_customer_id", {
      length: 255,
    }),
    providerSubscriptionId: varchar("provider_subscription_id", {
      length: 255,
    }),
    razorpaySubscriptionId: varchar("razorpay_subscription_id", {
      length: 255,
    }),
    razorpayPlanId: varchar("razorpay_plan_id", {
      length: 255,
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("organization_billing_org_uidx").on(table.organizationId),
    index("organization_billing_plan_idx").on(table.planSlug),
    index("organization_billing_status_idx").on(table.status),
    index("organization_billing_subscription_status_idx").on(
      table.subscriptionStatus,
    ),
    uniqueIndex("organization_billing_razorpay_subscription_uidx").on(
      table.razorpaySubscriptionId,
    ),
    uniqueIndex("organization_billing_pending_razorpay_subscription_uidx").on(
      table.pendingRazorpaySubscriptionId,
    ),
  ],
);

export const billingTransactions = pgTable(
  "billing_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    provider: billingTransactionProvider("provider").notNull(),
    providerOrderId: varchar("provider_order_id", {
      length: 255,
    }),
    providerEventId: varchar("provider_event_id", {
      length: 255,
    }),
    providerSubscriptionId: varchar("provider_subscription_id", {
      length: 255,
    }),
    providerPaymentId: varchar("provider_payment_id", {
      length: 255,
    }),
    razorpaySubscriptionId: varchar("razorpay_subscription_id", {
      length: 255,
    }),
    razorpayPaymentId: varchar("razorpay_payment_id", {
      length: 255,
    }),
    razorpayInvoiceId: varchar("razorpay_invoice_id", {
      length: 255,
    }),
    providerSignature: text("provider_signature"),
    eventType: varchar("event_type", {
      length: 120,
    }),
    planId: uuid("plan_id").references(() => plans.id, {
      onDelete: "set null",
    }),
    planSlug: organizationPlan("plan_slug").notNull(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", {
      length: 10,
    }).notNull().default("INR"),
    status: billingTransactionStatus("status").notNull().default("created"),
    rawPayload: jsonb("raw_payload"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("billing_transactions_provider_order_uidx").on(
      table.providerOrderId,
    ),
    uniqueIndex("billing_transactions_provider_payment_uidx").on(
      table.providerPaymentId,
    ),
    uniqueIndex("billing_transactions_provider_event_uidx").on(
      table.providerEventId,
    ),
    uniqueIndex("billing_transactions_razorpay_payment_uidx").on(
      table.razorpayPaymentId,
    ),
    uniqueIndex("billing_transactions_razorpay_invoice_uidx").on(
      table.razorpayInvoiceId,
    ),
    index("billing_transactions_organization_idx").on(table.organizationId),
    index("billing_transactions_provider_idx").on(table.provider),
    index("billing_transactions_status_idx").on(table.status),
    index("billing_transactions_subscription_idx").on(
      table.razorpaySubscriptionId,
    ),
  ],
);

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

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type OrganizationBilling = typeof organizationBilling.$inferSelect;
export type NewOrganizationBilling = typeof organizationBilling.$inferInsert;
export type BillingTransaction = typeof billingTransactions.$inferSelect;
export type NewBillingTransaction = typeof billingTransactions.$inferInsert;
export type CreditAddonPack = typeof creditAddonPacks.$inferSelect;
export type NewCreditAddonPack = typeof creditAddonPacks.$inferInsert;
