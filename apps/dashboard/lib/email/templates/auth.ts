import { renderBrandedEmail, type EmailTemplate } from "./base";

export function passwordResetEmail(input: {
  userName: string;
  resetUrl: string;
}): EmailTemplate {
  return {
    subject: "Reset your TryNotifly password",
    html: renderBrandedEmail({
      title: "Reset your password",
      preview: "Use this secure link to choose a new TryNotifly password.",
      body: [
        `Hi ${input.userName || "there"},`,
        "We received a request to reset your TryNotifly password. This link expires soon and can be used only once.",
        "If you did not request this, you can safely ignore this email.",
      ],
      cta: {
        label: "Reset password",
        url: input.resetUrl,
      },
    }),
    text: `Reset your TryNotifly password: ${input.resetUrl}`,
  };
}

export function verificationEmail(input: {
  userName: string;
  verificationUrl: string;
}): EmailTemplate {
  return {
    subject: "Verify your TryNotifly email",
    html: renderBrandedEmail({
      title: "Verify your email",
      preview: "Confirm this email address for your TryNotifly account.",
      body: [
        `Hi ${input.userName || "there"},`,
        "Confirm this email address so we can keep your account secure and deliver important workspace updates.",
      ],
      cta: {
        label: "Verify email",
        url: input.verificationUrl,
      },
    }),
    text: `Verify your TryNotifly email: ${input.verificationUrl}`,
  };
}

export function welcomeEmail(input: {
  userName: string;
  dashboardUrl: string;
  organizationName: string;
}): EmailTemplate {
  return {
    subject: "Welcome to TryNotifly",
    html: renderBrandedEmail({
      title: "Your workspace is ready",
      preview: "TryNotifly onboarding is complete.",
      body: [
        `Hi ${input.userName || "there"},`,
        `${input.organizationName} is ready to send notifications. You can now configure channels, API keys, and sending domains from the dashboard.`,
      ],
      cta: {
        label: "Open dashboard",
        url: input.dashboardUrl,
      },
    }),
    text: `Your TryNotifly workspace is ready: ${input.dashboardUrl}`,
  };
}
