  ALTER TABLE "organization_billing" ADD COLUMN "pending_razorpay_subscription_id" varchar(255);--> statement-breakpoint
  ALTER TABLE "organization_billing" ADD COLUMN "pending_subscription_status" "subscription_status";--> statement-breakpoint
  ALTER TABLE "organization_billing" ADD COLUMN "pending_current_period_start" timestamp;--> statement-breakpoint
  ALTER TABLE "organization_billing" ADD COLUMN "pending_current_period_end" timestamp;--> statement-breakpoint
  CREATE UNIQUE INDEX "organization_billing_pending_razorpay_subscription_uidx" ON "organization_billing" USING btree ("pending_razorpay_subscription_id");--> statement-breakpoint

  UPDATE "organization_billing"
  SET
    "pending_razorpay_subscription_id" = CASE
      WHEN "subscription_status" IN ('created', 'authentication_failed')
        THEN "razorpay_subscription_id"
      ELSE "pending_razorpay_subscription_id"
    END,
    "pending_subscription_status" = CASE
      WHEN "subscription_status" IN ('created', 'authentication_failed')
        THEN "subscription_status"
      ELSE "pending_subscription_status"
    END,
    "razorpay_subscription_id" = CASE
      WHEN "subscription_status" IN ('created', 'authentication_failed')
        THEN NULL
      ELSE "razorpay_subscription_id"
    END,
    "provider_subscription_id" = CASE
      WHEN "subscription_status" IN ('created', 'authentication_failed')
        THEN NULL
      ELSE "provider_subscription_id"
    END,
    "razorpay_plan_id" = CASE
      WHEN "subscription_status" IN ('created', 'authentication_failed')
        THEN NULL
      ELSE "razorpay_plan_id"
    END
  WHERE "subscription_status" IN ('created', 'authentication_failed');--> statement-breakpoint

  UPDATE "organization_billing" AS billing
  SET
    "current_period_start" = COALESCE(
      billing."current_period_start",
      billing."credits_last_reset_at",
      billing."created_at",
      now()
    ),
    "current_period_end" = COALESCE(
      billing."current_period_end",
      COALESCE(
        billing."current_period_start",
        billing."credits_last_reset_at",
        billing."created_at",
        now()
      ) + interval '30 days'
    ),
    "credits_last_reset_at" = COALESCE(
      billing."credits_last_reset_at",
      COALESCE(
        billing."current_period_start",
        billing."created_at",
        now()
      )
    ),
    "next_credit_reset_at" = COALESCE(
      billing."next_credit_reset_at",
      COALESCE(
        billing."current_period_end",
        COALESCE(
          billing."current_period_start",
          billing."created_at",
          now()
        ) + interval '30 days'
      )
    )
  WHERE billing."plan_slug" = 'free';--> statement-breakpoint

  UPDATE "organization" AS org
  SET "balance" = 500
  WHERE org."plan" = 'free' AND org."balance" > 500;--> statement-breakpoint

  UPDATE "organization_billing" AS billing
  SET
    "current_period_start" = COALESCE(
      billing."current_period_start",
      billing."last_charged_at",
      billing."credits_last_reset_at",
      billing."created_at",
      now()
    ),
    "current_period_end" = COALESCE(
      billing."current_period_end",
      COALESCE(
        billing."current_period_start",
        billing."last_charged_at",
        billing."credits_last_reset_at",
        billing."created_at",
        now()
      ) + interval '30 days'
    ),
    "credits_last_reset_at" = COALESCE(
      billing."credits_last_reset_at",
      COALESCE(
        billing."current_period_start",
        billing."last_charged_at",
        billing."created_at",
        now()
      )
    ),
    "next_credit_reset_at" = COALESCE(
      billing."next_credit_reset_at",
      COALESCE(
        billing."current_period_end",
        COALESCE(
          billing."current_period_start",
          billing."last_charged_at",
          billing."created_at",
          now()
        ) + interval '30 days'
      )
    )
  WHERE billing."plan_slug" <> 'free'
    AND billing."subscription_status" IN (
      'authenticated',
      'active',
      'pending',
      'halted',
      'cancel_scheduled'
    );
