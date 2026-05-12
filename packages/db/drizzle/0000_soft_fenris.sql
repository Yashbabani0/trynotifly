CREATE TYPE "public"."company_type" AS ENUM('individual', 'sole_proprietorship', 'partnership', 'private_limited', 'public_limited', 'llp', 'enterprise', 'government', 'nonprofit', 'startup', 'other');--> statement-breakpoint
CREATE TYPE "public"."estimated_monthly_events" AS ENUM('0_1k', '1k_10k', '10k_100k', '100k_1m', '1m_10m', '10m_100m', '100m_plus');--> statement-breakpoint
CREATE TYPE "public"."industry" AS ENUM('saas', 'ecommerce', 'finance', 'healthcare', 'education', 'marketing', 'logistics', 'gaming', 'government', 'real_estate', 'hospitality', 'manufacturing', 'telecommunications', 'media', 'technology', 'nonprofit', 'other');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."onboarding_step" AS ENUM('organization', 'workspace', 'use_case', 'team_invite', 'completed');--> statement-breakpoint
CREATE TYPE "public"."organization_plan" AS ENUM('free', 'starter', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."organization_size" AS ENUM('1', '2_10', '11_50', '51_200', '201_500', '501_1000', '1000_plus');--> statement-breakpoint
CREATE TYPE "public"."primary_use_case" AS ENUM('transactional_email', 'marketing_email', 'otp_auth', 'sms_notifications', 'push_notifications', 'whatsapp_notifications', 'system_alerts', 'customer_engagement', 'internal_tools', 'multi_channel_notifications', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('free', 'trialing', 'active', 'past_due', 'canceled', 'unpaid');--> statement-breakpoint
CREATE TYPE "public"."tax_id_type" AS ENUM('gstin', 'vat', 'ein', 'tin', 'ssn', 'pan', 'other');--> statement-breakpoint
CREATE TYPE "public"."workspace_environment" AS ENUM('production', 'staging', 'development', 'testing');--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."workspace_visibility" AS ENUM('private', 'organization');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "workspace_role" DEFAULT 'member' NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"invited_by" uuid,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"role" "workspace_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"plan" "organization_plan" DEFAULT 'free' NOT NULL,
	"billing_email" text,
	"website" text,
	"description" text,
	"industry" "industry" DEFAULT 'other' NOT NULL,
	"size" "organization_size" DEFAULT '1' NOT NULL,
	"country" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"dodo_customer_id" text,
	"dodo_subscription_id" text,
	"subscription_status" "subscription_status" DEFAULT 'free' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"owner_user_id" uuid,
	"legal_name" text,
	"company_type" "company_type" DEFAULT 'startup' NOT NULL,
	"tax_id_type" "tax_id_type" DEFAULT 'gstin' NOT NULL,
	"tax_id" text,
	"phone_number" text,
	"support_email" text,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"timezone" text,
	"onboarding_step" "onboarding_step" DEFAULT 'organization' NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"primary_use_case" "primary_use_case" DEFAULT 'customer_engagement' NOT NULL,
	"estimated_monthly_events" "estimated_monthly_events" DEFAULT '0_1k' NOT NULL,
	"referral_source" text,
	"settings" jsonb,
	"internal_notes" text,
	"last_activity_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"active_organization_id" uuid,
	"revoked_at" timestamp,
	"device_type" text,
	"country" text,
	"city" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"username" text,
	"display_username" text,
	"bio" text,
	"timezone" text,
	"locale" text,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"marketing_emails_enabled" boolean DEFAULT true NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"deleted_at" timestamp,
	"last_login_at" timestamp,
	"last_ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"environment" "workspace_environment" DEFAULT 'production' NOT NULL,
	"visibility" "workspace_visibility" DEFAULT 'private' NOT NULL,
	"primary_use_case" "primary_use_case" DEFAULT 'other' NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone,
	"estimated_monthly_events" "estimated_monthly_events" DEFAULT '0_1k' NOT NULL,
	"settings" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_member" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"invited_by" uuid,
	"role" "workspace_role" DEFAULT 'member' NOT NULL,
	"invited_at" timestamp with time zone,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_access_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_uidx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "invitation_org_email_uidx" ON "invitation" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_org_user_uidx" ON "member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organization_owner_idx" ON "organization" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "organization_plan_idx" ON "organization" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "organization_country_idx" ON "organization" USING btree ("country");--> statement-breakpoint
CREATE INDEX "organization_industry_idx" ON "organization" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "organization_subscription_status_idx" ON "organization" USING btree ("subscription_status");--> statement-breakpoint
CREATE INDEX "organization_onboarding_idx" ON "organization" USING btree ("onboarding_completed");--> statement-breakpoint
CREATE INDEX "organization_created_at_idx" ON "organization" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "organization_last_activity_idx" ON "organization" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_active_org_idx" ON "session" USING btree ("user_id","active_organization_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "workspace_organization_idx" ON "workspace" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workspace_created_by_idx" ON "workspace" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "workspace_environment_idx" ON "workspace" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "workspace_last_activity_idx" ON "workspace" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "workspace_archived_idx" ON "workspace" USING btree ("is_archived");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_org_slug_uidx" ON "workspace" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "workspace_slug_idx" ON "workspace" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "workspace_member_workspace_idx" ON "workspace_member" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_member_user_idx" ON "workspace_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workspace_member_role_idx" ON "workspace_member" USING btree ("role");--> statement-breakpoint
CREATE INDEX "workspace_member_active_idx" ON "workspace_member" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_member_uidx" ON "workspace_member" USING btree ("workspace_id","user_id");