-- Custom SQL migration file, put your code below! --
ALTER TYPE "public"."billing_provider" ADD VALUE IF NOT EXISTS 'paddle';--> statement-breakpoint
CREATE TYPE "public"."billing_transaction_provider" AS ENUM('razorpay', 'paddle', 'manual');--> statement-breakpoint
CREATE TYPE "public"."billing_transaction_status" AS ENUM('created', 'pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "plan_slug" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "plan_slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
UPDATE "organization" SET "plan" = lower("plan");--> statement-breakpoint
UPDATE "organization" SET "plan" = 'starter' WHERE "plan" = 'pro';--> statement-breakpoint
UPDATE "organization_billing" SET "plan_slug" = lower("plan_slug");--> statement-breakpoint
UPDATE "organization_billing" SET "plan_slug" = 'starter' WHERE "plan_slug" = 'pro';--> statement-breakpoint
UPDATE "plans" SET "slug" = lower("slug");--> statement-breakpoint
UPDATE "plans" SET "slug" = 'starter' WHERE "slug" = 'pro';--> statement-breakpoint
DROP TYPE "public"."organization_plan";--> statement-breakpoint
CREATE TYPE "public"."organization_plan" AS ENUM('free', 'starter', 'premium', 'business', 'enterprise');--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan" SET DEFAULT 'free'::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "plan" SET DATA TYPE "public"."organization_plan" USING "plan"::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "plan_slug" SET DEFAULT 'free'::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "plan_slug" SET DATA TYPE "public"."organization_plan" USING "plan_slug"::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "slug" SET DATA TYPE "public"."organization_plan" USING "slug"::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "plans" RENAME COLUMN "monthly_price" TO "monthly_price_inr";--> statement-breakpoint
ALTER TABLE "plans" RENAME COLUMN "yearly_price" TO "yearly_price_inr";--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "support" varchar(120);--> statement-breakpoint
CREATE TABLE "billing_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"provider" "billing_transaction_provider" NOT NULL,
	"provider_order_id" varchar(255),
	"provider_payment_id" varchar(255),
	"provider_signature" text,
	"plan_id" uuid,
	"plan_slug" "organization_plan" NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" "billing_transaction_status" DEFAULT 'created' NOT NULL,
	"raw_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_transactions" ADD CONSTRAINT "billing_transactions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_transactions" ADD CONSTRAINT "billing_transactions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_transactions_provider_order_uidx" ON "billing_transactions" USING btree ("provider_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_transactions_provider_payment_uidx" ON "billing_transactions" USING btree ("provider_payment_id");--> statement-breakpoint
CREATE INDEX "billing_transactions_organization_idx" ON "billing_transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "billing_transactions_provider_idx" ON "billing_transactions" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "billing_transactions_status_idx" ON "billing_transactions" USING btree ("status");--> statement-breakpoint
INSERT INTO "plans" (
	"slug",
	"name",
	"description",
	"monthly_price_inr",
	"yearly_price_inr",
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
	"support",
	"features",
	"is_active",
	"is_contact_sales",
	"sort_order"
) VALUES
	('free', 'Free', 'Start sending email and app push notifications with basic limits.', 0, 0, 'INR', 500, 500, 500, 0, 0, 500, 3, 1, 1, 3, 'Community support', '{"channels":{"email":true,"sms":false,"whatsapp":false,"appPush":true},"support":"Community support","analytics":"basic"}'::jsonb, true, false, 0),
	('starter', 'Starter', 'All channels for small production teams.', 999, 9990, 'INR', 25000, 25000, 25000, 25000, 25000, 25000, 10, 10, 5, 25, 'Standard support', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Standard support","analytics":"basic"}'::jsonb, true, false, 1),
	('premium', 'Premium', 'Higher limits, advanced analytics, and priority queues.', 4999, 49990, 'INR', 150000, 150000, 150000, 150000, 150000, 150000, 50, 50, 20, 100, 'Priority support', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Priority support","analytics":"advanced","priorityQueues":true}'::jsonb, true, false, 2),
	('business', 'Business', 'Large-scale messaging with advanced organization controls.', 14999, 149990, 'INR', 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 250, NULL, 100, 500, 'Premium support', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Premium support","analytics":"advanced","auditLogs":true,"dedicatedInfrastructure":true}'::jsonb, true, false, 3),
	('enterprise', 'Enterprise', 'Custom scale, SLA, onboarding assistance, and dedicated support.', NULL, NULL, 'INR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Dedicated support', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Dedicated support","analytics":"custom","sla":true,"customIntegrations":true,"onboardingAssistance":true}'::jsonb, true, true, 4)
ON CONFLICT ("slug") DO UPDATE SET
	"name" = EXCLUDED."name",
	"description" = EXCLUDED."description",
	"monthly_price_inr" = EXCLUDED."monthly_price_inr",
	"yearly_price_inr" = EXCLUDED."yearly_price_inr",
	"currency" = EXCLUDED."currency",
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
	"support" = EXCLUDED."support",
	"features" = EXCLUDED."features",
	"is_active" = EXCLUDED."is_active",
	"is_contact_sales" = EXCLUDED."is_contact_sales",
	"sort_order" = EXCLUDED."sort_order",
	"updated_at" = now();--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "support" SET NOT NULL;
