CREATE TABLE "event_scales" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"min_events" integer,
	"max_events" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_scales_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notification_use_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_use_cases_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "primary_use_case_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "event_scale_id" text;--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "primary_use_case_id" text;--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "event_scale_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_primary_use_case_id_notification_use_cases_id_fk" FOREIGN KEY ("primary_use_case_id") REFERENCES "public"."notification_use_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_event_scale_id_event_scales_id_fk" FOREIGN KEY ("event_scale_id") REFERENCES "public"."event_scales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_primary_use_case_id_notification_use_cases_id_fk" FOREIGN KEY ("primary_use_case_id") REFERENCES "public"."notification_use_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_event_scale_id_event_scales_id_fk" FOREIGN KEY ("event_scale_id") REFERENCES "public"."event_scales"("id") ON DELETE no action ON UPDATE no action;