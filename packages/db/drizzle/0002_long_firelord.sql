DROP INDEX "organization_type_unique_idx";--> statement-breakpoint
CREATE INDEX "organization_type_idx" ON "api_key" USING btree ("organization_id","type");--> statement-breakpoint
ALTER TABLE "api_key" DROP COLUMN "updated_at";