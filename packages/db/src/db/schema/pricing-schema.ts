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
  "manual",
  "stripe",
  "razorpay",
]);

export const billingStatus = pgEnum("billing_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "contact_sales",
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
    monthlyPrice: integer("monthly_price"),
    yearlyPrice: integer("yearly_price"),
    currency: varchar("currency", {
      length: 10,
    }).notNull().default("INR"),
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
    planSlug: organizationPlan("plan_slug").notNull().default("FREE"),
    billingInterval: billingInterval("billing_interval").notNull().default("monthly"),
    billingProvider: billingProvider("billing_provider").notNull().default("manual"),
    status: billingStatus("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    providerCustomerId: varchar("provider_customer_id", {
      length: 255,
    }),
    providerSubscriptionId: varchar("provider_subscription_id", {
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
