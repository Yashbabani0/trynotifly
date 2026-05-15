CREATE TABLE "organization_billing" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"dodo_customer_id" text,
	"dodo_subscription_id" text,
	"subscription_status" "subscription_status" DEFAULT 'free' NOT NULL,
	"plan" "organization_plan" DEFAULT 'free' NOT NULL,
	"billing_email" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_legal_details" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
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
	"country" text,
	"timezone" text
);
--> statement-breakpoint
DROP INDEX "organization_plan_idx";--> statement-breakpoint
DROP INDEX "organization_subscription_status_idx";--> statement-breakpoint
ALTER TABLE "organization_billing" ADD CONSTRAINT "organization_billing_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_legal_details" ADD CONSTRAINT "organization_legal_details_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "organization_plan_idx" ON "organization_billing" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "organization_subscription_status_idx" ON "organization_billing" USING btree ("subscription_status");--> statement-breakpoint
CREATE INDEX "organization_billing_email_idx" ON "organization_billing" USING btree ("billing_email");--> statement-breakpoint
CREATE INDEX "organization_dodo_customer_id_idx" ON "organization_billing" USING btree ("dodo_customer_id");--> statement-breakpoint
CREATE INDEX "organization_dodo_subscription_id_idx" ON "organization_billing" USING btree ("dodo_subscription_id");--> statement-breakpoint
CREATE INDEX "organization_cancel_at_period_end_idx" ON "organization_billing" USING btree ("cancel_at_period_end");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_billing_org_uidx" ON "organization_billing" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_legal_details_country_idx" ON "organization_legal_details" USING btree ("country");--> statement-breakpoint
CREATE INDEX "organization_legal_details_timezone_idx" ON "organization_legal_details" USING btree ("timezone");--> statement-breakpoint
CREATE INDEX "organization_legal_details_state_idx" ON "organization_legal_details" USING btree ("state");--> statement-breakpoint
CREATE INDEX "organization_legal_details_city_idx" ON "organization_legal_details" USING btree ("city");--> statement-breakpoint
CREATE INDEX "organization_legal_details_legal_name_idx" ON "organization_legal_details" USING btree ("legal_name");--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "billing_email";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "dodo_customer_id";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "dodo_subscription_id";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "current_period_start";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "current_period_end";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "cancel_at_period_end";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "legal_name";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "company_type";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "tax_id_type";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "tax_id";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "support_email";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "address_line_1";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "address_line_2";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "postal_code";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "timezone";