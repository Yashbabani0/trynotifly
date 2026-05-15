ALTER TABLE "organization" ALTER COLUMN "onboarding_step" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "onboarding_step" SET DEFAULT 'organization'::text;--> statement-breakpoint
DROP TYPE "public"."onboarding_step";--> statement-breakpoint
CREATE TYPE "public"."onboarding_step" AS ENUM('organization', 'plan', 'use_case', 'team', 'channels', 'first_event', 'completed');--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "onboarding_step" SET DEFAULT 'organization'::"public"."onboarding_step";--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "onboarding_step" SET DATA TYPE "public"."onboarding_step" USING "onboarding_step"::"public"."onboarding_step";