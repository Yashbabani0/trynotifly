import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { dash, sentinel } from "@better-auth/infra";
import { oneTap, organization } from "better-auth/plugins";
import * as authschema from "@trynotifly/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  passwordResetRateLimit,
  sendInvitationRateLimit,
  verificationEmailRateLimit,
} from "./ratelimit";
import { sendVerificationEmail } from "@/lib/mail/send-verification-email";
import { sendPasswordResetEmail } from "../mail/send-resetPassword-email";

import { sendInvitationEmail } from "../mail/send-sendInvitation-email";

// import { resend } from "@/lib/resend";

export const auth = betterAuth({
  database: drizzleAdapter(authschema.db, {
    provider: "pg",
    schema: authschema,
  }),

  appName: "TryNotifly",

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [
          "https://dashboard.trynotifly.com",
          "https://trynotifly.com",
          "https://docs.trynotifly.com",
        ]
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
        ],

  emailAndPassword: {
    enabled: true,

    minPasswordLength: 8,

    maxPasswordLength: 64,

    requireEmailVerification: true,

    autoSignIn: true,

    revokeSessionsOnPasswordReset: true,

    resetPasswordTokenExpiresIn: 60 * 60,

    sendResetPassword: async ({ user, url }) => {
      const { success } = await passwordResetRateLimit.limit(user.email);
      if (!success) {
        throw new Error("Too many password reset emails sent.");
      }
      await sendPasswordResetEmail(user.email, url);
    },
    onExistingUserSignUp: () => {
      throw new Error(
        "If further action is required, instructions will be sent to your email.",
      );
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },

    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,

      activityTracking: {
        enabled: true,
        updateInterval: 300000,
      },
    }),

    sentinel({
      apiKey: process.env.BETTER_AUTH_API_KEY,

      security: {
        credentialStuffing: {
          enabled: true,

          thresholds: {
            challenge: 5,
            block: 10,
          },
        },

        velocity: {
          enabled: true,
          maxSignupsPerVisitor: 5,
          maxSignInsPerIp: 5,
          action: "challenge",
          maxPasswordResetsPerIp: 5,
        },

        botBlocking: {
          action: "challenge",
        },

        suspiciousIpBlocking: {
          action: "block",
        },

        emailValidation: {
          enabled: true,
          strictness: "medium",
          action: "block",
        },
      },
    }),

    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      organizationLimit: 5,
      membershipLimit: 50,
      invitationExpiresIn: 7 * 24 * 60 * 60,
      requireEmailVerificationOnInvitation: true,
      cancelPendingInvitationsOnReInvite: true,
      disableOrganizationDeletion: false,

      sendInvitationEmail: async ({
        email,
        organization,
        invitation,
        inviter,
      }) => {
        const { success } = await sendInvitationRateLimit.limit(email);

        if (!success) {
          throw new Error("Too many invitations sent. Please try again later.");
        }

        const inviteUrl = `${process.env.BETTER_AUTH_URL}/accept-invitation/${invitation.id}`;

        await sendInvitationEmail(
          organization.name,
          inviteUrl,
          email,
          inviter.user.name,
        );
      },
    }),

    oneTap({
      clientId: process.env.GOOGLE_CLIENT_ID!,
    }),

    nextCookies(),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days

    updateAge: 60 * 60 * 24, // 1 day

    cookieCache: {
      enabled: true,
      strategy: "jwe",
      maxAge: 60 * 5, // 5 minutes
    },
  },

  account: {
    modelName: "account",
    storeAccountCookie: true,
    encryptOAuthTokens: true,

    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"],
      allowDifferentEmails: false,
    },
  },

  advanced: {
    crossSubDomainCookies:
      process.env.NODE_ENV === "production"
        ? {
            enabled: true,
            domain: ".trynotifly.com",
          }
        : undefined,

    cookiePrefix: "trynotifly_",

    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",

      httpOnly: true,

      sameSite: "lax",

      path: "/",
    },

    database: {
      generateId: "uuid",

      defaultFindManyLimit: 100,
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    expiresIn: 60 * 60,

    sendVerificationEmail: async ({ user, url }) => {
      const { success } = await verificationEmailRateLimit.limit(user.email);

      if (!success) {
        throw new Error("Too many verification emails sent.");
      }
      await sendVerificationEmail(user.email, url);
    },
  },

  ipAddress: {
    ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
  },

  experimental: {
    joins: true, // Enable database joins for better performance
  },
});
