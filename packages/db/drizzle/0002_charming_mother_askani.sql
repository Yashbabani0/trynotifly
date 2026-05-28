ALTER TABLE "api_key" ADD COLUMN "created_by_user_id" text;--> statement-breakpoint
ALTER TABLE "api_key" ADD COLUMN "scopes" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "api_key" ADD COLUMN "revoked_by_user_id" text;--> statement-breakpoint
ALTER TABLE "api_key" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_revoked_by_user_id_user_id_fk" FOREIGN KEY ("revoked_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_key_status_idx" ON "api_key" USING btree ("status");--> statement-breakpoint
CREATE INDEX "api_key_created_by_user_idx" ON "api_key" USING btree ("created_by_user_id");