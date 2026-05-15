import { pgEnum } from "drizzle-orm/pg-core";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "free",
  "pending",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

export const companyTypeEnum = pgEnum("company_type", [
  "individual",
  "sole_proprietorship",
  "partnership",
  "private_limited",
  "public_limited",
  "llp",
  "enterprise",
  "government",
  "nonprofit",
  "startup",
  "other",
]);

export const organizationSizeEnum = pgEnum("organization_size", [
  "1",
  "2_10",
  "11_50",
  "51_200",
  "201_500",
  "501_1000",
  "1000_plus",
]);

export const industryEnum = pgEnum("industry", [
  "saas",
  "ecommerce",
  "finance",
  "healthcare",
  "education",
  "marketing",
  "logistics",
  "gaming",
  "government",
  "real_estate",
  "hospitality",
  "manufacturing",
  "telecommunications",
  "media",
  "technology",
  "nonprofit",
  "other",
]);

export const onboardingStepEnum = pgEnum("onboarding_step", [
  "organization",
  "plan",
  "use_case",
  "team",
  "channels",
  "first_event",
  "completed",
]);

export const primaryUseCaseEnum = pgEnum("primary_use_case", [
  "transactional_email",
  "marketing_email",
  "otp_auth",
  "sms_notifications",
  "push_notifications",
  "whatsapp_notifications",
  "system_alerts",
  "customer_engagement",
  "internal_tools",
  "multi_channel_notifications",
  "other",
]);

export const workspaceVisibilityEnum = pgEnum("workspace_visibility", [
  "private",
  "organization",
]);

export const workspaceEnvironmentEnum = pgEnum("workspace_environment", [
  "production",
  "staging",
  "development",
  "testing",
]);

export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);

export const taxIdTypeEnum = pgEnum("tax_id_type", [
  "gstin",
  "vat",
  "ein",
  "tin",
  "ssn",
  "pan",
  "other",
]);

export const estimatedMonthlyEventsEnum = pgEnum("estimated_monthly_events", [
  "0_1k",
  "1k_10k",
  "10k_100k",
  "100k_1m",
  "1m_10m",
  "10m_100m",
  "100m_plus",
]);
