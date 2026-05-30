export type PlanSlug =
  | "free"
  | "starter"
  | "growth"
  | "premium"
  | "business"
  | "enterprise";
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
export type AnalyticsTier = "basic" | "advanced" | "custom";

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
  razorpayMonthlyPlanId: string | null;
  razorpayYearlyPlanId: string | null;
  razorpayPlanId: string | null;
  support: string;
  analytics: AnalyticsTier;
  isContactSales: boolean;
  sortOrder: number;
};

export type CreditAddonPackDefinition = {
  slug: "starter_pack" | "growth_pack" | "premium_pack" | "business_pack";
  name: string;
  description: string;
  credits: number;
  priceInr: number;
  currency: "INR";
  razorpayItemName: string | null;
  isActive: boolean;
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

const allChannels = {
  email: true,
  sms: true,
  whatsapp: true,
  appPush: true,
} satisfies Record<ChannelKey, boolean>;

export const PLAN_DEFINITIONS: Record<PlanSlug, PlanDefinition> = {
  free: {
    slug: "free",
    name: "Free",
    description: "Email and app push for getting started with safe basic limits.",
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    currency: "INR",
    razorpayMonthlyPlanId: null,
    razorpayYearlyPlanId: null,
    razorpayPlanId: null,
    includedCredits: 500,
    monthlyNotificationLimit: 500,
    emailLimit: 500,
    smsLimit: 0,
    whatsappLimit: 0,
    appPushLimit: 2000,
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
    description: "Low-cost omnichannel sending with conservative SMS and WhatsApp limits.",
    monthlyPriceInr: 299,
    yearlyPriceInr: 2990,
    currency: "INR",
    razorpayMonthlyPlanId: null,
    razorpayYearlyPlanId: null,
    razorpayPlanId: null,
    includedCredits: 5000,
    monthlyNotificationLimit: 5000,
    emailLimit: 5000,
    smsLimit: 300,
    whatsappLimit: 300,
    appPushLimit: 20000,
    memberLimit: 5,
    apiKeyLimit: 5,
    domainLimit: 3,
    senderEmailLimit: 10,
    channels: allChannels,
    support: "Standard support",
    analytics: "basic",
    isContactSales: false,
    sortOrder: 1,
  },
  growth: {
    slug: "growth",
    name: "Growth",
    description: "More credits and higher abuse-protection limits for growing teams.",
    monthlyPriceInr: 999,
    yearlyPriceInr: 9990,
    currency: "INR",
    razorpayMonthlyPlanId: "plan_SvE9RNOovvEIJR",
    razorpayYearlyPlanId: null,
    razorpayPlanId: "plan_SvE9RNOovvEIJR",
    includedCredits: 25_000,
    monthlyNotificationLimit: 25_000,
    emailLimit: 25_000,
    smsLimit: 2000,
    whatsappLimit: 2000,
    appPushLimit: 100_000,
    memberLimit: 15,
    apiKeyLimit: 15,
    domainLimit: 10,
    senderEmailLimit: 50,
    channels: allChannels,
    support: "Priority email support",
    analytics: "basic",
    isContactSales: false,
    sortOrder: 2,
  },
  premium: {
    slug: "premium",
    name: "Premium",
    description: "Higher-volume messaging with advanced analytics and priority support.",
    monthlyPriceInr: 2999,
    yearlyPriceInr: 29_990,
    currency: "INR",
    razorpayMonthlyPlanId: null,
    razorpayYearlyPlanId: null,
    razorpayPlanId: null,
    includedCredits: 100_000,
    monthlyNotificationLimit: 100_000,
    emailLimit: 100_000,
    smsLimit: 10_000,
    whatsappLimit: 10_000,
    appPushLimit: 500_000,
    memberLimit: 50,
    apiKeyLimit: 50,
    domainLimit: 25,
    senderEmailLimit: 200,
    channels: allChannels,
    support: "Priority support",
    analytics: "advanced",
    isContactSales: false,
    sortOrder: 3,
  },
  business: {
    slug: "business",
    name: "Business",
    description: "Large-scale messaging with advanced organization controls.",
    monthlyPriceInr: 7999,
    yearlyPriceInr: 79_990,
    currency: "INR",
    razorpayMonthlyPlanId: null,
    razorpayYearlyPlanId: null,
    razorpayPlanId: null,
    includedCredits: 500_000,
    monthlyNotificationLimit: 500_000,
    emailLimit: 500_000,
    smsLimit: 50_000,
    whatsappLimit: 50_000,
    appPushLimit: 2_000_000,
    memberLimit: 250,
    apiKeyLimit: null,
    domainLimit: 100,
    senderEmailLimit: 1000,
    channels: allChannels,
    support: "Premium support",
    analytics: "advanced",
    isContactSales: false,
    sortOrder: 4,
  },
  enterprise: {
    slug: "enterprise",
    name: "Enterprise",
    description: "Custom scale, SLA, onboarding assistance, and dedicated support.",
    monthlyPriceInr: null,
    yearlyPriceInr: null,
    currency: "INR",
    razorpayMonthlyPlanId: null,
    razorpayYearlyPlanId: null,
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
    channels: allChannels,
    support: "Dedicated support",
    analytics: "custom",
    isContactSales: true,
    sortOrder: 5,
  },
};

export const CREDIT_ADDON_PACK_DEFINITIONS: Record<
  CreditAddonPackDefinition["slug"],
  CreditAddonPackDefinition
> = {
  starter_pack: {
    slug: "starter_pack",
    name: "5,000 Credits",
    description: "One-time prepaid credits for extra email, SMS, WhatsApp, or push usage.",
    credits: 5000,
    priceInr: 99,
    currency: "INR",
    razorpayItemName: "TryNotifly 5,000 Credits",
    isActive: true,
    sortOrder: 0,
  },
  growth_pack: {
    slug: "growth_pack",
    name: "25,000 Credits",
    description: "One-time prepaid credits for growing campaigns.",
    credits: 25_000,
    priceInr: 399,
    currency: "INR",
    razorpayItemName: "TryNotifly 25,000 Credits",
    isActive: true,
    sortOrder: 1,
  },
  premium_pack: {
    slug: "premium_pack",
    name: "100,000 Credits",
    description: "One-time prepaid credits for larger sending spikes.",
    credits: 100_000,
    priceInr: 1299,
    currency: "INR",
    razorpayItemName: "TryNotifly 100,000 Credits",
    isActive: true,
    sortOrder: 2,
  },
  business_pack: {
    slug: "business_pack",
    name: "500,000 Credits",
    description: "One-time prepaid credits for high-volume campaigns.",
    credits: 500_000,
    priceInr: 4999,
    currency: "INR",
    razorpayItemName: "TryNotifly 500,000 Credits",
    isActive: true,
    sortOrder: 3,
  },
};

export function normalizePlanSlug(plan?: string | null): PlanSlug {
  if (plan === "PRO") {
    return "growth";
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
    razorpayMonthlyPlanId: plan.razorpayMonthlyPlanId,
    razorpayYearlyPlanId: plan.razorpayYearlyPlanId,
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
    analytics: plan.analytics,
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

export function getDefaultCreditAddonPackSeeds() {
  return Object.values(CREDIT_ADDON_PACK_DEFINITIONS);
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
