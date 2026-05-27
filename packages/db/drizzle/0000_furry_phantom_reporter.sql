CREATE TYPE "public"."api_key_status" AS ENUM('ACTIVE', 'INACTIVE', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."api_key_type" AS ENUM('LIVE', 'TEST');--> statement-breakpoint
CREATE TYPE "public"."credit_transaction_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."credit_type" AS ENUM('PURCHASE', 'USAGE', 'REFUND', 'BONUS', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."email_domain_status" AS ENUM('PENDING', 'DKIM_PENDING', 'SPF_PENDING', 'DMARC_PENDING', 'MAIL_FROM_PENDING', 'SES_PENDING', 'VERIFIED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."company_tax_type" AS ENUM('GST', 'VAT', 'TIN', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."company_type" AS ENUM('INDIVIDUAL', 'SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."organization_plan" AS ENUM('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('ACTIVE', 'SUSPENDED', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('SMS', 'EMAIL', 'PUSH', 'WHATSAPP', 'IN_APP');--> statement-breakpoint
CREATE TABLE "api_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "api_key_type" DEFAULT 'TEST' NOT NULL,
	"hashed_key" varchar(255) NOT NULL,
	"prefix" varchar(32) NOT NULL,
	"organization_id" uuid NOT NULL,
	"status" "api_key_status" DEFAULT 'ACTIVE' NOT NULL,
	"last_used_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" "credit_type" NOT NULL,
	"status" "credit_transaction_status" DEFAULT 'COMPLETED' NOT NULL,
	"description" varchar(500),
	"metadata" jsonb,
	"provider_transaction_id" varchar(255),
	"currency" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_transaction_amount_non_zero" CHECK ("credit_transaction"."amount" != 0)
);
--> statement-breakpoint
CREATE TABLE "email_domain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"domain" varchar(255) NOT NULL,
	"status" "email_domain_status" DEFAULT 'PENDING' NOT NULL,
	"ses_verified" boolean DEFAULT false NOT NULL,
	"dkim_verified" boolean DEFAULT false NOT NULL,
	"spf_verified" boolean DEFAULT false NOT NULL,
	"dmarc_verified" boolean DEFAULT false NOT NULL,
	"mail_from_mx_verified" boolean DEFAULT false NOT NULL,
	"mail_from_spf_verified" boolean DEFAULT false NOT NULL,
	"fully_verified" boolean DEFAULT false NOT NULL,
	"verification_state" jsonb DEFAULT '{"ses":{"verified":false,"status":"pending"},"dkim":{"verified":false,"status":"pending","records":[]},"spf":{"verified":false,"status":"pending","records":[]},"dmarc":{"verified":false,"status":"pending","records":[]},"mailFromMx":{"verified":false,"status":"pending","records":[]},"mailFromSpf":{"verified":false,"status":"pending","records":[]}}'::jsonb,
	"dkim_tokens" jsonb DEFAULT '[]'::jsonb,
	"mail_from_domain" varchar(255),
	"dns_records" jsonb DEFAULT '[]'::jsonb,
	"last_checked_at" timestamp,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"estimated_monthly_notifications" integer DEFAULT 0 NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"plan" "organization_plan" DEFAULT 'FREE' NOT NULL,
	"status" "organization_status" DEFAULT 'ACTIVE' NOT NULL,
	"email_enabled" boolean DEFAULT false NOT NULL,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"push_enabled" boolean DEFAULT false NOT NULL,
	"whatsapp_enabled" boolean DEFAULT false NOT NULL,
	"suspension_reason" varchar(500),
	"suspended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organization_balance_non_negative" CHECK ("organization"."balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "organization_legal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"company_address_line1" varchar(255) NOT NULL,
	"company_address_line2" varchar(255),
	"company_address_line3" varchar(255),
	"company_city" varchar(255) NOT NULL,
	"company_state" varchar(255) NOT NULL,
	"company_country" varchar(255) NOT NULL,
	"company_postal_code" varchar(255) NOT NULL,
	"company_phone" varchar(255) NOT NULL,
	"company_email" varchar(255) NOT NULL,
	"company_website" varchar(255),
	"company_tax_type" "company_tax_type" NOT NULL,
	"company_tax_number" varchar(255),
	"company_type" "company_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"credits_per_notification" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_pricing_channel_unique" UNIQUE("channel"),
	CONSTRAINT "notification_pricing_credits_positive" CHECK ("notification_pricing"."credits_per_notification" > 0)
);
--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_domain" ADD CONSTRAINT "email_domain_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_legal" ADD CONSTRAINT "organization_legal_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organization_type_idx" ON "api_key" USING btree ("organization_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "hashed_key_unique_idx" ON "api_key" USING btree ("hashed_key");--> statement-breakpoint
CREATE UNIQUE INDEX "prefix_unique_idx" ON "api_key" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "api_key_organization_id_idx" ON "api_key" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "credit_transaction_organization_id_idx" ON "credit_transaction" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "credit_transaction_created_at_idx" ON "credit_transaction" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_domain_unique_idx" ON "email_domain" USING btree ("organization_id","domain");--> statement-breakpoint
CREATE INDEX "email_domain_org_idx" ON "email_domain" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "email_domain_domain_idx" ON "email_domain" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "email_domain_status_idx" ON "email_domain" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "organization_member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "organization_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_legal_organization_unique_idx" ON "organization_legal" USING btree ("organization_id");