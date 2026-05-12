import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { dash, sentinel } from "@better-auth/infra";
import { oneTap, organization } from "better-auth/plugins";
import * as authschema from "@trynotifly/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { resend } from "../resend";

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
      /**
       * TODO:
       * Send password reset email using Resend
       */

      console.log("Send reset password email", {
        email: user.email,
        url,
      });

      // Example:
      // await resend.emails.send({
      //   from: "TryNotifly <noreply@trynotifly.com>",
      //   to: user.email,
      //   subject: "Reset your password",
      //   html: `<a href="${url}">Reset Password</a>`,
      // });
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
          action: "challenge",
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
      await resend.emails.send({
        from: "TryNotifly <noreply@yashbabani.com>",
        to: user.email,
        subject: "Verify your email",
        html: `
      <div>
        <h1>Verify your email</h1>

        <p>
          Click the button below to verify your account.
        </p>

        <a href="${url}">
          Verify Email
        </a>
      </div>
    `,
      });
    },
  },

  user: {
    deleteUser: {
      enabled: true,

      sendDeleteAccountVerification: async ({ user, url }) => {
        /**
         * TODO:
         * Send delete confirmation email
         */

        console.log("Delete account verification", {
          email: user.email,
          url,
        });
      },

      beforeDelete: async (user) => {
        /**
         * TODO:
         * Cleanup before deletion
         *
         * Example:
         * - revoke API keys
         * - delete workspaces
         * - remove uploads
         * - cancel subscriptions
         */
      },

      afterDelete: async (user) => {
        /**
         * TODO:
         * Post-delete cleanup/logging
         */
      },
    },
  },

  ipAddress: {
    ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
  },

  experimental: {
    joins: true, // Enable database joins for better performance
  },
});
