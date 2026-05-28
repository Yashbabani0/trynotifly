import { pgEnum } from "drizzle-orm/pg-core";

export const notificationChannel = pgEnum("notification_channel", [
  "SMS",
  "EMAIL",
  "PUSH",
  "WHATSAPP",
]);
