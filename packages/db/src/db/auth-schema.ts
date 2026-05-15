import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
  uniqueIndex,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import {
  companyTypeEnum,
  estimatedMonthlyEventsEnum,
  industryEnum,
  invitationStatusEnum,
  onboardingStepEnum,
  organizationSizeEnum,
  primaryUseCaseEnum,
  subscriptionStatusEnum,
  taxIdTypeEnum,
  workspaceRoleEnum,
} from "./enums";

export const user = pgTable("user", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  bio: text("bio"),
  timezone: text("timezone"),
  locale: text("locale"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  marketingEmailsEnabled: boolean("marketing_emails_enabled")
    .default(true)
    .notNull(),
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  deleted: boolean("deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  lastLoginAt: timestamp("last_login_at"),
  lastIpAddress: text("last_ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  lastActiveAt: timestamp("last_active_at"),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: uuid("active_organization_id").references(
      () => organization.id,
      {
        onDelete: "set null",
        onUpdate: "cascade",
      },
    ),
    revokedAt: timestamp("revoked_at"),
    deviceType: text("device_type"),
    country: text("country"),
    city: text("city"),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
    index("session_user_active_org_idx").on(
      table.userId,
      table.activeOrganizationId,
    ),
  ],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
    uniqueIndex("account_provider_account_uidx").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = pgTable(
  "organization",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
    website: text("website"),
    description: text("description"),
    industry: industryEnum("industry").default("other").notNull(),
    size: organizationSizeEnum("size").default("1").notNull(),
    country: text("country"),
    isVerified: boolean("is_verified").default(false).notNull(),
    primaryUseCaseId: text("primary_use_case_id").references(
      () => notificationUseCases.id,
    ),
    eventScaleId: text("event_scale_id").references(() => eventScales.id),
    onboardingStep: onboardingStepEnum("onboarding_step")
      .default("organization")
      .notNull(),
    onboardingCompleted: boolean("onboarding_completed")
      .default(false)
      .notNull(),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    primaryUseCase: primaryUseCaseEnum("primary_use_case")
      .default("customer_engagement")
      .notNull(),
    estimatedMonthlyEvents: estimatedMonthlyEventsEnum(
      "estimated_monthly_events",
    )
      .default("0_1k")
      .notNull(),
    referralSource: text("referral_source"),
    settings: jsonb("settings"),
    internalNotes: text("internal_notes"),
    lastActivityAt: timestamp("last_activity_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    metadata: text("metadata"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("organization_slug_uidx").on(table.slug),
    index("organization_country_idx").on(table.country),
    index("organization_industry_idx").on(table.industry),
    index("organization_onboarding_idx").on(table.onboardingCompleted),
    index("organization_created_at_idx").on(table.createdAt),
    index("organization_last_activity_idx").on(table.lastActivityAt),
  ],
);

export const organizationBilling = pgTable(
  "organization_billing",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    dodoCustomerId: text("dodo_customer_id"),
    dodoSubscriptionId: text("dodo_subscription_id"),
    subscriptionStatus: subscriptionStatusEnum("subscription_status")
      .default("free")
      .notNull(),
    plan: text("plan").default("free").notNull(),
    billingEmail: text("billing_email"),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("organization_plan_idx").on(table.plan),
    index("organization_subscription_status_idx").on(table.subscriptionStatus),
    index("organization_billing_email_idx").on(table.billingEmail),
    index("organization_dodo_customer_id_idx").on(table.dodoCustomerId),
    index("organization_dodo_subscription_id_idx").on(table.dodoSubscriptionId),
    index("organization_cancel_at_period_end_idx").on(table.cancelAtPeriodEnd),
    uniqueIndex("organization_billing_org_uidx").on(table.organizationId),
  ],
);

export const plan = pgTable(
  "plan",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    monthlyPrice: integer("monthly_price").notNull(),
    yearlyPrice: integer("yearly_price").notNull(),
    yearlyDiscountPercent: integer("yearly_discount_percent")
      .default(0)
      .notNull(),
    isEnterprise: boolean("is_enterprise").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },

  (table) => [
    uniqueIndex("plan_slug_uidx").on(table.slug),

    index("plan_active_idx").on(table.isActive),

    index("plan_sort_idx").on(table.sortOrder),
  ],
);

export const planFeature = pgTable(
  "plan_feature",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),

    planId: uuid("plan_id")
      .notNull()
      .references(() => plan.id, {
        onDelete: "cascade",
      }),

    label: text("label").notNull(),

    sortOrder: integer("sort_order").default(0).notNull(),
  },

  (table) => [index("plan_feature_plan_idx").on(table.planId)],
);

export const organizationLegalDetails = pgTable(
  "organization_legal_details",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    legalName: text("legal_name"),
    companyType: companyTypeEnum("company_type").default("startup").notNull(),
    taxIdType: taxIdTypeEnum("tax_id_type").default("gstin").notNull(),
    taxId: text("tax_id"),
    phoneNumber: text("phone_number"),
    supportEmail: text("support_email"),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country"),
    timezone: text("timezone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("organization_legal_details_country_idx").on(table.country),
    index("organization_legal_details_timezone_idx").on(table.timezone),
    index("organization_legal_details_state_idx").on(table.state),
    index("organization_legal_details_city_idx").on(table.city),
    index("organization_legal_details_legal_name_idx").on(table.legalName),
  ],
);

export const notificationUseCases = pgTable("notification_use_cases", {
  id: text("id").primaryKey(),

  slug: text("slug").notNull().unique(),

  title: text("title").notNull(),

  description: text("description").notNull(),

  icon: text("icon"),

  isActive: boolean("is_active").default(true).notNull(),

  sortOrder: integer("sort_order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventScales = pgTable("event_scales", {
  id: text("id").primaryKey(),

  slug: text("slug").notNull().unique(),

  label: text("label").notNull(),

  minEvents: integer("min_events"),

  maxEvents: integer("max_events"),

  sortOrder: integer("sort_order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const member = pgTable(
  "member",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    invitedBy: uuid("invited_by").references(() => user.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    role: workspaceRoleEnum("role").default("member").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
    uniqueIndex("member_org_user_uidx").on(table.organizationId, table.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: workspaceRoleEnum("role").default("member").notNull(),
    status: invitationStatusEnum("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: uuid("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
    uniqueIndex("invitation_org_email_uidx").on(
      table.organizationId,
      table.email,
    ),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    members: many(member),
    invitations: many(invitation),

    billing: one(organizationBilling),

    legalDetails: one(organizationLegalDetails),
  }),
);

export const organizationLegalDetailsRelations = relations(
  organizationLegalDetails,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationLegalDetails.organizationId],
      references: [organization.id],
    }),
  }),
);
