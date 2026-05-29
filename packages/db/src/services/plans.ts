export type PlanSlug = "free" | "starter" | "premium" | "business" | "enterprise";
export type BillingInterval = "monthly" | "yearly" | "manual";
export type BillingStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "contact_sales";
export type ChannelKey = "email" | "sms" | "whatsapp" | "appPush";
export type LimitKey =
  | "members"
  | "apiKeys"
  | "domains"
  | "senderEmails"
  | "monthlyNotifications";

export type PlanLimits = {
  includedCredits: number | null;
  monthlyNotificationLimit: number | null;
  emailLimit: number | null;
  smsLimit: number | null;
  whatsappLimit: number | null;
  appPushLimit: number | null;
  memberLimit: number | null;
  apiKeyLimit: number | null;
  domainLimit: number | null;
  senderEmailLimit: number | null;
  channels: Record<ChannelKey, boolean>;
};

export type PlanDefinition = PlanLimits & {
  slug: PlanSlug;
  name: string;
  description: string;
  monthlyPriceInr: number | null;
  yearlyPriceInr: number | null;
  currency: "INR";
  razorpayPlanId: string | null;
  support: string;
  analytics: "basic" | "advanced" | "custom";
  isContactSales: boolean;
  sortOrder: number;
};

export type LimitCheckResult =
  | { allowed: true; limit: number | null; current: number }
  | {
      allowed: false;
      limit: number;
      current: number;
      code: "PLAN_LIMIT_REACHED";
      message: string;
    };

export const PLAN_DEFINITIONS: Record<PlanSlug, PlanDefinition> = {
  free: {
    slug: "free",
    name: "Free",
    description: "Start sending email and app push notifications with basic limits.",
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    currency: "INR",
    razorpayPlanId: null,
    includedCredits: 500,
    monthlyNotificationLimit: 500,
    emailLimit: 500,
    smsLimit: 0,
    whatsappLimit: 0,
    appPushLimit: 500,
    memberLimit: 3,
    apiKeyLimit: 1,
    domainLimit: 1,
    senderEmailLimit: 3,
    channels: {
      email: true,
      sms: false,
      whatsapp: false,
      appPush: true,
    },
    support: "Community support",
    analytics: "basic",
    isContactSales: false,
    sortOrder: 0,
  },
  starter: {
    slug: "starter",
    name: "Starter",
    description: "All channels for small production teams.",
    monthlyPriceInr: 999,
    yearlyPriceInr: 9990,
    currency: "INR",
    razorpayPlanId: "plan_SvE9RNOovvEIJR",
    includedCredits: 25_000,
    monthlyNotificationLimit: 25_000,
    emailLimit: 25_000,
    smsLimit: 25_000,
    whatsappLimit: 25_000,
    appPushLimit: 25_000,
    memberLimit: 10,
    apiKeyLimit: 10,
    domainLimit: 5,
    senderEmailLimit: 25,
    channels: {
      email: true,
      sms: true,
      whatsapp: true,
      appPush: true,
    },
    support: "Standard support",
    analytics: "basic",
    isContactSales: false,
    sortOrder: 1,
  },
  premium: {
    slug: "premium",
    name: "Premium",
    description: "Higher limits, advanced analytics, and priority queues.",
    monthlyPriceInr: 4_999,
    yearlyPriceInr: 49_990,
    currency: "INR",
    razorpayPlanId: "plan_SvE7RpQzXDtM4o",
    includedCredits: 150_000,
    monthlyNotificationLimit: 150_000,
    emailLimit: 150_000,
    smsLimit: 150_000,
    whatsappLimit: 150_000,
    appPushLimit: 150_000,
    memberLimit: 50,
    apiKeyLimit: 50,
    domainLimit: 20,
    senderEmailLimit: 100,
    channels: {
      email: true,
      sms: true,
      whatsapp: true,
      appPush: true,
    },
    support: "Priority support",
    analytics: "advanced",
    isContactSales: false,
    sortOrder: 2,
  },
  business: {
    slug: "business",
    name: "Business",
    description: "Large-scale messaging with advanced organization controls.",
    monthlyPriceInr: 14_999,
    yearlyPriceInr: 149_990,
    currency: "INR",
    razorpayPlanId: "plan_SvEA3cH9ooqp4P",
    includedCredits: 1_000_000,
    monthlyNotificationLimit: 1_000_000,
    emailLimit: 1_000_000,
    smsLimit: 1_000_000,
    whatsappLimit: 1_000_000,
    appPushLimit: 1_000_000,
    memberLimit: 250,
    apiKeyLimit: null,
    domainLimit: 100,
    senderEmailLimit: 500,
    channels: {
      email: true,
      sms: true,
      whatsapp: true,
      appPush: true,
    },
    support: "Premium support",
    analytics: "advanced",
    isContactSales: false,
    sortOrder: 3,
  },
  enterprise: {
    slug: "enterprise",
    name: "Enterprise",
    description: "Custom scale, SLA, onboarding assistance, and dedicated support.",
    monthlyPriceInr: null,
    yearlyPriceInr: null,
    currency: "INR",
    razorpayPlanId: null,
    includedCredits: null,
    monthlyNotificationLimit: null,
    emailLimit: null,
    smsLimit: null,
    whatsappLimit: null,
    appPushLimit: null,
    memberLimit: null,
    apiKeyLimit: null,
    domainLimit: null,
    senderEmailLimit: null,
    channels: {
      email: true,
      sms: true,
      whatsapp: true,
      appPush: true,
    },
    support: "Dedicated support",
    analytics: "custom",
    isContactSales: true,
    sortOrder: 4,
  },
};

