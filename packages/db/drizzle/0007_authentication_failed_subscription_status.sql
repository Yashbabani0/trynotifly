ALTER TYPE "public"."subscription_status" ADD VALUE IF NOT EXISTS 'authentication_failed' BEFORE 'cancelled';
