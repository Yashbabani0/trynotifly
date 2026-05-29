CREATE TYPE "public"."subscription_status" AS ENUM('created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired', 'cancel_scheduled');--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "billing_provider" SET DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "billing_transactions" ADD COLUMN "provider_event_id" varchar(255);--> statement-breakpoint
ALTER TABLE "billing_transactions" ADD COLUMN "provider_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "billing_transactions" ADD COLUMN "razorpay_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "billing_transactions" ADD COLUMN "razorpay_payment_id" varchar(255);--> statement-breakpoint
ALTER TABLE "billing_transactions" ADD COLUMN "razorpay_invoice_id" varchar(255);--> statement-breakpoint
ALTER TABLE "billing_transactions" ADD COLUMN "event_type" varchar(120);--> statement-breakpoint
ALTER TABLE "organization_billing" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_billing" ADD COLUMN "last_charged_at" timestamp;--> statement-breakpoint
ALTER TABLE "organization_billing" ADD COLUMN "credits_last_reset_at" timestamp;--> statement-breakpoint
ALTER TABLE "organization_billing" ADD COLUMN "next_credit_reset_at" timestamp;--> statement-breakpoint
ALTER TABLE "organization_billing" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "organization_billing" ADD COLUMN "pending_plan_slug" "organization_plan";--> statement-breakpoint
ALTER TABLE "organization_billing" ADD COLUMN "razorpay_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "organization_billing" ADD COLUMN "razorpay_plan_id" varchar(255);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "razorpay_plan_id" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX "billing_transactions_provider_event_uidx" ON "billing_transactions" USING btree ("provider_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_transactions_razorpay_payment_uidx" ON "billing_transactions" USING btree ("razorpay_payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_transactions_razorpay_invoice_uidx" ON "billing_transactions" USING btree ("razorpay_invoice_id");--> statement-breakpoint
CREATE INDEX "billing_transactions_subscription_idx" ON "billing_transactions" USING btree ("razorpay_subscription_id");--> statement-breakpoint
CREATE INDEX "organization_billing_subscription_status_idx" ON "organization_billing" USING btree ("subscription_status");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_billing_razorpay_subscription_uidx" ON "organization_billing" USING btree ("razorpay_subscription_id");--> statement-breakpoint
UPDATE "plans" SET
	"monthly_price_inr" = 0,
	"included_credits" = 500,
	"razorpay_plan_id" = NULL,
	"is_active" = true,
	"sort_order" = 0,
	"updated_at" = now()
WHERE "slug" = 'free';--> statement-breakpoint
UPDATE "plans" SET
	"monthly_price_inr" = 999,
	"included_credits" = 25000,
	"razorpay_plan_id" = 'plan_SvE9RNOovvEIJR',
	"is_active" = true,
	"sort_order" = 1,
	"updated_at" = now()
WHERE "slug" = 'starter';--> statement-breakpoint
UPDATE "plans" SET
	"monthly_price_inr" = 4999,
	"included_credits" = 150000,
	"razorpay_plan_id" = 'plan_SvE7RpQzXDtM4o',
	"is_active" = true,
	"sort_order" = 2,
	"updated_at" = now()
WHERE "slug" = 'premium';--> statement-breakpoint
UPDATE "plans" SET
	"monthly_price_inr" = 14999,
	"included_credits" = 1000000,
	"razorpay_plan_id" = 'plan_SvEA3cH9ooqp4P',
	"is_active" = true,
	"sort_order" = 3,
	"updated_at" = now()
WHERE "slug" = 'business';--> statement-breakpoint
UPDATE "organization_billing" SET
	"billing_provider" = 'free',
	"subscription_status" = 'active',
	"next_credit_reset_at" = COALESCE("next_credit_reset_at", now())
WHERE "plan_slug" = 'free';
