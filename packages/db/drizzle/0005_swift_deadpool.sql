ALTER TABLE "organization" DROP CONSTRAINT "organization_owner_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "organization_owner_idx";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "owner_user_id";