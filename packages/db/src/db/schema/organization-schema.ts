import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { sql } from "drizzle-orm";

export const organizationRole = pgEnum("organization_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
]);
export const organizationPlan = pgEnum("organization_plan", [
  "FREE",
  "PRO",
  "BUSINESS",
  "ENTERPRISE",
]);
export const organizationStatus = pgEnum("organization_status", [
  "ACTIVE",
  "SUSPENDED",
  "DISABLED",
]);
export const companyTaxType = pgEnum("company_tax_type", [
  "GST",
  "VAT",
  "TIN",
  "OTHER",
]);
export const companyType = pgEnum("company_type", [
  "INDIVIDUAL",
  "SOLE_PROPRIETORSHIP",
  "PARTNERSHIP",
  "LLP",
  "PRIVATE_LIMITED",
  "PUBLIC_LIMITED",
  "OTHER",
]);

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    estimatedMonthlyNotifications: integer("estimated_monthly_notifications")
      .notNull()
      .default(0),
    balance: integer("balance").notNull().default(0),
    plan: organizationPlan("plan").notNull().default("FREE"),
    status: organizationStatus("status").notNull().default("ACTIVE"),
    emailEnabled: boolean("email_enabled").notNull().default(false),
    smsEnabled: boolean("sms_enabled").notNull().default(false),
    pushEnabled: boolean("push_enabled").notNull().default(false),
    whatsappEnabled: boolean("whatsapp_enabled").notNull().default(false),
    suspensionReason: varchar("suspension_reason", {
      length: 500,
    }),
    suspendedAt: timestamp("suspended_at"),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    check("organization_balance_non_negative", sql`${table.balance} >= 0`),
    uniqueIndex("organization_slug_uidx").on(table.slug),
  ],
);

export const member = pgTable(
  "organization_member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const organizationLegal = pgTable(
  "organization_legal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    companyName: varchar("company_name", {
      length: 255,
    }).notNull(),
    companyAddressLine1: varchar("company_address_line1", {
      length: 255,
    }).notNull(),
    companyAddressLine2: varchar("company_address_line2", {
      length: 255,
    }),
    companyAddressLine3: varchar("company_address_line3", {
      length: 255,
    }),
    companyCity: varchar("company_city", {
      length: 255,
    }).notNull(),
    companyState: varchar("company_state", {
      length: 255,
    }).notNull(),
    companyCountry: varchar("company_country", {
      length: 255,
    }).notNull(),
    companyPostalCode: varchar("company_postal_code", {
      length: 255,
    }).notNull(),
    companyPhone: varchar("company_phone", {
      length: 255,
    }).notNull(),
    companyEmail: varchar("company_email", {
      length: 255,
    }).notNull(),
    companyWebsite: varchar("company_website", {
      length: 255,
    }),
    companyTaxType: companyTaxType("company_tax_type").notNull(),
    companyTaxNumber: varchar("company_tax_number", {
      length: 255,
    }),
    companyType: companyType("company_type").notNull(),
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
    uniqueIndex("organization_legal_organization_unique_idx").on(
      table.organizationId,
    ),
  ],
);

export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;
export type OrganizationMember = typeof member.$inferSelect;
export type OrganizationLegal = typeof organizationLegal.$inferSelect;
