import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const verificationEmailRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(3, "15 m"),

  analytics: true,

  prefix: "ratelimit:verify-email",
});

export const passwordResetRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(3, "15 m"),

  analytics: true,

  prefix: "ratelimit:password-reset",
});

export const signInRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(5, "10 m"),

  analytics: true,

  prefix: "ratelimit:sign-in",
});

export const signUpRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(3, "10 m"),

  analytics: true,

  prefix: "ratelimit:sign-up",
});

export const deleteAccountRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(3, "10 m"),

  analytics: true,

  prefix: "ratelimit:delete-account",
});

export const sendInvitationRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(10, "10 m"),

  analytics: true,

  prefix: "ratelimit:send-invitation",
});
