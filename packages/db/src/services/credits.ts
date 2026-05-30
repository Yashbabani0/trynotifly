export type NotificationCreditChannel = "email" | "appPush" | "sms" | "whatsapp";
export type WhatsAppCreditCategory =
  | "auth"
  | "utility"
  | "service"
  | "marketing";

const CREDIT_UNITS_PER_CREDIT = 10;

export function creditsToUnits(credits: number) {
  return credits * CREDIT_UNITS_PER_CREDIT;
}

export function unitsToCredits(units: number) {
  return units / CREDIT_UNITS_PER_CREDIT;
}

export function calculateNotificationCreditCost(input: {
  channel: NotificationCreditChannel;
  whatsappCategory?: WhatsAppCreditCategory;
}) {
  if (input.channel === "email") {
    return { credits: 1, units: 10 };
  }

  if (input.channel === "appPush") {
    return { credits: 0.2, units: 2 };
  }

  if (input.channel === "sms") {
    return { credits: 10, units: 100 };
  }

  if (input.whatsappCategory === "marketing") {
    return { credits: 20, units: 200 };
  }

  return { credits: 5, units: 50 };
}
