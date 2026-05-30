UPDATE "organization_billing"
SET
  "billing_provider" = 'free',
  "subscription_status" = 'active',
  "cancel_at_period_end" = false,
  "cancelled_at" = NULL,
  "provider_subscription_id" = NULL,
  "razorpay_subscription_id" = NULL,
  "razorpay_plan_id" = NULL,
  "current_period_start" = COALESCE("current_period_start", now()),
  "current_period_end" = COALESCE(
    "current_period_end",
    COALESCE("current_period_start", now()) + interval '30 days'
  ),
  "credits_last_reset_at" = COALESCE(
    "credits_last_reset_at",
    COALESCE("current_period_start", now())
  ),
  "next_credit_reset_at" = COALESCE(
    "next_credit_reset_at",
    COALESCE(
      "current_period_end",
      COALESCE("current_period_start", now()) + interval '30 days'
    )
  ),
  "updated_at" = now()
WHERE "plan_slug" = 'free'
  AND (
    "subscription_status" = 'cancel_scheduled'
    OR "cancel_at_period_end" = true
    OR "billing_provider" <> 'free'
    OR "razorpay_subscription_id" IS NOT NULL
  );--> statement-breakpoint

UPDATE "organization"
SET "balance" = 500
WHERE "plan" = 'free' AND "balance" > 500;
