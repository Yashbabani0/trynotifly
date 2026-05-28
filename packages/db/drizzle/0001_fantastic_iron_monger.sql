CREATE TYPE "public"."sender_email_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "sender_email_identity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"domain_id" uuid NOT NULL,
	"email" varchar(320) NOT NULL,
	"local_part" varchar(64) NOT NULL,
	"display_name" varchar(120),
	"is_default" boolean DEFAULT false NOT NULL,
	"status" "sender_email_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sender_email_identity" ADD CONSTRAINT "sender_email_identity_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sender_email_identity" ADD CONSTRAINT "sender_email_identity_domain_id_email_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."email_domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sender_email_identity_org_email_unique_idx" ON "sender_email_identity" USING btree ("organization_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "sender_email_identity_domain_default_unique_idx" ON "sender_email_identity" USING btree ("domain_id") WHERE "sender_email_identity"."is_default" = true;--> statement-breakpoint
CREATE INDEX "sender_email_identity_org_idx" ON "sender_email_identity" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sender_email_identity_domain_idx" ON "sender_email_identity" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "sender_email_identity_status_idx" ON "sender_email_identity" USING btree ("status");