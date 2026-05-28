export const industryOptions = [
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "fintech", label: "Fintech" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "marketplace", label: "Marketplace" },
  { value: "other", label: "Other" },
];

export const useCaseOptions = [
  { value: "transactional", label: "Transactional notifications" },
  { value: "marketing", label: "Marketing campaigns" },
  { value: "product", label: "Product lifecycle messaging" },
  { value: "alerts", label: "Operational alerts" },
  { value: "support", label: "Support and account updates" },
];

export const teamSizeOptions = [
  { value: "1", label: "Just me" },
  { value: "2-10", label: "2-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201+", label: "201+" },
];

export const timezoneOptions = [
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Central Europe" },
  { value: "UTC", label: "UTC" },
];

export const expectedVolumeOptions = [
  { value: "0-10k", label: "0-10k per month" },
  { value: "10k-100k", label: "10k-100k per month" },
  { value: "100k-1m", label: "100k-1M per month" },
  { value: "1m+", label: "1M+ per month" },
];

export const platformUseOptions = [
  { value: "email-first", label: "Email-first product messaging" },
  { value: "multi-channel", label: "Multi-channel notifications" },
  { value: "developer-api", label: "Developer notification API" },
  { value: "customer-engagement", label: "Customer engagement workflows" },
];

export const teamRoleOptions = [
  { value: "founder", label: "Founder" },
  { value: "engineer", label: "Engineer" },
  { value: "product", label: "Product" },
  { value: "growth", label: "Growth or marketing" },
  { value: "ops", label: "Operations" },
];

export const experienceLevelOptions = [
  { value: "new", label: "New to notification infrastructure" },
  { value: "some", label: "Used email or SMS APIs before" },
  { value: "advanced", label: "Scaling an existing system" },
];

export const channelOptions = [
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "PUSH", label: "Push" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "IN_APP", label: "In-app" },
] as const;
