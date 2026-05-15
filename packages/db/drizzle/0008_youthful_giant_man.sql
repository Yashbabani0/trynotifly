ALTER TABLE "organization_billing" ALTER COLUMN "subscription_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "subscription_status" SET DEFAULT 'free'::text;--> statement-breakpoint
DROP TYPE "public"."subscription_status";--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('free', 'pending', 'active', 'past_due', 'canceled', 'unpaid');--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "subscription_status" SET DEFAULT 'free'::"public"."subscription_status";--> statement-breakpoint
ALTER TABLE "organization_billing" ALTER COLUMN "subscription_status" SET DATA TYPE "public"."subscription_status" USING "subscription_status"::"public"."subscription_status";