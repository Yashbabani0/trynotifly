import { betterAuth } from "better-auth";
import { db } from "@trynotifly/db";
import * as auth_schema from "@/auth-schema";
import { dash, sentinel } from "@better-auth/infra";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: auth_schema,
    debugLogs: process.env.NODE_ENV === "development" ? true : false,
  }),
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 64,
    onExistingUserSignUp: () => {
      throw new Error(
        "If an account exists for this email, further instructions have been sent.",
      );
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
    revokeSessionsOnPasswordReset: true,
  },
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
      ipAddressHeaders: ["x-vercel-forwarded-for", "x-forwarded-for"],
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      ...(process.env.NODE_ENV === "production"
        ? {
            domain: ".trynotifly.com",
          }
        : {}),
    },
  },
  rateLimit: {
    modelName: "rate_limit",
    enabled: true,
    max: 100,
    storage: "memory", // For production, will add a robust storage like Redis
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  session: {
    modelName: "session",
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
      apiKey: process.env.BETTER_AUTH_API_KEY!,
      activityTracking: { enabled: true, updateInterval: 300000 },
      apiTimeout: 5000,
    }),
    sentinel({
      apiKey: process.env.BETTER_AUTH_API_KEY!,
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
    organization({
      allowUserToCreateOrganization: true,
      organizationModelName: "organization",
      membershipModelName: "organization_membership",
      creatorRole: "owner",
      invitationExpiresIn: 60 * 60 * 24, // 24 hours
      invitationLimit: 10,
      membershipLimit: 100,
      organizationLimit: 1,
      cancelPendingInvitationsOnReInvite: true,
    }),
  ],
  experimental: {
    joins: true,
  },
});
