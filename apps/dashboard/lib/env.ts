import { z } from "zod";

const serverEnvSchema = z.object({
  BETTER_AUTH_API_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
});

const emailEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(3).default("TryNotifly <notifications@trynotifly.com>"),
  APP_URL: z.string().url().default(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
});

const razorpayEnvSchema = z.object({
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
});

export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid auth environment", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid auth environment configuration.");
  }

  return parsed.data;
}

export function getEmailEnv() {
  const parsed = emailEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid email environment", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid email environment configuration.");
  }

  return parsed.data;
}

export function getRazorpayEnv() {
  const parsed = razorpayEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid Razorpay environment", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid Razorpay environment configuration.");
  }

  return parsed.data;
}
