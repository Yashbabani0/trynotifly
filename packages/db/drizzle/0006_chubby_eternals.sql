CREATE TABLE "plan" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"monthly_price" integer NOT NULL,
	"yearly_price" integer NOT NULL,
	"yearly_discount_percent" integer DEFAULT 0 NOT NULL,
	"is_enterprise" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "plan_slug_uidx" ON "plan" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "plan_active_idx" ON "plan" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "plan_sort_idx" ON "plan" USING btree ("sort_order");