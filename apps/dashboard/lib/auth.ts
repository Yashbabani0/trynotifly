import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./auth-schema";
import { dash, sentinel } from "@better-auth/infra";

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), {
  schema,
});

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: "http://localhost:3000/",
  emailAndPassword: { enabled: true },
  account: {
    modelName: "account",
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"],
    },
    storeAccountCookie: true,
    storeStateStrategy: "cookie",
  },
  advanced: {
    cookiePrefix: "TryNotiflyDashboard",
    useSecureCookies: true,
    ipAddress: {
      disableIpTracking: false,
    },
  },
  rateLimit: {
    modelName: "rate_limit",
    enabled: true,
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    storage: "memory",
  },
  secret: process.env.AUTH_SECRET!,
  session: {
    modelName: "session",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    freshAge: 60 * 60, // 1 hour
    updateAge: 60 * 60 * 24, // 1 day
  },
  appName: "TryNotifly Dashboard",
  basePath: "/auth",
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    dash({
      apiKey: process.env.DASH_API_KEY!,
      activityTracking: { enabled: true, updateInterval: 5000 },
      apiTimeout: 5000,
    }),
    sentinel({
      apiKey: process.env.SENTINEL_API_KEY!,
      security: {
        botBlocking: { action: "challenge" },
        compromisedPassword: {
          enabled: true,
          action: "challenge",
          minBreachCount: 10,
        },
        emailValidation: { enabled: true, strictness: "medium" },
        suspiciousIpBlocking: { action: "challenge" },
        velocity: {
          enabled: true,
          maxPasswordResetsPerIp: 5,
          maxSignInsPerIp: 10,
          maxSignupsPerVisitor: 5,
          action: "challenge",
          windowSeconds: 60 * 60, // 1 hour
        },
      },
    }),
  ],
});
