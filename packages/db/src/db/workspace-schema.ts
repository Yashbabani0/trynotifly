import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth-schema";
import {
  estimatedMonthlyEventsEnum,
  primaryUseCaseEnum,
  workspaceEnvironmentEnum,
  workspaceRoleEnum,
  workspaceVisibilityEnum,
} from "./enums";

export const workspace = pgTable(
  "workspace",
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
    createdBy: uuid("created_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    logo: text("logo"),
    environment: workspaceEnvironmentEnum("environment")
      .default("production")
      .notNull(),
    visibility: workspaceVisibilityEnum("visibility")
      .default("private")
      .notNull(),
    primaryUseCase: primaryUseCaseEnum("primary_use_case")
      .default("other")
      .notNull(),
    onboardingCompleted: boolean("onboarding_completed")
      .default(false)
      .notNull(),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    isDefault: boolean("is_default").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
    }),
    lastActivityAt: timestamp("last_activity_at", {
      withTimezone: true,
    }),
    estimatedMonthlyEvents: estimatedMonthlyEventsEnum(
      "estimated_monthly_events",
    )
      .default("0_1k")
      .notNull(),
    settings: jsonb("settings"),
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
    index("workspace_organization_idx").on(table.organizationId),
    index("workspace_created_by_idx").on(table.createdBy),
    index("workspace_environment_idx").on(table.environment),
    index("workspace_last_activity_idx").on(table.lastActivityAt),
    index("workspace_archived_idx").on(table.isArchived),
    uniqueIndex("workspace_org_slug_uidx").on(table.organizationId, table.slug),
    index("workspace_slug_idx").on(table.slug),
  ],
);

export const workspaceMember = pgTable(
  "workspace_member",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    invitedBy: uuid("invited_by").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    role: workspaceRoleEnum("role").default("member").notNull(),
    invitedAt: timestamp("invited_at", {
      withTimezone: true,
    }),
    joinedAt: timestamp("joined_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    lastAccessAt: timestamp("last_access_at", {
      withTimezone: true,
    }),
    isActive: boolean("is_active").default(true).notNull(),
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
    index("workspace_member_workspace_idx").on(table.workspaceId),
    index("workspace_member_user_idx").on(table.userId),
    index("workspace_member_role_idx").on(table.role),
    index("workspace_member_active_idx").on(table.isActive),
    uniqueIndex("workspace_member_uidx").on(table.workspaceId, table.userId),
  ],
);

export const workspaceRelations = relations(workspace, ({ one, many }) => ({
  organization: one(organization, {
    fields: [workspace.organizationId],
    references: [organization.id],
  }),
  creator: one(user, {
    fields: [workspace.createdBy],
    references: [user.id],
  }),
  members: many(workspaceMember),
}));

export const workspaceMemberRelations = relations(
  workspaceMember,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceMember.workspaceId],
      references: [workspace.id],
    }),
    user: one(user, {
      fields: [workspaceMember.userId],
      references: [user.id],
    }),
    inviter: one(user, {
      fields: [workspaceMember.invitedBy],
      references: [user.id],
    }),
  }),
);