export function normalizePlanSlug(plan?: string | null): PlanSlug {
  if (plan === "PRO") {
    return "starter";
  }

  const normalized = plan?.toLowerCase();

  if (normalized && normalized in PLAN_DEFINITIONS) {
    return normalized as PlanSlug;
  }

  return "free";
}

export function isKnownPlanSlug(plan?: string | null): plan is PlanSlug {
  const normalized = plan?.toLowerCase();

  return Boolean(normalized && normalized in PLAN_DEFINITIONS);
}

export function getPlanDefinition(plan?: string | null) {
  return PLAN_DEFINITIONS[normalizePlanSlug(plan)];
}

export function getDefaultPlanSeeds() {
  return Object.values(PLAN_DEFINITIONS).map((plan) => ({
    slug: plan.slug,
    name: plan.name,
    description: plan.description,
    monthlyPriceInr: plan.monthlyPriceInr,
    yearlyPriceInr: plan.yearlyPriceInr,
    currency: plan.currency,
    razorpayPlanId: plan.razorpayPlanId,
    includedCredits: plan.includedCredits,
    monthlyNotificationLimit: plan.monthlyNotificationLimit,
    emailLimit: plan.emailLimit,
    smsLimit: plan.smsLimit,
    whatsappLimit: plan.whatsappLimit,
    appPushLimit: plan.appPushLimit,
    memberLimit: plan.memberLimit,
    apiKeyLimit: plan.apiKeyLimit,
    domainLimit: plan.domainLimit,
    senderEmailLimit: plan.senderEmailLimit,
    support: plan.support,
    features: {
      channels: plan.channels,
      support: plan.support,
      analytics: plan.analytics,
    },
    isActive: true,
    isContactSales: plan.isContactSales,
    sortOrder: plan.sortOrder,
  }));
}

export function isChannelAvailable(plan: string | null | undefined, channel: ChannelKey) {
  return getPlanDefinition(plan).channels[channel];
}

export function checkPlanLimit(input: {
  plan: string | null | undefined;
  key: LimitKey;
  current: number;
}) {
  const definition = getPlanDefinition(input.plan);
  const limit =
    input.key === "members"
      ? definition.memberLimit
      : input.key === "apiKeys"
        ? definition.apiKeyLimit
        : input.key === "domains"
          ? definition.domainLimit
          : input.key === "senderEmails"
            ? definition.senderEmailLimit
            : definition.monthlyNotificationLimit;

  if (limit === null || input.current < limit) {
    return {
      allowed: true,
      limit,
      current: input.current,
    } satisfies LimitCheckResult;
  }

  return {
    allowed: false,
    limit,
    current: input.current,
    code: "PLAN_LIMIT_REACHED",
    message: `${definition.name} allows ${limit} ${input.key}. Upgrade your plan to increase this limit.`,
  } satisfies LimitCheckResult;
}
