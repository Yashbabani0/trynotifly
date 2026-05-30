ALTER TYPE "public"."organization_plan" ADD VALUE IF NOT EXISTS 'growth' BEFORE 'premium';--> statement-breakpoint
ALTER TYPE "public"."credit_type" ADD VALUE IF NOT EXISTS 'SUBSCRIPTION_RENEWAL';--> statement-breakpoint
ALTER TYPE "public"."credit_type" ADD VALUE IF NOT EXISTS 'ADDON_PURCHASE';--> statement-breakpoint
ALTER TYPE "public"."credit_type" ADD VALUE IF NOT EXISTS 'USAGE_DEDUCTION';--> statement-breakpoint
ALTER TYPE "public"."credit_type" ADD VALUE IF NOT EXISTS 'MANUAL_ADJUSTMENT';--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "razorpay_monthly_plan_id" varchar(255);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "razorpay_yearly_plan_id" varchar(255);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "analytics" varchar(50) DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN IF NOT EXISTS "provider" "credit_transaction_provider";--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN IF NOT EXISTS "provider_payment_id" varchar(255);--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN IF NOT EXISTS "provider_order_id" varchar(255);--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN IF NOT EXISTS "provider_subscription_id" varchar(255);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_transaction_provider_order_idx" ON "credit_transaction" USING btree ("provider_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_transaction_provider_payment_idx" ON "credit_transaction" USING btree ("provider_payment_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_addon_packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"credits" integer NOT NULL,
	"price_inr" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"razorpay_item_name" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "credit_addon_packs_slug_uidx" ON "credit_addon_packs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_addon_packs_active_idx" ON "credit_addon_packs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_addon_packs_sort_order_idx" ON "credit_addon_packs" USING btree ("sort_order");--> statement-breakpoint

INSERT INTO "plans" (
  "slug", "name", "description", "monthly_price_inr", "yearly_price_inr",
  "currency", "razorpay_plan_id", "razorpay_monthly_plan_id",
  "razorpay_yearly_plan_id", "included_credits", "monthly_notification_limit",
  "email_limit", "sms_limit", "whatsapp_limit", "app_push_limit",
  "member_limit", "api_key_limit", "domain_limit", "sender_email_limit",
  "support", "analytics", "features", "is_active", "is_contact_sales", "sort_order"
) VALUES
('free', 'Free', 'Email and app push for getting started with safe basic limits.', 0, 0, 'INR', NULL, NULL, NULL, 500, 500, 500, 0, 0, 2000, 3, 1, 1, 3, 'Community support', 'basic', '{"channels":{"email":true,"sms":false,"whatsapp":false,"appPush":true},"support":"Community support","analytics":"basic"}'::jsonb, true, false, 0),
('starter', 'Starter', 'Low-cost omnichannel sending with conservative SMS and WhatsApp limits.', 299, 2990, 'INR', NULL, NULL, NULL, 5000, 5000, 5000, 300, 300, 20000, 5, 5, 3, 10, 'Standard support', 'basic', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Standard support","analytics":"basic"}'::jsonb, true, false, 1),
('growth', 'Growth', 'More credits and higher abuse-protection limits for growing teams.', 999, 9990, 'INR', 'plan_SvE9RNOovvEIJR', 'plan_SvE9RNOovvEIJR', NULL, 25000, 25000, 25000, 2000, 2000, 100000, 15, 15, 10, 50, 'Priority email support', 'basic', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Priority email support","analytics":"basic"}'::jsonb, true, false, 2),
('premium', 'Premium', 'Higher-volume messaging with advanced analytics and priority support.', 2999, 29990, 'INR', NULL, NULL, NULL, 100000, 100000, 100000, 10000, 10000, 500000, 50, 50, 25, 200, 'Priority support', 'advanced', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Priority support","analytics":"advanced"}'::jsonb, true, false, 3),
('business', 'Business', 'Large-scale messaging with advanced organization controls.', 7999, 79990, 'INR', NULL, NULL, NULL, 500000, 500000, 500000, 50000, 50000, 2000000, 250, NULL, 100, 1000, 'Premium support', 'advanced', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Premium support","analytics":"advanced"}'::jsonb, true, false, 4),
('enterprise', 'Enterprise', 'Custom scale, SLA, onboarding assistance, and dedicated support.', NULL, NULL, 'INR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Dedicated support', 'custom', '{"channels":{"email":true,"sms":true,"whatsapp":true,"appPush":true},"support":"Dedicated support","analytics":"custom"}'::jsonb, true, true, 5)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "monthly_price_inr" = EXCLUDED."monthly_price_inr",
  "yearly_price_inr" = EXCLUDED."yearly_price_inr",
  "currency" = EXCLUDED."currency",
  "razorpay_plan_id" = EXCLUDED."razorpay_plan_id",
  "razorpay_monthly_plan_id" = EXCLUDED."razorpay_monthly_plan_id",
  "razorpay_yearly_plan_id" = EXCLUDED."razorpay_yearly_plan_id",
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
  "analytics" = EXCLUDED."analytics",
  "features" = EXCLUDED."features",
  "is_active" = EXCLUDED."is_active",
  "is_contact_sales" = EXCLUDED."is_contact_sales",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = now();--> statement-breakpoint

INSERT INTO "credit_addon_packs" (
  "slug", "name", "description", "credits", "price_inr",
  "currency", "razorpay_item_name", "is_active", "sort_order"
) VALUES
('starter_pack', '5,000 Credits', 'One-time prepaid credits for extra email, SMS, WhatsApp, or push usage.', 5000, 99, 'INR', 'TryNotifly 5,000 Credits', true, 0),
('growth_pack', '25,000 Credits', 'One-time prepaid credits for growing campaigns.', 25000, 399, 'INR', 'TryNotifly 25,000 Credits', true, 1),
('premium_pack', '100,000 Credits', 'One-time prepaid credits for larger sending spikes.', 100000, 1299, 'INR', 'TryNotifly 100,000 Credits', true, 2),
('business_pack', '500,000 Credits', 'One-time prepaid credits for high-volume campaigns.', 500000, 4999, 'INR', 'TryNotifly 500,000 Credits', true, 3)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "credits" = EXCLUDED."credits",
  "price_inr" = EXCLUDED."price_inr",
  "currency" = EXCLUDED."currency",
  "razorpay_item_name" = EXCLUDED."razorpay_item_name",
  "is_active" = EXCLUDED."is_active",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = now();
