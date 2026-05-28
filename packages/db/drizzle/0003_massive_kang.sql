CREATE TYPE "public"."billing_interval" AS ENUM('monthly', 'yearly', 'manual');--> statement-breakpoint
CREATE TYPE "public"."billing_provider" AS ENUM('manual', 'stripe', 'razorpay');--> statement-breakpoint
CREATE TYPE "public"."billing_status" AS ENUM('active', 'trialing', 'past_due', 'canceled', 'contact_sales');--> statement-breakpoint
CREATE TABLE "organization_billing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" uuid,
	"plan_slug" "organization_plan" DEFAULT 'FREE' NOT NULL,
	"billing_interval" "billing_interval" DEFAULT 'monthly' NOT NULL,
	"billing_provider" "billing_provider" DEFAULT 'manual' NOT NULL,
	"status" "billing_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"provider_customer_id" varchar(255),
	"provider_subscription_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" "organization_plan" NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"monthly_price" integer,
	"yearly_price" integer,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"included_credits" integer,
	"monthly_notification_limit" integer,
	"email_limit" integer,
	"sms_limit" integer,
	"whatsapp_limit" integer,
	"app_push_limit" integer,
	"member_limit" integer,
	"api_key_limit" integer,
	"domain_limit" integer,
	"sender_email_limit" integer,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_contact_sales" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan" SET DEFAULT 'FREE'::text;--> statement-breakpoint
UPDATE "organization" SET "plan" = 'STARTER' WHERE "plan" = 'PRO';--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "plan_slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "plan_slug" SET DEFAULT 'FREE'::text;--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."organization_plan";--> statement-breakpoint
CREATE TYPE "public"."organization_plan" AS ENUM('FREE', 'STARTER', 'PREMIUM', 'BUSINESS', 'ENTERPRISE');--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan" SET DEFAULT 'FREE'::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan" SET DATA TYPE "public"."organization_plan" USING "plan"::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "plan_slug" SET DEFAULT 'FREE'::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "plan_slug" SET DATA TYPE "public"."organization_plan" USING "plan_slug"::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "slug" SET DATA TYPE "public"."organization_plan" USING "slug"::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "notification_pricing" ALTER COLUMN "channel" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_channel";--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('SMS', 'EMAIL', 'PUSH', 'WHATSAPP');--> statement-breakpoint
ALTER TABLE "notification_pricing" ALTER COLUMN "channel" SET DATA TYPE "public"."notification_channel" USING "channel"::"public"."notification_channel";--> statement-breakpoint
ALTER TABLE "organization_billing" ADD CONSTRAINT "organization_billing_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_billing" ADD CONSTRAINT "organization_billing_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_billing_org_uidx" ON "organization_billing" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_billing_plan_idx" ON "organization_billing" USING btree ("plan_slug");--> statement-breakpoint
CREATE INDEX "organization_billing_status_idx" ON "organization_billing" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_slug_uidx" ON "plans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "plans_active_idx" ON "plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "plans_sort_order_idx" ON "plans" USING btree ("sort_order");--> statement-breakpoint
INSERT INTO "plans" (
	"slug",
	"name",
	"description",
	"monthly_price",
	"yearly_price",
	"currency",
	"included_credits",
	"monthly_notification_limit",
	"email_limit",
	"sms_limit",
	"whatsapp_limit",
	"app_push_limit",
	"member_limit",
	"api_key_limit",
	"domain_limit",
	"sender_email_limit",
	"features",
	"is_active",
	"is_contact_sales",
	"sort_order"
) VALUES
	('FREE', 'Free', 'Start sending email and app push notifications with basic limits.', 0, 0, 'INR', 500, 500, 500, 0, 0, 500, 3, 1, 1, 3, '{"channels":{"email":true,"sms":false,"whatsapp":false,"appPush":true},"support":"Community support","analytics":"basic"}'::jsonb, true, false, 0),
	('STARTER', 'Starter', 'All channels for small production teams.', 999, 9990, 'INR', 25000, 25000, 25000, 25000, 25000, 25000, 10, 10, 5, 25, '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Standard support","analytics":"basic"}'::jsonb, true, false, 1),
	('PREMIUM', 'Premium', 'Higher limits, advanced analytics, and priority queues.', 4999, 49990, 'INR', 150000, 150000, 150000, 150000, 150000, 150000, 50, 50, 20, 100, '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Priority support","analytics":"advanced","priorityQueues":true}'::jsonb, true, false, 2),
	('BUSINESS', 'Business', 'Large-scale messaging with advanced organization controls.', 14999, 149990, 'INR', 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 250, NULL, 100, 500, '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Premium support","analytics":"advanced","auditLogs":true,"dedicatedInfrastructure":true}'::jsonb, true, false, 3),
	('ENTERPRISE', 'Enterprise', 'Custom scale, SLA, onboarding assistance, and dedicated support.', NULL, NULL, 'INR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Dedicated support","analytics":"custom","sla":true,"customIntegrations":true,"onboardingAssistance":true}'::jsonb, true, true, 4)
ON CONFLICT ("slug") DO UPDATE SET
	"name" = EXCLUDED."name",
	"description" = EXCLUDED."description",
	"monthly_price" = EXCLUDED."monthly_price",
	"yearly_price" = EXCLUDED."yearly_price",
	"included_credits" = EXCLUDED."included_credits",
	"monthly_notification_limit" = EXCLUDED."monthly_notification_limit",
	"email_limit" = EXCLUDED."email_limit",
	"sms_limit" = EXCLUDED."sms_limit",
	"whatsapp_limit" = EXCLUDED."whatsapp_limit",
	"app_push_limit" = EXCLUDED."app_push_limit",
	"member_limit" = EXCLUDED."member_limit",
	"api_key_limit" = EXCLUDED."api_key_limit",
	"domain_limit" = EXCLUDED."domain_limit",
	"sender_email_limit" = EXCLUDED."sender_email_limit",
	"features" = EXCLUDED."features",
	"is_active" = EXCLUDED."is_active",
	"is_contact_sales" = EXCLUDED."is_contact_sales",
	"sort_order" = EXCLUDED."sort_order",
	"updated_at" = now();--> statement-breakpoint
INSERT INTO "organization_billing" (
	"organization_id",
	"plan_id",
	"plan_slug",
	"billing_interval",
	"billing_provider",
	"status",
	"current_period_start",
	"current_period_end"
)
SELECT
	"organization"."id",
	"plans"."id",
	"organization"."plan",
	'monthly',
	'manual',
	CASE WHEN "organization"."plan" = 'ENTERPRISE' THEN 'contact_sales'::"billing_status" ELSE 'active'::"billing_status" END,
	now(),
	now() + interval '1 month'
FROM "organization"
LEFT JOIN "plans" ON "plans"."slug" = "organization"."plan"
ON CONFLICT ("organization_id") DO UPDATE SET
	"plan_id" = EXCLUDED."plan_id",
	"plan_slug" = EXCLUDED."plan_slug",
	"updated_at" = now();--> statement-breakpoint
ALTER TABLE "api_key" DROP COLUMN "scopes";--> statement-breakpoint
ALTER TABLE "api_key" DROP COLUMN "expires_at";
